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
  OnEdgeUpdateFunc,
  applyEdgeChanges,
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
      setEdges((eds) => {
        // 依來源/目標節點動態補齊 handle，確保任意側都能連
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);
        const isRoot = sourceNode && (((sourceNode.data as any)?.type === 'root') || sourceNode.id === 'root');
        // 來源把手：若缺少，root 依目標方向；非 root 依向量方向選擇 source-* 把手
        let sourceHandle = connection.sourceHandle as string | undefined;
        if (!sourceHandle) {
          if (isRoot) {
            sourceHandle = getSourceHandleForRootNode(targetNode as Node);
          } else if (sourceNode && targetNode) {
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle >= -45 && angle < 45) sourceHandle = 'source-right';
            else if (angle >= 45 && angle < 135) sourceHandle = 'source-bottom';
            else if (angle >= 135 || angle < -135) sourceHandle = 'source-left';
            else sourceHandle = 'source-top';
          } else {
            sourceHandle = 'source';
          }
        }

        // 若沒帶上 targetHandle，依方位挑選一個最接近的 target handle（目標面向來源）
        let targetHandle = connection.targetHandle;
        if (!targetHandle) {
          targetHandle = 'target-right';
          if (targetNode && sourceNode) {
            const dxTS = sourceNode.position.x - targetNode.position.x;
            const dyTS = sourceNode.position.y - targetNode.position.y;
            const angle = Math.atan2(dyTS, dxTS) * (180 / Math.PI);
            if (angle >= -45 && angle < 45) targetHandle = 'target-right';
            else if (angle >= 45 && angle < 135) targetHandle = 'target-bottom';
            else if (angle >= 135 || angle < -135) targetHandle = 'target-left';
            else targetHandle = 'target-top';
          }
        }

        const newEdge = addEdge(
          { ...connection, sourceHandle, targetHandle, animated: config.animated, updatable: true },
          eds,
        );

        // 通知父層保存
        if (onEdgesChange) setTimeout(() => onEdgesChange(newEdge), 0);
        return newEdge;
      });
    },
    [setEdges, config.animated, nodes, onEdgesChange]
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
      // 我們會在本地同步補上缺失的 handles，避免畫面回跳
      const nextEdges = applyEdgeChanges(changes, edges).map((e) => {
          const sourceNode = nodes.find((n) => n.id === e.source);
          const targetNode = nodes.find((n) => n.id === e.target);
          const isRootSource = !!(sourceNode && (((sourceNode.data as any)?.type === 'root') || sourceNode.id === 'root'));

          let sourceHandle = e.sourceHandle;
          if (!sourceHandle) {
            if (isRootSource) {
              sourceHandle = getSourceHandleForRootNode(targetNode as Node);
            } else if (sourceNode && targetNode) {
              const dx = targetNode.position.x - sourceNode.position.x;
              const dy = targetNode.position.y - sourceNode.position.y;
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              if (angle >= -45 && angle < 45) sourceHandle = 'source-right';
              else if (angle >= 45 && angle < 135) sourceHandle = 'source-bottom';
              else if (angle >= 135 || angle < -135) sourceHandle = 'source-left';
              else sourceHandle = 'source-top';
            } else {
              sourceHandle = 'source';
            }
          }

          let targetHandle = e.targetHandle;
          if (!targetHandle) {
            // 依方位選擇最合適的 target handle（讓目標面向來源）
            if (sourceNode && targetNode) {
              const dxTS = sourceNode.position.x - targetNode.position.x;
              const dyTS = sourceNode.position.y - targetNode.position.y;
              const angle = Math.atan2(dyTS, dxTS) * (180 / Math.PI);
              if (angle >= -45 && angle < 45) targetHandle = 'target-right';
              else if (angle >= 45 && angle < 135) targetHandle = 'target-bottom';
              else if (angle >= 135 || angle < -135) targetHandle = 'target-left';
              else targetHandle = 'target-top';
            } else {
              targetHandle = 'target';
            }
          }

          return {
            ...e,
            sourceHandle,
            targetHandle,
            updatable: true,
          } as Edge;
        });
      // 先同步本地，再通知父層保存
      setEdges(nextEdges);
      if (onEdgesChange) onEdgesChange(nextEdges);
    },
    [onEdgesChangeInternal, onEdgesChange, edges, nodes, setEdges]
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

  // 雙擊連接線處理 - 開啟連接線樣式編輯器
  const onEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setEditingEdge(edge);
      setContextMenu(null);
    },
    []
  );

  // 計算根節點該使用的 source handle（依目標節點方位）
  const getSourceHandleForRootNode = (targetNode: Node | undefined): string => {
    if (!targetNode) return 'source-right';
    // 找到畫布中的根節點（以 data.type 或 id 判斷）
    const rootNode = nodes.find((n) => (n.data as any)?.type === 'root' || n.id === 'root');
    const origin = rootNode?.position || { x: 0, y: 0 };
    const dx = targetNode.position.x - origin.x;
    const dy = targetNode.position.y - origin.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle >= -45 && angle < 45) return 'source-right';
    if (angle >= 45 && angle < 135) return 'source-bottom';
    if (angle >= 135 || angle < -135) return 'source-left';
    return 'source-top';
  };

  // 拖曳更新連接線的起點/終點（重新連接）
  const onEdgeUpdate: OnEdgeUpdateFunc = useCallback((oldEdge, newConnection) => {
    setEdges((eds) => {
      const updatedEdges = eds.map((e) => {
        if (e.id !== oldEdge.id) return e;

        const nextSource = newConnection.source ?? e.source;
        const nextTarget = newConnection.target ?? e.target;

        // 計算 handle：允許任意側連接；若來源為 root，動態選擇 root handle
        const sourceNode = nodes.find((n) => n.id === nextSource);
        const targetNode = nodes.find((n) => n.id === nextTarget);
        const isRootSource = sourceNode && (((sourceNode.data as any)?.type === 'root') || sourceNode.id === 'root');
        const isRootTarget = targetNode && (((targetNode.data as any)?.type === 'root') || targetNode.id === 'root');
        // 來源側 handle：若缺少，root 用 root 規則；非 root 依向量方向選擇 source-*
        let nextSourceHandle = newConnection.sourceHandle as string | undefined;
        if (!nextSourceHandle) {
          if (isRootSource) {
            nextSourceHandle = getSourceHandleForRootNode(targetNode);
          } else if (sourceNode && targetNode) {
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle >= -45 && angle < 45) nextSourceHandle = 'source-right';
            else if (angle >= 45 && angle < 135) nextSourceHandle = 'source-bottom';
            else if (angle >= 135 || angle < -135) nextSourceHandle = 'source-left';
            else nextSourceHandle = 'source-top';
          } else {
            nextSourceHandle = e.sourceHandle || 'source';
          }
        }

        // 目標側：若有帶 targetHandle 則尊重之，否則依方位挑選（讓目標面向來源）
        let nextTargetHandle = newConnection.targetHandle || e.targetHandle || 'target-right';
        if (!newConnection.targetHandle) {
          if (sourceNode && targetNode) {
            const dxTS = sourceNode.position.x - targetNode.position.x;
            const dyTS = sourceNode.position.y - targetNode.position.y;
            const angle = Math.atan2(dyTS, dxTS) * (180 / Math.PI);
            if (angle >= -45 && angle < 45) nextTargetHandle = 'target-right';
            else if (angle >= 45 && angle < 135) nextTargetHandle = 'target-bottom';
            else if (angle >= 135 || angle < -135) nextTargetHandle = 'target-left';
            else nextTargetHandle = 'target-top';
          }
        }

        return {
          ...e,
          source: nextSource,
          target: nextTarget,
          sourceHandle: nextSourceHandle,
          targetHandle: nextTargetHandle,
        } as Edge;
      });

      if (onEdgesChange) {
        setTimeout(() => onEdgesChange(updatedEdges.map((e) => ({ ...e }))), 0);
      }

      return updatedEdges;
    });
  }, [nodes, onEdgesChange, setEdges]);

  // 新 API：當邊被重新連接（來源或目標）
  const onEdgeReconnect = useCallback((oldEdge: Edge, newConn: { connection: Connection; isSource: boolean }) => {
    const { connection, isSource } = newConn;
    setEdges((eds) => {
      const updated = eds.map((e) => {
        if (e.id !== oldEdge.id) return e;

        const nextSource = isSource ? (connection.source ?? e.source) : e.source;
        const nextTarget = !isSource ? (connection.target ?? e.target) : e.target;

        const sourceNode = nodes.find((n) => n.id === nextSource);
        const targetNode = nodes.find((n) => n.id === nextTarget);
        const isRoot = sourceNode && ((sourceNode.data as any)?.type === 'root' || sourceNode.id === 'root');
        // 來源把手：若未提供，root 用 root 規則；非 root 依向量方向選擇 source-*
        let nextSourceHandle = connection.sourceHandle as string | undefined;
        if (!nextSourceHandle) {
          if (isRoot) {
            nextSourceHandle = getSourceHandleForRootNode(targetNode);
          } else if (sourceNode && targetNode) {
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle >= -45 && angle < 45) nextSourceHandle = 'source-right';
            else if (angle >= 45 && angle < 135) nextSourceHandle = 'source-bottom';
            else if (angle >= 135 || angle < -135) nextSourceHandle = 'source-left';
            else nextSourceHandle = 'source-top';
          } else {
            nextSourceHandle = e.sourceHandle || 'source';
          }
        }

        // 目標側 handle 依方位挑選（讓目標面向來源）
        let nextTargetHandle = 'target-right';
        if (targetNode) {
          const dxTS = (sourceNode?.position.x ?? 0) - targetNode.position.x;
          const dyTS = (sourceNode?.position.y ?? 0) - targetNode.position.y;
          const angle = Math.atan2(dyTS, dxTS) * (180 / Math.PI);
          if (angle >= -45 && angle < 45) nextTargetHandle = 'target-right';
          else if (angle >= 45 && angle < 135) nextTargetHandle = 'target-bottom';
          else if (angle >= 135 || angle < -135) nextTargetHandle = 'target-left';
          else nextTargetHandle = 'target-top';
        }

        return {
          ...e,
          source: nextSource,
          target: nextTarget,
          sourceHandle: nextSourceHandle,
          targetHandle: nextTargetHandle,
        } as Edge;
      });

  if (onEdgesChange) setTimeout(() => onEdgesChange(updated.map((e) => ({ ...e }))), 0);
      return updated;
    });
  }, [nodes, onEdgesChange]);

  // 鍵盤刪除選取的連接線
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedEdge) {
        setEdges((eds) => {
          const filtered = eds.filter((edge) => edge.id !== selectedEdge.id);
          if (onEdgesChange) {
            setTimeout(() => onEdgesChange(filtered), 0);
          }
          return filtered;
        });
      }
    }
  }, [selectedEdge, setEdges, onEdgesChange]);

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
        // 本地刪除，同步通知父層保存
        setEdges((eds) => {
          const filtered = eds.filter((e) => e.id !== edgeId);
          if (onEdgesChange) {
            setTimeout(() => onEdgesChange(filtered), 0);
          }
          return filtered;
        });
      }
    },
    [onDeleteEdge, setEdges, onEdgesChange]
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
              }
            : n
        );

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
    (edgeId: string, updates: { style: any; animated?: boolean; type?: string; markerStart?: any; markerEnd?: any }) => {
      setEdges((eds) => {
        const updatedEdges = eds.map((e) =>
          e.id === edgeId
            ? (() => {
                const next: any = { ...e, style: updates.style };
                if (typeof updates.animated === 'boolean') next.animated = updates.animated;
                if (updates.type) next.type = updates.type;
                if (updates.markerStart === null) delete next.markerStart;
                else if (updates.markerStart !== undefined) next.markerStart = updates.markerStart;
                if (updates.markerEnd === null) delete next.markerEnd;
                else if (updates.markerEnd !== undefined) next.markerEnd = updates.markerEnd;
                return next as Edge;
              })()
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
    (nodeId: string, updates: { label?: string; description?: string; style?: any; type?: 'branch' | 'leaf' | 'root' }) => {
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

          // 更新類型
          if (updates.type) {
            updatedNode.data.type = updates.type;
          }

          // 更新樣式
          if (updates.style) {
            updatedNode.data.style = updates.style;
            console.log('🎨 Updated style (data only)');
          }

          console.log('✅ Updated node:', updatedNode);
          return updatedNode;
        });

        // 通知父組件（自動儲存）
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
  <div className="mindmap-canvas" tabIndex={0} onKeyDown={handleKeyDown}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
  onEdgeUpdate={onEdgeUpdate}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true}
  nodesConnectable={true}
        edgesUpdatable={true}
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
