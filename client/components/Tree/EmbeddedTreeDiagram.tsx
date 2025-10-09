import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, Position, ReactFlowInstance, getSmoothStepPath, MarkerType, EdgeProps, BaseEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import './EmbeddedTreeDiagram.css';
import dagre from 'dagre';
import { TreeNode, TreeNodeMetadata, BlendMode, Coordinate3D } from './TreeDiagram';

export type EmbeddedTreeDiagramProps = {
  data: TreeNode;
  direction?: 'LR' | 'TB';
  onNodeUpdate?: (nodeId: string, updates: Partial<TreeNode>) => void;
  onAddNode?: (parentNodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
};

const nodeDefaults = { width: 200, height: 56 };

// Dark 模式配色
const depthPalette = [
  { bg: '#312e81', border: '#818cf8', text: '#c7d2fe' },
  { bg: '#164e63', border: '#22d3ee', text: '#a5f3fc' },
  { bg: '#14532d', border: '#4ade80', text: '#bbf7d0' },
  { bg: '#7c2d12', border: '#fb923c', text: '#fed7aa' },
  { bg: '#831843', border: '#f472b6', text: '#fbcfe8' },
  { bg: '#334155', border: '#94a3b8', text: '#cbd5e1' },
];

function styleForDepth(depth: number) {
  const c = depthPalette[depth % depthPalette.length];
  return {
    background: c.bg,
    border: `2px solid ${c.border}`,
    color: c.text,
    fontWeight: depth === 0 ? '600' : '500',
  } as React.CSSProperties;
}

function edgeStyleForDepth(depth: number) {
  const c = depthPalette[depth % depthPalette.length];
  const strokeWidth = Math.max(1.5, 1.5 + depth * 0.6);
  return { stroke: c.border, strokeWidth, opacity: 0.9 };
}

function layoutTree(root: TreeNode, dir: 'LR' | 'TB', nodeSize = nodeDefaults) {
  const g = new dagre.graphlib.Graph();
  const nodesep = dir === 'TB' ? 50 : 40;
  const ranksep = dir === 'TB' ? 80 : 60;
  
  g.setGraph({ 
    rankdir: dir, 
    nodesep, 
    ranksep,
    align: 'DL',
    ranker: 'tight-tree'
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const depthMap = new Map<string, number>();

  function traverse(node: TreeNode, parentId: string | null = null, depth = 0) {
    const nodeId = node.id;
    depthMap.set(nodeId, depth);

    g.setNode(nodeId, { width: nodeSize.width, height: nodeSize.height });
    
    const style = styleForDepth(depth);
    nodes.push({
      id: nodeId,
      type: 'default',
      data: { label: node.label, depth, treeNode: node },
      position: { x: 0, y: 0 },
      style: {
        ...style,
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: `${nodeSize.width}px`,
        minHeight: `${nodeSize.height}px`,
      },
      sourcePosition: dir === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: dir === 'LR' ? Position.Left : Position.Top,
    });

    if (parentId !== null) {
      const parentDepth = depthMap.get(parentId) ?? 0;
      const edgeStyle = edgeStyleForDepth(parentDepth);
      
      g.setEdge(parentId, nodeId);
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        style: edgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeStyle.stroke as string,
          width: 20,
          height: 20,
        },
      });
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child, nodeId, depth + 1);
      }
    }
  }

  traverse(root);
  dagre.layout(g);

  nodes.forEach((node) => {
    const dagreNode = g.node(node.id);
    node.position = {
      x: dagreNode.x - nodeSize.width / 2,
      y: dagreNode.y - nodeSize.height / 2,
    };
  });

  return { nodes, edges };
}

