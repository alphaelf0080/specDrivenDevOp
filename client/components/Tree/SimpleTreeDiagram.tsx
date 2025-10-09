import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  ReactFlowInstance,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { TreeNode } from './TreeDiagram';

export type SimpleTreeDiagramProps = {
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

const SimpleTreeDiagram: React.FC<SimpleTreeDiagramProps> = ({
  data,
  direction = 'LR',
  onNodeUpdate,
  onAddNode,
  onDeleteNode,
}) => {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [editingNode, setEditingNode] = useState<{ id: string; label: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const { nodes, edges } = useMemo(() => {
    return layoutTree(data, direction);
  }, [data, direction]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // 自動適應視圖
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 0);
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setEditingNode({ id: node.id, label: node.data.label });
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    if (onNodeUpdate) {
      onNodeUpdate(nodeId, { label: newLabel });
    }
    setEditingNode(null);
  }, [onNodeUpdate]);

  const handleAddChild = useCallback((parentId: string) => {
    if (onAddNode) {
      onAddNode(parentId);
    }
    setContextMenu(null);
  }, [onAddNode]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (onDeleteNode) {
      onDeleteNode(nodeId);
    }
    setContextMenu(null);
  }, [onDeleteNode]);

  // 點擊其他地方關閉選單
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a', position: 'relative' }}>
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
      >
        <Background gap={16} size={1} color="#333" />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* 節點編輯對話框 */}
      {editingNode && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#2a2a2a',
            border: '2px solid #818cf8',
            borderRadius: '8px',
            padding: '20px',
            zIndex: 1000,
            minWidth: '300px',
          }}
        >
          <h3 style={{ color: '#c7d2fe', marginTop: 0 }}>編輯節點</h3>
          <input
            type="text"
            value={editingNode.label}
            onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLabelChange(editingNode.id, editingNode.label);
              } else if (e.key === 'Escape') {
                setEditingNode(null);
              }
            }}
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#1a1a1a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingNode(null)}
              style={{
                padding: '6px 16px',
                background: '#444',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              onClick={() => handleLabelChange(editingNode.id, editingNode.label)}
              style={{
                padding: '6px 16px',
                background: '#818cf8',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              確定
            </button>
          </div>
        </div>
      )}

      {/* 右鍵選單 */}
      {contextMenu && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: '150px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={() => {
              setEditingNode({ 
                id: contextMenu.nodeId, 
                label: nodes.find(n => n.id === contextMenu.nodeId)?.data.label || '' 
              });
              setContextMenu(null);
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              color: '#c7d2fe',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ✏️ 編輯節點
          </button>
          <button
            onClick={() => handleAddChild(contextMenu.nodeId)}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              color: '#c7d2fe',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ➕ 新增子節點
          </button>
          <button
            onClick={() => handleDeleteNode(contextMenu.nodeId)}
            disabled={contextMenu.nodeId === data.id}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              color: contextMenu.nodeId === data.id ? '#666' : '#f87171',
              cursor: contextMenu.nodeId === data.id ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              if (contextMenu.nodeId !== data.id) {
                e.currentTarget.style.background = '#444';
              }
            }}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            🗑️ 刪除節點
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleTreeDiagram;
