import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, BaseEdge, Controls, Edge, EdgeProps, Handle, MarkerType, Node, Position, ReactFlowInstance, getSmoothStepPath } from 'reactflow';
import 'reactflow/dist/style.css';
import './TreeDiagram.css';
import dagre from 'dagre';

export type Coordinate3D = {
  x: number;
  y: number;
  z: number;
};

export enum BlendMode {
  Normal = 'Normal',
  Multiply = 'Multiply',
  Screen = 'Screen',
  Overlay = 'Overlay',
  Darken = 'Darken',
  Lighten = 'Lighten',
  ColorDodge = 'ColorDodge',
  ColorBurn = 'ColorBurn',
  HardLight = 'HardLight',
  SoftLight = 'SoftLight',
  Difference = 'Difference',
  Exclusion = 'Exclusion',
}

const BLEND_MODE_OPTIONS = Object.values(BlendMode) as BlendMode[];

export type TreeNodeMetadata = {
  nodeId?: number;               // 0. ID (整數)
  function?: string;             // 2. 功能
  description?: string;          // 3. 描述
  photoshopCoords?: Coordinate3D;// 4. Photoshop 座標
  engineCoords?: Coordinate3D;   // 5. 引擎座標
  blendMode?: BlendMode;         // 6. 疊加模式
  opacity?: string;              // 7. 透明度 (% 字串)
  mask?: Record<string, unknown>;// 8. 遮罩
  notes?: string;                // 備註
  [key: string]: unknown;
};

export type TreeNode = {
  id: string;                    // React Flow 使用的節點 ID
  label: string;                 // 1. 節點名稱
  children?: TreeNode[];
  metadata?: TreeNodeMetadata;
};

export type TreeDiagramProps = {
  data: TreeNode;
  direction?: 'LR' | 'TB';
  nodeWidth?: number;
  nodeHeight?: number;
  renderNode?: (args: { id: string; data: any }) => React.ReactNode;
  onSelectNode?: (node: Node) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<TreeNode>) => void;
  onAddNode?: (parentNodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  defaultCollapsedIds?: string[];
  onBackHome?: () => void;
};

const nodeDefaults = { width: 200, height: 56 };

// Dark 模式配色
const depthPalette = [
  { bg: '#312e81', border: '#818cf8', text: '#c7d2fe' }, // indigo - 深藍紫
  { bg: '#164e63', border: '#22d3ee', text: '#a5f3fc' }, // cyan - 青色
  { bg: '#14532d', border: '#4ade80', text: '#bbf7d0' }, // green - 綠色
  { bg: '#7c2d12', border: '#fb923c', text: '#fed7aa' }, // orange - 橙色
  { bg: '#831843', border: '#f472b6', text: '#fbcfe8' }, // pink - 粉紅
  { bg: '#334155', border: '#94a3b8', text: '#cbd5e1' }, // slate - 灰藍
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
  // 線條寬度由淺到深逐層增加
  const strokeWidth = Math.max(1.5, 1.5 + depth * 0.6);
  return { stroke: c.border, strokeWidth, opacity: 0.9 } as React.CSSProperties;
}

