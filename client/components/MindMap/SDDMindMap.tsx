import React, { useEffect, useState } from 'react';
import MindMapCanvas from './MindMapCanvas';
import MindMapManager from './MindMapManager';
import { useMindMap } from '../../hooks/useMindMap';
import { sddMindMapData } from '../../data/sdd-mindmap-data';
import './SDDMindMap.css';

// API 基礎 URL
const API_BASE_URL = '/api';
const DEFAULT_MINDMAP_ID = 'sdd-mindmap';

// 固定的 config，避免每次渲染都創建新對象
const MINDMAP_CONFIG = {
  layout: 'horizontal' as const,
  animated: true,
  minimap: true,
  controls: true,
};

/**
 * SDD+AI 開發方案計劃書專屬心智圖
 */
const SDDMindMap: React.FC = () => {
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
  } = useMindMap(undefined, MINDMAP_CONFIG);

  const [stats, setStats] = useState({
    totalNodes: 0,
    phases: 7,
    agents: 7,
    milestones: 7,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [currentMindMapId, setCurrentMindMapId] = useState(DEFAULT_MINDMAP_ID);
  const [currentMindMapName, setCurrentMindMapName] = useState('SDD+AI 開發方案');

  // 載入 SDD 心智圖資料 - 只執行一次
  useEffect(() => {
    if (isInitialized) return;

    const loadLayout = async () => {
      try {
        // 從後端載入保存的布局
        const response = await fetch(`${API_BASE_URL}/mindmap/layout/${currentMindMapId}`);
        const data = await response.json();
        
        if (data.success && data.layout && (data.layout.nodes?.length || 0) > 0) {
          console.log('📍 Loading saved layout from server:', data.layout.nodes.length, 'nodes');
          initializeData({
            nodes: data.layout.nodes,
            edges: data.layout.edges || sddMindMapData.edges,
          });
        } else {
          // 沒有保存的布局，使用預設
          console.log('📊 Using default layout');
          initializeData(sddMindMapData);
        }
      } catch (error) {
        console.error('Failed to load layout from server:', error);
        // 載入失敗，使用預設布局
        initializeData(sddMindMapData);
      } finally {
        setIsInitialized(true);
      }
    };

    loadLayout();
    
    // 計算統計資訊
    setStats({
      totalNodes: sddMindMapData.nodes.length,
      phases: sddMindMapData.nodes.filter(n => n.id.startsWith('phase')).length,
      agents: sddMindMapData.nodes.filter(n => n.id.startsWith('agent-')).length,
      milestones: sddMindMapData.nodes.filter(n => n.id.startsWith('milestone-')).length,
    });
  }, []); // 只執行一次，避免無限循環

  const handleSelectMindMap = async (id: string, name: string) => {
    setCurrentMindMapId(id);
    setCurrentMindMapName(name);
    setShowManager(false);
    setIsInitialized(false);
    
    // 重新載入選中的心智圖
    try {
      const response = await fetch(`${API_BASE_URL}/mindmap/layout/${id}`);
      const data = await response.json();
      
      if (data.success && data.layout && (data.layout.nodes?.length || 0) > 0) {
        console.log('📍 Loading layout for:', name);
        initializeData({
          nodes: data.layout.nodes,
          edges: data.layout.edges || sddMindMapData.edges,
        });
      } else {
        // 沒有布局資料，使用預設
        initializeData(sddMindMapData);
      }
    } catch (error) {
      console.error('Failed to load mindmap:', error);
      initializeData(sddMindMapData);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sdd-ai-mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenDoc = () => {
    window.open('/docs/SDD+AI-開發方案計劃書.md', '_blank');
  };

  // 處理節點位置變更並保存到後端
  const handleNodesChange = async (updatedNodes: any[]) => {
    // 保持本地 hook 狀態同步，避免重掛載時樣式遺失
    syncNodes(updatedNodes);
    try {
      // 保存完整節點與邊到後端（包含樣式與類型等 data）
      const response = await fetch(`${API_BASE_URL}/mindmap/layout/${currentMindMapId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout: { 
          nodes: updatedNodes.map((n) => ({ ...n.data, position: n.position })), 
          edges: edges.map((e) => ({ ...e, sourceHandle: (e as any).sourceHandle, targetHandle: (e as any).targetHandle })) 
        } }),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Layout saved to server');
      }
    } catch (error) {
      console.error('❌ Failed to save layout to server:', error);
    }
  };

  const handleEdgesChange = async (updatedEdges: any[]) => {
    // 同步 hook 狀態
    syncEdges(updatedEdges);
    try {
      const payload = {
        nodes: nodes.map((n) => ({ ...n.data, position: n.position })),
        edges: updatedEdges.map((e) => ({
          ...e,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
      };
      const response = await fetch(`${API_BASE_URL}/mindmap/layout/${currentMindMapId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: payload }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('✅ Edges saved to server');
      }
    } catch (error) {
      console.error('❌ Failed to save edges to server:', error);
    }
  };

  const handleSaveLayout = async () => {
    const payload = { 
      nodes: nodes.map((n) => ({ ...n.data, position: n.position })), 
      edges: edges.map((e) => ({ ...e, sourceHandle: (e as any).sourceHandle, targetHandle: (e as any).targetHandle }))
    };
    try {
      const response = await fetch(`${API_BASE_URL}/mindmap/layout/${currentMindMapId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout: payload }),
      });
      
      const data = await response.json();
      if (data.success) {
        // 同時匯出 JSON
        handleExport();
        alert('✅ 心智圖布局已保存到伺服器！');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ 保存失敗，請檢查後端伺服器是否運行');
    }
  };

  const handleResetLayout = async () => {
    try {
      // 刪除後端的布局檔案
      await fetch(`${API_BASE_URL}/mindmap/layout/${currentMindMapId}`, {
        method: 'DELETE',
      });
      
      // 重新布局
      relayout();
      alert('✅ 已重置為預設布局！');
    } catch (error) {
      console.error('Reset error:', error);
      // 即使刪除失敗也重新布局
      relayout();
      alert('✅ 已重置為預設布局！');
    }
  };

  return (
    <div className="sdd-mindmap">
      <div className="sdd-mindmap-header">
        <div className="sdd-mindmap-title">
          <h1>🎰 {currentMindMapName}</h1>
        </div>

        <div className="sdd-mindmap-actions">
          <button onClick={() => setShowManager(true)} className="btn-action">
            📁 心智圖管理
          </button>
          <button onClick={handleResetLayout} className="btn-action">
            🔄 重置布局
          </button>
          <button onClick={handleSaveLayout} className="btn-action">
            💾 保存布局
          </button>
          <button onClick={handleOpenDoc} className="btn-action btn-primary">
            📄 查看原文檔
          </button>
        </div>
      </div>

      <div className="sdd-mindmap-canvas-fullscreen">
        <MindMapCanvas
          initialNodes={nodes}
          initialEdges={edges}
          config={{
            layout: 'horizontal',
            animated: true,
            minimap: true,
            controls: true,
            zoomOnScroll: true,
            panOnDrag: true,
            nodesDraggable: true,
          }}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onAddNode={(parentId, nodeData) => {
            console.log('🆕 Adding new node to parent:', parentId);
            addNode(parentId, nodeData, (updatedNodes) => {
              console.log('✅ Node added, saving layout...');
              handleNodesChange(updatedNodes);
            });
          }}
          onDeleteNode={(nodeId) => {
            console.log('🗑️ Deleting node:', nodeId);
            deleteNode(nodeId, (updatedNodes) => {
              console.log('✅ Node deleted, saving layout...');
              handleNodesChange(updatedNodes);
            });
          }}
        />
      </div>

      {showManager && (
        <MindMapManager
          apiBaseUrl={API_BASE_URL}
          onSelectMindMap={handleSelectMindMap}
          onClose={() => setShowManager(false)}
          currentMindMapId={currentMindMapId}
        />
      )}
    </div>
  );
};

export default SDDMindMap;
