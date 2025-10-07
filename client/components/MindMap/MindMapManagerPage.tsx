import React, { useState, useEffect } from 'react';
import type { Node as FlowNode, Edge as FlowEdge } from 'reactflow';
import MindMapManager from './MindMapManager';
import MindMapCanvas from './MindMapCanvas';
import { useMindMap } from '../../hooks/useMindMap';
import { MindMapData, MindMapNode, MindMapEdge } from '../../types/mindmap';

const API_BASE_URL = '/api';

interface MindMapManagerPageProps {
  onClose?: () => void;
  initialMindMapId?: string;
}

const normalizeMindMapData = (layout: any): MindMapData => {
  if (!layout) {
    return { nodes: [], edges: [] };
  }

  if (Array.isArray(layout.nodes) && Array.isArray(layout.edges)) {
    const edges: MindMapEdge[] = layout.edges.map((edge: any, index: number) => ({
      id: edge.id ?? `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      style: edge.style,
    }));

    const edgeSources = new Set(edges.map((edge) => edge.source));

    const nodes: MindMapNode[] = layout.nodes.map((node: any) => {
      const rawData = node && typeof node.data === 'object' ? { ...node.data } : {};
      const labelCandidates = [node.label, rawData.label, node.id];
      const label = labelCandidates
        .map((value) => (typeof value === 'string' ? value.trim() : undefined))
        .find((value) => value && value.length > 0) ?? node.id;

      if (rawData.label) {
        delete rawData.label;
      }

      const rawType = node.type;
      let resolvedType: MindMapNode['type'];
      if (rawType === 'root' || rawType === 'branch' || rawType === 'leaf') {
        resolvedType = rawType;
      } else if (node.id === 'root') {
        resolvedType = 'root';
      } else if (edgeSources.has(node.id)) {
        resolvedType = 'branch';
      } else {
        resolvedType = 'leaf';
      }

      const position = node.position ?? layout.layout?.[node.id];
      const hasPosition = position && typeof position.x === 'number' && typeof position.y === 'number';

      const normalizedNode: MindMapNode = {
        id: node.id,
        label,
        type: resolvedType,
        data: Object.keys(rawData).length ? rawData : undefined,
        style: node.style ?? rawData.style,
      };

      if (hasPosition) {
        normalizedNode.position = position;
      }

      return normalizedNode;
    });

    return { nodes, edges };
  }

  if (layout.layout && typeof layout.layout === 'object') {
    const entries = Object.entries(layout.layout);
    const nodes: MindMapNode[] = entries.map(([id, position]: [string, any]) => ({
      id,
      label: id,
      type: id === 'root' ? 'root' : 'leaf',
      position,
    }));
    const edges: MindMapEdge[] = Array.isArray(layout.edges)
      ? layout.edges.map((edge: any, index: number) => ({
          id: edge.id ?? `edge-${index}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          style: edge.style,
        }))
      : [];

    return { nodes, edges };
  }

  return { nodes: [], edges: [] };
};

const buildPayloadFromReactFlow = (rfNodes: FlowNode[], rfEdges: FlowEdge[]): MindMapData => {
  const edgeSources = new Set(rfEdges.map((edge) => edge.source));

    const nodes: MindMapNode[] = rfNodes.map((node) => {
      const nodeData = (node.data || {}) as Partial<MindMapNode>;
    const rawData = nodeData.data && typeof nodeData.data === 'object' ? { ...nodeData.data } : {};
      const labelCandidates = [nodeData.label, rawData.label, node.id];
      const label = labelCandidates
        .map((value) => (typeof value === 'string' ? value.trim() : undefined))
        .find((value) => value && value.length > 0) ?? node.id;

    if (rawData.label) {
      delete rawData.label;
    }

      const rawType = nodeData.type;
      let resolvedType: MindMapNode['type'];
      if (rawType === 'root' || rawType === 'branch' || rawType === 'leaf') {
        resolvedType = rawType;
      } else if (node.id === 'root') {
        resolvedType = 'root';
      } else if (edgeSources.has(node.id)) {
        resolvedType = 'branch';
      } else {
        resolvedType = 'leaf';
      }

    const normalizedNode: MindMapNode = {
      id: node.id,
      label,
      type: resolvedType,
      data: Object.keys(rawData).length ? rawData : undefined,
      style: nodeData.style,
      position: node.position,
    };

    return normalizedNode;
  });

  const edges: MindMapEdge[] = rfEdges.map((edge, index) => ({
    id: edge.id ?? `edge-${index}`,
    source: edge.source,
    target: edge.target,
    label: typeof edge.label === 'string' ? edge.label : undefined,
    style: edge.style as MindMapEdge['style'],
  }));

  return { nodes, edges };
};

/**
 * 心智圖管理頁面
 * 提供完整的心智圖管理功能：新增、刪除、編輯
 */
