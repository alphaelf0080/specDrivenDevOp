import React, { useCallback, useMemo, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import MindMapNode from './MindMapNode';
import ContextMenu, { ContextMenuPosition } from './ContextMenu';
import NodeStyleEditor from './NodeStyleEditor';
import EdgeStyleEditor from './EdgeStyleEditor';
import NodeEditor from './NodeEditor';
import { MindMapConfig } from '../../types/mindmap';
import './MindMapCanvas.css';

interface MindMapCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  config?: MindMapConfig;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onAddNode?: (parentId: string, nodeData: any) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

/**
 * 心智圖畫布元件
 */
const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  config = {},
  onNodesChange,
  onEdgesChange,
  onAddNode,
  onDeleteNode,
  onDeleteEdge,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
  const prevNodeCountRef = React.useRef(0);
  
  // 右鍵選單狀態
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  
  // 樣式編輯器狀態
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  
  // 節點完整編輯器狀態（雙擊觸發）
  const [nodeBeingEdited, setNodeBeingEdited] = useState<Node | null>(null);

  // 當節點數量變化時更新（新增/刪除節點）
  useEffect(() => {
    const currentNodeCount = initialNodes.length;
    
    // 首次載入或節點數量改變
    if (prevNodeCountRef.current !== currentNodeCount) {
      console.log(`🔄 Node count changed: ${prevNodeCountRef.current} → ${currentNodeCount}`);
      setNodes(initialNodes);
      setEdges(initialEdges);
      prevNodeCountRef.current = currentNodeCount;
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // 自訂節點類型
  const nodeTypes = useMemo(
    () => ({
      mindmap: MindMapNode,
    }),
    []
  );

  // 連接處理
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: config.animated }, eds));
    },
    [setEdges, config.animated]
  );

  // 節點變更處理
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      
      // 當節點拖曳完成時，通知父組件
      const hasDragEnd = changes.some((c: any) => c.type === 'position' && c.dragging === false);
      if (hasDragEnd && onNodesChange) {
        // 延遲一點讓狀態更新完成
        setTimeout(() => {
          const updatedNodes = nodes.map(node => {
            const change = changes.find((c: any) => c.id === node.id && c.type === 'position');
            if (change && change.position) {
              return { ...node, position: change.position };
            }
            return node;
          });
          onNodesChange(updatedNodes);
        }, 0);
      }
    },
    [onNodesChangeInternal, onNodesChange, nodes]
  );

  // 邊變更處理
  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        onEdgesChange(edges);
      }
    },
    [onEdgesChangeInternal, onEdgesChange, edges]
  );

  // 右鍵選單處理
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
      setSelectedNode(node);
      setSelectedEdge(null);
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
      setSelectedEdge(edge);
      setSelectedNode(null);
    },
    []
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // 雙擊節點處理 - 開啟完整編輯器
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setNodeBeingEdited(node);
      setContextMenu(null);
    },
    []
  );

  // 節點操作
  const handleAddNode = useCallback(
    (parentId: string) => {
      if (onAddNode) {
        onAddNode(parentId, {
          label: '新節點',
          type: 'leaf',
        });
      }
    },
    [onAddNode]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (onDeleteNode) {
        onDeleteNode(nodeId);
      } else {
        // 本地刪除
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) =>
          eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
      }
    },
    [onDeleteNode, setNodes, setEdges]
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      if (onDeleteEdge) {
        onDeleteEdge(edgeId);
      } else {
        // 本地刪除
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      }
    },
    [onDeleteEdge, setEdges]
  );

  const handleEditNodeStyle = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditingNode(node);
    }
  }, [nodes]);

  const handleEditEdgeStyle = useCallback((edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (edge) {
      setEditingEdge(edge);
    }
  }, [edges]);

  const handleSaveNodeStyle = useCallback(
    (nodeId: string, style: any) => {
      setNodes((nds) => {
        const updatedNodes = nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: { ...n.data, style },
                style: {
                  backgroundColor: style.backgroundColor,
                  borderColor: style.borderColor,
                  borderWidth: `${style.borderWidth}px`,
                  color: style.textColor,
                  fontSize: `${style.fontSize}px`,
                  borderRadius: `${style.borderRadius}px`,
                },
              }
            : n
        );
        
        // 通知父組件使用最新的節點
        if (onNodesChange) {
          setTimeout(() => {
            onNodesChange(updatedNodes);
          }, 0);
        }
        
        return updatedNodes;
      });
      setEditingNode(null);
    },
    [setNodes, onNodesChange]
  );

  const handleSaveEdgeStyle = useCallback(
    (edgeId: string, style: any) => {
      setEdges((eds) => {
        const updatedEdges = eds.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                style,
              }
            : e
        );
        
        // 通知父組件使用最新的邊
        if (onEdgesChange) {
          setTimeout(() => {
            onEdgesChange(updatedEdges);
          }, 0);
        }
        
        return updatedEdges;
      });
      setEditingEdge(null);
    },
    [setEdges, onEdgesChange]
  );

  // 處理節點完整編輯（文字+樣式）
  const handleSaveNodeEdit = useCallback(
    (nodeId: string, updates: { label?: string; description?: string; style?: any }) => {
      console.log('🔧 Saving node edit:', { nodeId, updates });
      
      setNodes((nds) => {
        const updatedNodes = nds.map((n) => {
          if (n.id !== nodeId) return n;

          // 創建深拷貝避免突變
          const updatedNode: Node = {
            ...n,
            data: { ...n.data },
          };

          // 更新標籤
          if (updates.label !== undefined) {
            updatedNode.data.label = updates.label;
            console.log('✏️ Updated label:', updates.label);
          }

          // 更新描述
          if (updates.description !== undefined) {
            updatedNode.data.data = {
              ...(updatedNode.data.data || {}),
              description: updates.description,
            };
            console.log('📝 Updated description:', updates.description);
          }

          // 更新樣式
          if (updates.style) {
            updatedNode.data.style = updates.style;
            updatedNode.style = {
              ...updatedNode.style,
              backgroundColor: updates.style.backgroundColor,
              borderColor: updates.style.borderColor,
              borderWidth: `${updates.style.borderWidth}px`,
              borderStyle: 'solid',
              color: updates.style.textColor,
              fontSize: `${updates.style.fontSize}px`,
              borderRadius: `${updates.style.borderRadius}px`,
              fontWeight: updates.style.fontWeight,
            };
            console.log('🎨 Updated style:', updatedNode.style);
          }

          console.log('✅ Updated node:', updatedNode);
          return updatedNode;
        });

        // 通知父組件
        if (onNodesChange) {
          setTimeout(() => {
            console.log('📤 Notifying parent with updated nodes');
            onNodesChange(updatedNodes);
          }, 0);
        }

        return updatedNodes;
      });
      setNodeBeingEdited(null);
    },
    [setNodes, onNodesChange]
  );

  return (
    <div className="mindmap-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        zoomOnScroll={config.zoomOnScroll !== false}
        panOnDrag={config.panOnDrag !== false}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        {config.controls !== false && <Controls />}
        {config.minimap && (
          <MiniMap
            nodeColor={(node) => {
              switch (node.data?.type) {
                case 'root':
                  return '#6366f1';
                case 'branch':
                  return '#10b981';
                case 'leaf':
                  return '#f59e0b';
                default:
                  return '#94a3b8';
              }
            }}
            nodeStrokeWidth={3}
          />
        )}
      </ReactFlow>

      {/* 右鍵選單 */}
      <ContextMenu
        position={contextMenu}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onClose={closeContextMenu}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={handleDeleteEdge}
        onEditNodeStyle={handleEditNodeStyle}
        onEditEdgeStyle={handleEditEdgeStyle}
        onDisconnectNodes={handleDeleteEdge}
      />

      {/* 節點樣式編輯器 */}
      {editingNode && (
        <NodeStyleEditor
          node={editingNode}
          onSave={handleSaveNodeStyle}
          onClose={() => setEditingNode(null)}
        />
      )}

      {/* 連接線樣式編輯器 */}
      {editingEdge && (
        <EdgeStyleEditor
          edge={editingEdge}
          onSave={handleSaveEdgeStyle}
          onClose={() => setEditingEdge(null)}
        />
      )}

      {/* 節點完整編輯器（雙擊觸發）*/}
      {nodeBeingEdited && (
        <NodeEditor
          node={nodeBeingEdited}
          onSave={handleSaveNodeEdit}
          onClose={() => setNodeBeingEdited(null)}
        />
      )}
    </div>
  );
};

export default MindMapCanvas;