function layoutTree(root: TreeNode, dir: 'LR' | 'TB', nodeSize = nodeDefaults) {
  const g = new dagre.graphlib.Graph();
  // 垂直布局(TB)使用更大的垂直間距，水平布局(LR)使用更大的水平間距
  const nodesep = dir === 'TB' ? 50 : 40;
  const ranksep = dir === 'TB' ? 80 : 60;
  // 增加邊距，為根節點在最左上角留出更多空間
  g.setGraph({ 
    rankdir: dir, 
    nodesep, 
    ranksep, 
    marginx: 60, // 增加水平邊距
    marginy: 60, // 增加垂直邊距
    align: dir === 'TB' ? 'UL' : 'UL', // 對齊到左上角
    ranker: 'longest-path' // 使用最長路徑排序，有助於保持層次結構
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function walk(n: TreeNode, parent?: TreeNode, depth = 0) {
    g.setNode(n.id, { width: nodeSize.width, height: nodeSize.height });
    nodes.push({
      id: n.id,
      data: {
        label: n.label,
        metadata: n.metadata ? { ...n.metadata } : undefined,
        depth,
      },
      position: { x: 0, y: 0 },
    });
    if (parent) {
      const id = `${parent.id}-${n.id}`;
      g.setEdge(parent.id, n.id);
      const color = depthPalette[depth % depthPalette.length].border;
      edges.push({
        id,
        source: parent.id,
        target: n.id,
        type: 'coloredSmooth',
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 18, height: 18 },
        data: { depth },
      });
    }
    n.children?.forEach(c => walk(c, n, depth + 1));
  }

  walk(root, undefined, 0);
  dagre.layout(g);

  const positionedNodes = nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return {
      ...n,
      position: { x: x - nodeSize.width / 2, y: y - nodeSize.height / 2 },
      sourcePosition: dir === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: dir === 'LR' ? Position.Left : Position.Top,
      style: { padding: 0 },
      data: { ...n.data },
    } as Node;
  });

  // 確保根節點位於最左上角，其他節點不能超越根節點的位置
  if (positionedNodes.length > 0) {
    const rootNodeIndex = positionedNodes.findIndex(n => n.data.depth === 0);
    if (rootNodeIndex !== -1) {
      const rootNode = positionedNodes[rootNodeIndex];
      
      // 找到所有節點的最小 X 和 Y 座標
      const minX = Math.min(...positionedNodes.map(n => n.position.x));
      const minY = Math.min(...positionedNodes.map(n => n.position.y));
      
      // 計算需要的偏移量，確保根節點位於最左上角
      const xOffset = rootNode.position.x - minX;
      const yOffset = rootNode.position.y - minY;
      
      // 調整所有節點位置，讓根節點位於最左上角
      positionedNodes.forEach(n => {
        if (n.id === rootNode.id) {
          // 根節點移到最左上角
          n.position.x = minX;
          n.position.y = minY;
        } else {
          // 其他節點相對向右下方移動
          n.position.x += Math.abs(xOffset);
          n.position.y += Math.abs(yOffset);
        }
      });
      
      // 額外的安全檢查：確保沒有節點位於根節點的上方或左方
      const rootFinalX = rootNode.position.x;
      const rootFinalY = rootNode.position.y;
      
      positionedNodes.forEach(n => {
        if (n.id !== rootNode.id) {
          // 確保 X 座標不小於根節點 X 座標
          if (n.position.x < rootFinalX) {
            n.position.x = rootFinalX + 50; // 最小間距 50px
          }
          // 確保 Y 座標不小於根節點 Y 座標
          if (n.position.y < rootFinalY) {
            n.position.y = rootFinalY + 50; // 最小間距 50px
          }
        }
      });
    }
  }

  return { nodes: positionedNodes, edges };
}

function findNodeById(node: TreeNode, searchId: string): TreeNode | undefined {
  if (node.id === searchId) {
    return node;
  }

  if (!node.children) {
    return undefined;
  }

  for (const child of node.children) {
    const found = findNodeById(child, searchId);
    if (found) {
      return found;
    }
  }

  return undefined;
}

const ColoredSmoothEdge = (props: EdgeProps) => {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data } = props;
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const depth = typeof data?.depth === 'number' ? data.depth : 0;
  const style = edgeStyleForDepth(depth);
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ 
          ...style, 
          fill: 'none', 
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        markerEnd={markerEnd}
      />
    </>
  );
};