const MindMapManagerPage: React.FC<MindMapManagerPageProps> = ({ onClose, initialMindMapId }) => {
  const [showManager, setShowManager] = useState(true);
  const [currentMindMapId, setCurrentMindMapId] = useState<string | null>(null);
  const [currentMindMapName, setCurrentMindMapName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  const {
    nodes,
    edges,
    exportData,
    relayout,
    initializeData,
    addNode,
    deleteNode,
    syncNodes,
    syncEdges,
  } = useMindMap();

  const handleSelectMindMap = (id: string, name: string) => {
    console.log('🎯 Opening mindmap:', id, name);
    setCurrentMindMapId(id);
    setCurrentMindMapName(name);
    setShowManager(false);
  };

  const saveMindMap = async (payload: MindMapData) => {
    if (!currentMindMapId) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/mindmap/layout/${currentMindMapId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout: payload }),
      });
      console.log('💾 Layout saved');
    } catch (error) {
      console.error('❌ Failed to save layout:', error);
    }
  };

  const persistMindMapState = async (nextNodes: FlowNode[], nextEdges: FlowEdge[]) => {
    if (!currentMindMapId) {
      return;
    }

    syncNodes(nextNodes);
    syncEdges(nextEdges);
    const payload = buildPayloadFromReactFlow(nextNodes, nextEdges);
    await saveMindMap(payload);
  };

  // 如果有指定初始心智圖 ID，自動載入並開啟
  useEffect(() => {
    if (initialMindMapId) {
      const loadInitialMindMap = async () => {
        try {
          console.log('🔍 Loading initial mindmap:', initialMindMapId);
          const response = await fetch(`${API_BASE_URL}/mindmap/metadata/${initialMindMapId}`);
          const data = await response.json();
          
          if (data.success && data.metadata) {
            console.log('✅ Loaded mindmap metadata:', data.metadata);
            handleSelectMindMap(initialMindMapId, data.metadata.name);
          } else {
            console.error('❌ Failed to load mindmap metadata:', data);
          }
        } catch (error) {
          console.error('❌ Error loading initial mindmap:', error);
        }
      };

      loadInitialMindMap();
    }
  }, [initialMindMapId]);

  const handleBackToManager = () => {
    setShowManager(true);
    setCurrentMindMapId(null);
  };

  // 開始編輯名稱
  const handleStartEditingName = () => {
    setIsEditingName(true);
    setEditingNameValue(currentMindMapName);
  };

  // 保存名稱
  const handleSaveName = async () => {
    if (!currentMindMapId || !editingNameValue.trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mindmap/metadata/${currentMindMapId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingNameValue.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentMindMapName(editingNameValue.trim());
        console.log('✅ Name updated:', editingNameValue);
      } else {
        alert('更新名稱失敗');
      }
    } catch (error) {
      console.error('Failed to update name:', error);
      alert('更新名稱失敗');
    } finally {
      setIsEditingName(false);
    }
  };

  // 取消編輯
  const handleCancelEditingName = () => {
    setIsEditingName(false);
    setEditingNameValue('');
  };

  // 處理鍵盤事件
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditingName();
    }
  };

  // 當選擇心智圖時，載入其資料
  useEffect(() => {
    if (!currentMindMapId || showManager) return;

    const loadMindMapData = async () => {
      try {
        console.log('📍 Loading mindmap data:', currentMindMapId);
        const response = await fetch(`${API_BASE_URL}/mindmap/layout/${currentMindMapId}`);
        const data = await response.json();

        if (data.success && data.layout) {
          const normalized = normalizeMindMapData(data.layout);
          console.log('📊 Normalized layout with', normalized.nodes.length, 'nodes and', normalized.edges.length, 'edges');
          initializeData(normalized);
        } else {
          console.log('📊 No layout data, initializing empty');
          initializeData({ nodes: [], edges: [] });
        }
      } catch (error) {
        console.error('❌ Failed to load mindmap:', error);
        initializeData({ nodes: [], edges: [] });
      }
    };

    loadMindMapData();
  }, [currentMindMapId, showManager]);

  // 處理節點變更並自動保存
  const handleNodesChange = async (updatedNodes: FlowNode[]) => {
    if (!currentMindMapId) {
      return;
    }

    await persistMindMapState(updatedNodes, edges);
  };

  const handleEdgesChange = async (updatedEdges: FlowEdge[]) => {
    if (!currentMindMapId) {
      return;
    }

    await persistMindMapState(nodes, updatedEdges);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {showManager ? (
        <MindMapManager
          apiBaseUrl={API_BASE_URL}
          onSelectMindMap={handleSelectMindMap}
          onClose={onClose || (() => {})}
          currentMindMapId={currentMindMapId || undefined}
        />
      ) : (
        <>
          <div style={{ 
            padding: '1rem 2rem',
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleBackToManager}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                ← 返回管理器
              </button>
              
              {/* 可編輯的心智圖名稱 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span>
                {isEditingName ? (
                  <input
                    type="text"
                    value={editingNameValue}
                    onChange={(e) => setEditingNameValue(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      padding: '4px 12px',
                      border: '2px solid #667eea',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#f7fafc',
                      color: '#2d3748',
                      minWidth: '200px',
                    }}
                  />
                ) : (
                  <div
                    onClick={handleStartEditingName}
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      padding: '4px 12px',
                      background: '#e2e8f0',
                      color: '#2d3748',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#cbd5e0';
                      e.currentTarget.style.borderColor = '#a0aec0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#e2e8f0';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {currentMindMapName}
                  </div>
                )}
                {!isEditingName && (
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: '#718096',
                    fontStyle: 'italic' 
                  }}>
                    (點擊編輯)
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => relayout()}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                🔄 重新布局
              </button>
              <button
                onClick={() => {
                  const data = exportData();
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${currentMindMapId}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                💾 匯出
              </button>
            </div>
          </div>
          <div style={{ height: 'calc(100vh - 70px)' }}>
            <MindMapCanvas
              initialNodes={nodes}
              initialEdges={edges}
              config={{
                layout: 'horizontal',
                animated: true,
                minimap: true,
                controls: true,
              }}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onAddNode={(parentId: string, nodeData: any) => {
                addNode(parentId, nodeData, (updatedNodes, updatedEdges) => {
                  persistMindMapState(updatedNodes, updatedEdges);
                });
              }}
              onDeleteNode={(nodeId: string) => {
                deleteNode(nodeId, (updatedNodes, updatedEdges) => {
                  persistMindMapState(updatedNodes, updatedEdges);
                });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MindMapManagerPage;