const EmbeddedTreeDiagram: React.FC<EmbeddedTreeDiagramProps> = ({
  data,
  direction = 'LR',
  onNodeUpdate,
  onAddNode,
  onDeleteNode,
}) => {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: Node } | null>(null);

  const { nodes, edges } = useMemo(() => {
    return layoutTree(data, direction);
  }, [data, direction]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 0);
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setEditLabel(node.data.label);
    setIsEditing(true);
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleLabelSave = useCallback(() => {
    if (selectedNode && onNodeUpdate) {
      onNodeUpdate(selectedNode.id, { label: editLabel });
    }
    setIsEditing(false);
  }, [selectedNode, editLabel, onNodeUpdate]);

  const handleAddChild = useCallback(() => {
    if (contextMenu?.node && onAddNode) {
      onAddNode(contextMenu.node.id);
    }
    closeContextMenu();
  }, [contextMenu, onAddNode, closeContextMenu]);

  const handleDelete = useCallback(() => {
    if (contextMenu?.node && onDeleteNode) {
      onDeleteNode(contextMenu.node.id);
    }
    closeContextMenu();
  }, [contextMenu, onDeleteNode, closeContextMenu]);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedNode) return;

      if (event.key === 'Tab' && onAddNode) {
        event.preventDefault();
        onAddNode(selectedNode.id);
      } else if (event.key === 'Delete' && onDeleteNode && selectedNode.id !== data.id) {
        event.preventDefault();
        onDeleteNode(selectedNode.id);
      } else if (event.key === 'Escape') {
        setIsEditing(false);
        setSelectedNode(null);
        closeContextMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, onAddNode, onDeleteNode, data.id, closeContextMenu]);

  // 點擊外部關閉選單
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => closeContextMenu();
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu, closeContextMenu]);

  const formatCoords = (coords?: Coordinate3D) => {
    if (!coords) return '（無）';
    return `x: ${coords.x}, y: ${coords.y}, z: ${coords.z}`;
  };

  return (
    <div className="embedded-tree-container">
      {/* 中間樹狀圖編輯區 */}
      <div className="embedded-tree-flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeContextMenu={onNodeContextMenu}
          onInit={onInit}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll
          panOnScroll
          proOptions={{ hideAttribution: true }}
          fitView
          onPaneClick={() => {
            setSelectedNode(null);
            setIsEditing(false);
            closeContextMenu();
          }}
        >
          <Background gap={16} size={1} color="#334155" />
          <Controls showInteractive={false} />
        </ReactFlow>

        {/* 右鍵選單 */}
        {contextMenu && (
          <div
            className="embedded-context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleAddChild} disabled={!onAddNode}>
              ➕ 新增子節點
            </button>
            <button 
              onClick={handleDelete} 
              disabled={!onDeleteNode || contextMenu.node.id === data.id}
              className={contextMenu.node.id === data.id ? 'disabled' : ''}
            >
              🗑️ 刪除節點
            </button>
          </div>
        )}
      </div>

      {/* 右側屬性面板 */}
      <div className={`embedded-sidebar-right ${isPanelOpen ? 'open' : 'collapsed'}`}>
        <div className="embedded-panel-toggle" onClick={() => setIsPanelOpen(!isPanelOpen)}>
          {isPanelOpen ? '▶' : '◀'}
        </div>

        {isPanelOpen && (
          <div className="embedded-panel-content">
            <h3 className="panel-title">節點屬性</h3>
            
            {selectedNode ? (
              <div className="node-details">
                {/* 節點名稱 */}
                <div className="detail-section">
                  <label>節點名稱</label>
                  {isEditing ? (
                    <div className="edit-input-group">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleLabelSave();
                          if (e.key === 'Escape') setIsEditing(false);
                        }}
                        autoFocus
                      />
                      <button onClick={handleLabelSave}>✓</button>
                      <button onClick={() => setIsEditing(false)}>✗</button>
                    </div>
                  ) : (
                    <div className="label-display" onDoubleClick={() => {
                      setEditLabel(selectedNode.data.label);
                      setIsEditing(true);
                    }}>
                      {selectedNode.data.label}
                      <button className="edit-btn" onClick={() => {
                        setEditLabel(selectedNode.data.label);
                        setIsEditing(true);
                      }}>✏️</button>
                    </div>
                  )}
                </div>

                {/* 節點 ID */}
                <div className="detail-section">
                  <label>ID</label>
                  <div className="value">{selectedNode.id}</div>
                </div>

                {/* 深度 */}
                <div className="detail-section">
                  <label>深度</label>
                  <div className="value">{selectedNode.data.depth}</div>
                </div>

                {/* Metadata */}
                {selectedNode.data.treeNode?.metadata && (
                  <>
                    <div className="detail-section">
                      <label>功能</label>
                      <div className="value">{selectedNode.data.treeNode.metadata.function || '（無）'}</div>
                    </div>

                    <div className="detail-section">
                      <label>描述</label>
                      <div className="value">{selectedNode.data.treeNode.metadata.description || '（無）'}</div>
                    </div>

                    <div className="detail-section">
                      <label>Photoshop 座標</label>
                      <div className="value small">{formatCoords(selectedNode.data.treeNode.metadata.photoshopCoords)}</div>
                    </div>

                    <div className="detail-section">
                      <label>引擎座標</label>
                      <div className="value small">{formatCoords(selectedNode.data.treeNode.metadata.engineCoords)}</div>
                    </div>
                  </>
                )}

                {/* 操作按鈕 */}
                <div className="action-buttons">
                  {onAddNode && (
                    <button onClick={() => onAddNode(selectedNode.id)} className="btn-add">
                      新增子節點
                    </button>
                  )}
                  {onDeleteNode && selectedNode.id !== data.id && (
                    <button onClick={() => onDeleteNode(selectedNode.id)} className="btn-delete">
                      刪除節點
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <p>點擊節點查看屬性</p>
                <div className="shortcuts">
                  <h4>快捷鍵</h4>
                  <ul>
                    <li><kbd>Tab</kbd> - 新增子節點</li>
                    <li><kbd>Delete</kbd> - 刪除節點</li>
                    <li><kbd>Esc</kbd> - 取消選擇</li>
                    <li>雙擊 - 編輯節點名稱</li>
                    <li>右鍵 - 開啟選單</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbeddedTreeDiagram;