export default function TreeDiagram({ data, direction = 'LR', nodeWidth = 200, nodeHeight = 56, renderNode, onSelectNode, onNodeUpdate, onAddNode, onDeleteNode, defaultCollapsedIds, onBackHome }: TreeDiagramProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    (defaultCollapsedIds || []).forEach(id => { init[id] = true; });
    return init;
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(320); // 屬性面板寬度狀態
  const [isResizing, setIsResizing] = useState(false); // 拖曳調整狀態
  const [editData, setEditData] = useState({
    nodeId: '',
    label: '',
    function: '',
    description: '',
    photoshopX: '',
    photoshopY: '',
    photoshopZ: '',
    engineX: '',
    engineY: '',
    engineZ: '',
    blendMode: '',
    opacity: '',
    mask: '{}',
    notes: ''
  });
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const hasInitialized = useRef(false);
  const nodeSize = useMemo(() => ({ width: nodeWidth, height: nodeHeight }), [nodeWidth, nodeHeight]);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; node: Node | null }>({ visible: false, x: 0, y: 0, node: null });

  const isPanelOpen = !!selectedNode;

  const containerStyle = useMemo(() => ({
    gridTemplateColumns: `80px 1fr ${isPanelOpen ? `${panelWidth}px` : '0px'}`,
  }), [isPanelOpen, panelWidth]);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  }, []);

  // 拖曳調整面板寬度的處理函數
  const handleResizeStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);
  }, []);

  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!isResizing) return;
    
    // 計算新的面板寬度（從右邊界向左拖曳）
    const newWidth = window.innerWidth - event.clientX;
    const minWidth = 250; // 最小寬度
    const maxWidth = window.innerWidth * 0.5; // 最大寬度為螢幕寬度的50%
    
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setPanelWidth(constrainedWidth);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // 拖曳事件監聽器
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  useEffect(() => {
    const handleWindowClick = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      window.addEventListener('click', handleWindowClick);
      return () => {
        window.removeEventListener('click', handleWindowClick);
      };
    }

    return undefined;
  }, [contextMenu.visible, closeContextMenu]);

  useEffect(() => {
    if (!selectedNode) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditing) {
        return;
      }

      if (event.key === 'Tab' && onAddNode) {
        event.preventDefault();
        onAddNode(selectedNode.id);
        closeContextMenu();
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && onDeleteNode) {
        if (selectedNode.id === data.id) {
          return;
        }
        event.preventDefault();
        onDeleteNode(selectedNode.id);
        closeContextMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNode, onAddNode, onDeleteNode, isEditing, closeContextMenu, data.id]);

  // 計算完整樹的布局（只在 data 改變時重新計算）
  const fullLayout = useMemo(() => layoutTree(data, direction, nodeSize), [data, direction, nodeSize]);

  // 根據收合狀態過濾要顯示的節點和邊
  const { nodes, edges } = useMemo(() => {
    const visibleNodeIds = new Set<string>();
    
    // 遞迴標記可見節點
    function markVisible(nodeId: string) {
      visibleNodeIds.add(nodeId);
      
      // 如果節點未收合，則其子節點也可見
      if (!collapsed[nodeId]) {
        // 找到此節點的所有子節點
        fullLayout.edges
          .filter(edge => edge.source === nodeId)
          .forEach(edge => markVisible(edge.target));
      }
    }
    
    // 從根節點開始標記
    if (fullLayout.nodes.length > 0) {
      markVisible(fullLayout.nodes[0].id);
    }
    
    // 過濾節點和邊
    const visibleNodes = fullLayout.nodes.filter(node => visibleNodeIds.has(node.id));
      const nodesWithMetadata = visibleNodes.map(node => {
        const sourceNode = findNodeById(data, node.id);
        return {
          ...node,
          data: {
            ...node.data,
            metadata: sourceNode?.metadata ? { ...sourceNode.metadata } : undefined,
            hasChildren: (sourceNode?.children?.length ?? 0) > 0,
          },
        };
      });

    const visibleEdges = fullLayout.edges.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
    
    return { nodes: nodesWithMetadata, edges: visibleEdges };
  }, [fullLayout, collapsed, data]);

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setCollapsed(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  }, []);

  const onNodeClick = useCallback((_e: any, node: Node) => {
    setSelectedNode(node);
    setIsEditing(false); // 選取新節點時關閉編輯模式
    closeContextMenu();
    onSelectNode && onSelectNode(node);
  }, [onSelectNode, closeContextMenu]);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedNode(node);
    setIsEditing(false);
    onSelectNode && onSelectNode(node);
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, node });
  }, [onSelectNode]);

  const handleEditStart = useCallback(() => {
    if (selectedNode) {
      const metadata: TreeNodeMetadata | undefined = selectedNode.data.metadata;
      const photoshop = metadata?.photoshopCoords;
      const engine = metadata?.engineCoords;
  const maskValue = metadata?.mask;
  const maskString = maskValue ? JSON.stringify(maskValue) : '{}';

      setEditData({
        nodeId: metadata?.nodeId !== undefined ? metadata.nodeId.toString() : '',
        label: selectedNode.data.label || '',
        function: metadata?.function || '',
        description: metadata?.description || '',
        photoshopX: photoshop?.x !== undefined ? photoshop.x.toString() : '',
        photoshopY: photoshop?.y !== undefined ? photoshop.y.toString() : '',
        photoshopZ: photoshop?.z !== undefined ? photoshop.z.toString() : '',
        engineX: engine?.x !== undefined ? engine.x.toString() : '',
        engineY: engine?.y !== undefined ? engine.y.toString() : '',
        engineZ: engine?.z !== undefined ? engine.z.toString() : '',
        blendMode: metadata?.blendMode || '',
        opacity: metadata?.opacity || '',
        mask: maskString,
        notes: metadata?.notes || ''
      });
      setIsEditing(true);
    }
  }, [selectedNode]);

  const handleEditSave = useCallback(() => {
    if (selectedNode && onNodeUpdate && editData.label.trim()) {
      const existingMetadata: TreeNodeMetadata | undefined = selectedNode.data.metadata;

      const toInteger = (value: string): number | undefined => {
        const trimmed = value.trim();
        if (!trimmed) {
          return undefined;
        }
        const parsed = Number.parseInt(trimmed, 10);
        return Number.isInteger(parsed) ? parsed : undefined;
      };

      const buildCoords = (
        xValue: string,
        yValue: string,
        zValue: string,
        previous?: Coordinate3D
      ): Coordinate3D | undefined => {
        const x = toInteger(xValue);
        const y = toInteger(yValue);
        const z = toInteger(zValue);

        if (x === undefined && y === undefined && z === undefined) {
          return undefined;
        }

        if (x !== undefined && y !== undefined && z !== undefined) {
          return { x, y, z };
        }

        if (previous) {
          return {
            x: x ?? previous.x,
            y: y ?? previous.y,
            z: z ?? previous.z,
          };
        }

        return undefined;
      };

      const nextMetadata: TreeNodeMetadata = { ...(existingMetadata || {}) };

      const assignString = (key: keyof TreeNodeMetadata, value: string) => {
        const trimmed = value.trim();
        if (trimmed) {
          nextMetadata[key] = trimmed;
        } else {
          delete nextMetadata[key];
        }
      };

      const nodeId = toInteger(editData.nodeId);
      if (nodeId !== undefined) {
        nextMetadata.nodeId = nodeId;
      } else {
        delete nextMetadata.nodeId;
      }

      assignString('function', editData.function);
      assignString('description', editData.description);

      const photoshopCoords = buildCoords(
        editData.photoshopX,
        editData.photoshopY,
        editData.photoshopZ,
        existingMetadata?.photoshopCoords
      );
      if (photoshopCoords) {
        nextMetadata.photoshopCoords = photoshopCoords;
      } else {
        delete nextMetadata.photoshopCoords;
      }

      const engineCoords = buildCoords(
        editData.engineX,
        editData.engineY,
        editData.engineZ,
        existingMetadata?.engineCoords
      );
      if (engineCoords) {
        nextMetadata.engineCoords = engineCoords;
      } else {
        delete nextMetadata.engineCoords;
      }

      const blendModeInput = editData.blendMode.trim();
      if (blendModeInput && (Object.values(BlendMode) as string[]).includes(blendModeInput)) {
        nextMetadata.blendMode = blendModeInput as BlendMode;
      } else {
        delete nextMetadata.blendMode;
      }

      assignString('opacity', editData.opacity);
      assignString('notes', editData.notes);

      const maskInput = editData.mask.trim();
      if (!maskInput) {
        nextMetadata.mask = {};
      } else {
        try {
          const parsed = JSON.parse(maskInput);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            nextMetadata.mask = parsed as Record<string, unknown>;
          }
        } catch (error) {
          // 若解析失敗則保留原有遮罩資料
          if (existingMetadata?.mask) {
            nextMetadata.mask = existingMetadata.mask;
          } else {
            nextMetadata.mask = {};
          }
        }
      }

      const updates: Partial<TreeNode> = {
        label: editData.label.trim(),
        metadata: nextMetadata,
      };

      onNodeUpdate(selectedNode.id, updates);
      setSelectedNode(prev => {
        if (!prev || prev.id !== selectedNode.id) {
          return prev;
        }

        const prevMetadata = (prev.data && prev.data.metadata) || {};
        const updatesMetadata = updates.metadata || {};

        return {
          ...prev,
          data: {
            ...prev.data,
            ...updates,
            metadata: {
              ...prevMetadata,
              ...updatesMetadata,
            },
          },
        } as Node;
      });
      setIsEditing(false);
    }
  }, [selectedNode, editData, onNodeUpdate]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditData({
      nodeId: '',
      label: '',
      function: '',
      description: '',
      photoshopX: '',
      photoshopY: '',
      photoshopZ: '',
      engineX: '',
      engineY: '',
      engineZ: '',
      blendMode: '',
      opacity: '',
      mask: '{}',
      notes: ''
    });
  }, []);

  const nodeTypes = useMemo(() => ({
    default: ({ data, id }: any) => {
      const depth = typeof data.depth === 'number' ? data.depth : 0;
      const style = styleForDepth(depth);
      const dir = data.direction || 'LR';
      const hasChildren = Boolean(data.hasChildren);
      const isCollapsed = Boolean(collapsed[id]);

      const handleToggleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        toggleNodeCollapse(id);
      };

      return (
        <div 
          className={`tree-node ${id === data.rootId ? 'root' : ''} ${isCollapsed ? 'collapsed' : ''}`} 
          style={style}
          data-depth={depth}
        >
          <Handle
            type="target"
            position={dir === 'LR' ? Position.Left : Position.Top}
            style={{ opacity: 0 }}
          />
          <span className="tree-node-label">
            {renderNode ? renderNode({ id, data }) : data.label}
          </span>
          {hasChildren && (
            <button
              type="button"
              className={`tree-node-toggle ${isCollapsed ? 'collapsed' : 'expanded'}`}
              onClick={handleToggleClick}
              aria-label={isCollapsed ? '展開節點' : '收合節點'}
            >
              {isCollapsed ? '+' : '−'}
            </button>
          )}
          <Handle
            type="source"
            position={dir === 'LR' ? Position.Right : Position.Bottom}
            style={{ opacity: 0 }}
          />
        </div>
      );
    },
  }), [collapsed, renderNode, toggleNodeCollapse]);

  const initialNodes = nodes.map(n => ({ ...n, data: { ...n.data, rootId: data.id, direction } }));
  const edgeTypes = useMemo(() => ({ coloredSmooth: ColoredSmoothEdge }), []);

  // 只在初始化時執行 fitView
  useEffect(() => {
    if (reactFlowInstance && !hasInitialized.current) {
      reactFlowInstance.fitView({ padding: 0.1 });
      hasInitialized.current = true;
    }
  }, [reactFlowInstance]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const formatCoords = (coords?: Coordinate3D) => {
    if (!coords) {
      return '（無）';
    }
    return `x: ${coords.x}, y: ${coords.y}, z: ${coords.z}`;
  };

  const formatMask = (mask?: Record<string, unknown>) => {
    if (!mask) {
      return '{}';
    }
    try {
      const keys = Object.keys(mask);
      if (!keys.length) {
        return '{}';
      }
      return JSON.stringify(mask);
    } catch (error) {
      return '{}';
    }
  };

  const handleAddChildFromMenu = useCallback(() => {
    if (contextMenu.node && onAddNode) {
      onAddNode(contextMenu.node.id);
    }
    closeContextMenu();
  }, [contextMenu.node, onAddNode, closeContextMenu]);

  const handleDeleteFromMenu = useCallback(() => {
    if (contextMenu.node && onDeleteNode) {
      onDeleteNode(contextMenu.node.id);
    }
    closeContextMenu();
  }, [contextMenu.node, onDeleteNode, closeContextMenu]);

  const isDeleteDisabled = !contextMenu.node || contextMenu.node.id === data.id || !onDeleteNode;

  return (
    <div className="tree-diagram-container" style={containerStyle}>
      {/* 工具列 */}
      <div className="tree-toolbar">
        {onBackHome && (
          <button className="btn-back-home" onClick={onBackHome}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2L2 8L8 14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回首頁
          </button>
        )}
        <span className="tree-title">樹枝圖</span>
        <button className="btn-expand-all" onClick={() => setCollapsed({})}>
          全部展開
        </button>
      </div>

      {/* 左側導覽區 */}
      <div className="tree-sidebar-left">
        <div className="sidebar-tool-btn" title="過濾">
          🔍
        </div>
        <div className="sidebar-tool-btn" title="圖層">
          📚
        </div>
        <div className="sidebar-tool-btn" title="書籤">
          🔖
        </div>
        <div className="sidebar-tool-btn" title="設定">
          ⚙️
        </div>
        <div className="sidebar-tool-btn" title="匯出">
          💾
        </div>
        <div className="sidebar-tool-btn" title="分享">
          🔗
        </div>
      </div>

      {/* 中間主要內容區（樹狀圖） */}
      <div className="tree-diagram-flow">
        <ReactFlow
          nodes={initialNodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onNodeContextMenu={handleNodeContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'coloredSmooth' }}
          onInit={onInit}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll
          panOnScroll
          onPaneClick={() => {
            setSelectedNode(null);
            setIsEditing(false);
            closeContextMenu();
          }}
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* 右側屬性面板 */}
      <div className={`tree-sidebar-right ${isPanelOpen ? 'open' : 'collapsed'}`} aria-hidden={!isPanelOpen}>
        {/* 拖曳調整寬度的手柄 */}
        {isPanelOpen && (
          <div 
            className={`panel-resize-handle ${isResizing ? 'resizing' : ''}`}
            onMouseDown={handleResizeStart}
            title="拖曳調整面板寬度"
          />
        )}
        {isPanelOpen && selectedNode && (
          <div className="property-panel">
            <div className="property-panel-header">
            <h3 className="property-panel-title">節點屬性</h3>
            {selectedNode && !isEditing && onNodeUpdate && (
              <button className="btn-edit" onClick={handleEditStart} title="編輯節點">
                ✏️ 編輯
              </button>
            )}
            </div>
            <div className="property-content">
              {/* 0. ID (整數) */}
              <div className="property-section">
                <div className="property-label">0. ID (int)</div>
                {isEditing ? (
                  <input
                    type="number"
                    className="property-input"
                    value={editData.nodeId}
                    onChange={(e) => setEditData(prev => ({ ...prev, nodeId: e.target.value }))}
                    placeholder="輸入整數 ID"
                  />
                ) : (
                  <div className="property-value">
                    {selectedNode.data.metadata?.nodeId ?? '（未設定）'}
                    <span className="property-value-sub">RF: {selectedNode.id}</span>
                  </div>
                )}
              </div>

              {/* 1. 節點名稱 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">1. 節點名稱 *</div>
                {isEditing ? (
                  <input
                    type="text"
                    className="property-input"
                    value={editData.label}
                    onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="輸入節點名稱"
                    autoFocus
                  />
                ) : (
                  <div className="property-value">{selectedNode.data.label}</div>
                )}
              </div>

              {/* 2. 功能 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">2. 功能</div>
                {isEditing ? (
                  <input
                    type="text"
                    className="property-input"
                    value={editData.function}
                    onChange={(e) => setEditData(prev => ({ ...prev, function: e.target.value }))}
                    placeholder="輸入節點功能"
                  />
                ) : (
                  <div className="property-value">
                    {selectedNode.data.metadata?.function || '（無）'}
                  </div>
                )}
              </div>
              
              {/* 3. 描述 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">3. 描述</div>
                {isEditing ? (
                  <input
                    type="text"
                    className="property-input"
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="輸入詳細描述"
                  />
                ) : (
                  <div className="property-value">
                    {selectedNode.data.metadata?.description || '（無）'}
                  </div>
                )}
              </div>

              {/* 4. Photoshop 座標 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">4. Photoshop 座標</div>
                {isEditing ? (
                  <div className="property-input-group">
                    <input
                      type="number"
                      className="property-input property-input-coord"
                      value={editData.photoshopX}
                      onChange={(e) => setEditData(prev => ({ ...prev, photoshopX: e.target.value }))}
                      placeholder="x"
                    />
                    <input
                      type="number"
                      className="property-input property-input-coord"
                      value={editData.photoshopY}
                      onChange={(e) => setEditData(prev => ({ ...prev, photoshopY: e.target.value }))}
                      placeholder="y"
                    />
                    <input
                      type="number"
                      className="property-input property-input-coord"
                      value={editData.photoshopZ}
                      onChange={(e) => setEditData(prev => ({ ...prev, photoshopZ: e.target.value }))}
                      placeholder="z"
                    />
                  </div>
                ) : (
                  <div className="property-value">
                    {formatCoords(selectedNode.data.metadata?.photoshopCoords)}
                  </div>
                )}
              </div>

              {/* 5. 引擎座標 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">5. 引擎座標</div>
                {isEditing ? (
                  <div className="property-input-group">
                    <input
                      type="number"
                      className="property-input property-input-coord"
                      value={editData.engineX}
                      onChange={(e) => setEditData(prev => ({ ...prev, engineX: e.target.value }))}
                      placeholder="x"
                    />
                    <input
                      type="number"
                      className="property-input property-input-coord"
                      value={editData.engineY}
                      onChange={(e) => setEditData(prev => ({ ...prev, engineY: e.target.value }))}
                      placeholder="y"
                    />
                    <input
                      type="number"
                      className="property-input property-input-coord"
                      value={editData.engineZ}
                      onChange={(e) => setEditData(prev => ({ ...prev, engineZ: e.target.value }))}
                      placeholder="z"
                    />
                  </div>
                ) : (
                  <div className="property-value">
                    {formatCoords(selectedNode.data.metadata?.engineCoords)}
                  </div>
                )}
              </div>

              {/* 6. 疊加模式 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">6. 疊加模式</div>
                {isEditing ? (
                  <select
                    className="property-input"
                    value={editData.blendMode}
                    onChange={(e) => setEditData(prev => ({ ...prev, blendMode: e.target.value }))}
                  >
                    <option value="">未設定</option>
                    {BLEND_MODE_OPTIONS.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                ) : (
                  <div className="property-value">
                    {selectedNode.data.metadata?.blendMode || '（無）'}
                  </div>
                )}
              </div>

              {/* 7. 透明度 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">7. 透明度 (%)</div>
                {isEditing ? (
                  <input
                    type="number"
                    className="property-input"
                    value={editData.opacity}
                    onChange={(e) => setEditData(prev => ({ ...prev, opacity: e.target.value }))}
                    placeholder="0-100"
                    min="0"
                    max="100"
                  />
                ) : (
                  <div className="property-value">
                    {selectedNode.data.metadata?.opacity || '（無）'}
                  </div>
                )}
              </div>

              {/* 8. 遮罩 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">8. 遮罩</div>
                {isEditing ? (
                  <input
                    type="text"
                    className="property-input"
                    value={editData.mask}
                    onChange={(e) => setEditData(prev => ({ ...prev, mask: e.target.value }))}
                    placeholder='輸入 JSON 物件，例如 {"type":"alpha"}'
                  />
                ) : (
                  <div className="property-value property-value-monospace">
                    {formatMask(selectedNode.data.metadata?.mask)}
                  </div>
                )}
              </div>

              {/* 備註 - 可編輯 */}
              <div className="property-section">
                <div className="property-label">備註</div>
                {isEditing ? (
                  <input
                    type="text"
                    className="property-input"
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="輸入其他備註"
                  />
                ) : (
                  <div className="property-value">
                    {selectedNode.data.metadata?.notes || '（無）'}
                  </div>
                )}
              </div>
              
              {/* 編輯按鈕 */}
              {isEditing && (
                <div className="property-section property-section-buttons">
                  <div className="property-edit-buttons">
                    <button className="btn-save" onClick={handleEditSave}>
                      ✓ 儲存全部
                    </button>
                    <button className="btn-cancel" onClick={handleEditCancel}>
                      ✕ 取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {contextMenu.visible && (
        <div
          className="tree-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="tree-context-menu-item"
            onClick={handleAddChildFromMenu}
            disabled={!onAddNode}
          >
            ➕ 新增子節點 (Tab)
          </button>
          <button
            className={`tree-context-menu-item ${isDeleteDisabled ? 'disabled' : ''}`}
            onClick={handleDeleteFromMenu}
            disabled={isDeleteDisabled}
          >
            🗑️ 刪除節點
          </button>
        </div>
      )}
    </div>
  );
}
