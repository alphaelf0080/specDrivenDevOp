import { useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Node, Edge } from 'reactflow';
import dagre from 'dagre';
import { MindMapData, MindMapNode, MindMapEdge, MindMapConfig } from '../types/mindmap';

/**
 * 心智圖自動布局
 */
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 172;
  const nodeHeight = 80;

  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 50,
    ranksep: 100,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * 根據目標節點位置決定根節點使用哪個 source handle
 */
const getSourceHandleForRootNode = (targetNode: Node): string => {
  const x = targetNode.position.x;
  const y = targetNode.position.y;
  
  // 判斷目標節點在哪個方向
  const angle = Math.atan2(y, x) * (180 / Math.PI);
  
  // 根據角度決定使用哪個 handle
  // -45 到 45 度：右邊
  // 45 到 135 度：下方
  // 135 到 180 或 -180 到 -135 度：左邊
  // -135 到 -45 度：上方
  if (angle >= -45 && angle < 45) {
    return 'source-right';
  } else if (angle >= 45 && angle < 135) {
    return 'source-bottom';
  } else if (angle >= 135 || angle < -135) {
    return 'source-left';
  } else {
    return 'source-top';
  }
};

/**
 * 根據節點位置決定使用哪個 handle
 */
const determineHandles = (sourceNode: Node, targetNode: Node): { sourceHandle: string; targetHandle: string } => {
  // 如果 source 是根節點，根據目標位置選擇 handle
  if (sourceNode.data.type === 'root' || sourceNode.id === 'root') {
    return {
      sourceHandle: getSourceHandleForRootNode(targetNode),
      targetHandle: 'target'
    };
  }
  
  // 非根節點使用默認的 source handle
  return {
    sourceHandle: 'source',
    targetHandle: 'target'
  };
};

const toReactFlowNodeStyle = (style?: MindMapNode['style']): CSSProperties | undefined => {
  if (!style) {
    return undefined;
  }

  return {
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth !== undefined ? `${style.borderWidth}px` : undefined,
    color: style.textColor,
    fontSize: style.fontSize !== undefined ? `${style.fontSize}px` : undefined,
    borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : undefined,
    padding: style.padding !== undefined ? `${style.padding}px` : undefined,
  };
};

/**
 * 心智圖資料管理 Hook
 */
export const useMindMap = (initialData?: MindMapData, config?: MindMapConfig) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // 初始化資料
  const initializeData = useCallback((data: MindMapData) => {
    const hasExplicitPositions = data.nodes.every(
      (node) => node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number'
    );

    const baseNodes: Node[] = data.nodes.map((node) => ({
      id: node.id,
      type: 'mindmap',
      data: node,
      position: node.position ?? { x: 0, y: 0 },
      // 外層樣式交由自訂節點以 inline style 處理，避免雙邊框
    }));

    // 先創建基本的 edges，保留既有屬性（含 handles/animated/type/markers）
    const baseEdges: Edge[] = data.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: edge.type,
      animated: typeof edge.animated === 'boolean' ? edge.animated : (config?.animated || false),
      style: edge.style as Edge['style'],
      markerStart: edge.markerStart,
      markerEnd: edge.markerEnd,
      updatable: true,
    }));

    let layoutedNodes = baseNodes;
    let layoutedEdges = baseEdges;

    if (!hasExplicitPositions) {
      const direction = config?.layout === 'vertical' ? 'TB' : 'LR';
      const layoutResult = getLayoutedElements(baseNodes, baseEdges, direction);
      layoutedNodes = layoutResult.nodes;
      layoutedEdges = layoutResult.edges;
    }

    // 若某些邊沒有 handles，才根據節點位置推斷
    layoutedEdges = layoutedEdges.map(edge => {
      if (edge.sourceHandle && edge.targetHandle) return edge;
      const sourceNode = layoutedNodes.find(n => n.id === edge.source);
      const targetNode = layoutedNodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        const handles = determineHandles(sourceNode, targetNode);
        return {
          ...edge,
          sourceHandle: edge.sourceHandle || handles.sourceHandle,
          targetHandle: edge.targetHandle || handles.targetHandle,
        } as Edge;
      }
      return edge;
    });

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setHistory([{ nodes: layoutedNodes, edges: layoutedEdges }]);
    setCurrentStep(0);
  }, [config]);

  // 添加節點
  const addNode = useCallback((parentId: string, nodeData: Omit<MindMapNode, 'id'>, onComplete?: (nodes: Node[], edges: Edge[]) => void) => {
    const newNodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'mindmap',
      data: { ...nodeData, id: newNodeId, type: nodeData.type ?? 'leaf' },
      position: { x: 0, y: 0 },
      style: toReactFlowNodeStyle(nodeData.style),
    };

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: parentId,
      target: newNode.id,
      sourceHandle: 'source', // 明確指定使用 source handle
      targetHandle: 'target', // 明確指定使用 target handle
      animated: config?.animated || false,
      updatable: true,
    };

  const layout = config?.layout === 'vertical' ? 'TB' : 'LR';
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...nodes, newNode],
      [...edges, newEdge],
      layout
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // 保存歷史
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push({ nodes: layoutedNodes, edges: layoutedEdges });
    setHistory(newHistory);
    setCurrentStep(currentStep + 1);
    
    // 完成回調
    if (onComplete) {
      setTimeout(() => onComplete(layoutedNodes, layoutedEdges), 0);
    }
  }, [nodes, edges, history, currentStep, config]);

  // 更新節點
  const updateNode = useCallback((id: string, updates: Partial<MindMapNode>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, []);

  // 刪除節點
  const deleteNode = useCallback((id: string, onComplete?: (nodes: Node[], edges: Edge[]) => void) => {
    setNodes((nds) => {
      const filtered = nds.filter((node) => node.id !== id);
      return filtered;
    });
    setEdges((eds) => {
      const filtered = eds.filter((edge) => edge.source !== id && edge.target !== id);
      
      // 完成回調
      if (onComplete) {
        setTimeout(() => {
          setNodes((currentNodes) => {
            setEdges((currentEdges) => {
              onComplete(currentNodes, currentEdges);
              return currentEdges;
            });
            return currentNodes;
          });
        }, 0);
      }
      
      return filtered;
    });
  }, []);

  // 匯出資料
  const exportData = useCallback((): MindMapData => {
    const exportedNodes: MindMapNode[] = nodes.map((node) => {
      const nodeData = node.data as MindMapNode;
      return {
        ...nodeData,
        position: node.position,
        style: nodeData.style,
      };
    });

    const exportedEdges: MindMapEdge[] = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === 'string' ? edge.label : undefined,
      style: edge.style as MindMapEdge['style'],
      ...(typeof edge.animated === 'boolean' ? { animated: edge.animated } : {}),
      ...(typeof edge.type === 'string' ? { type: edge.type } : {}),
      ...(edge.sourceHandle ? { sourceHandle: edge.sourceHandle } : {} as any),
      ...(edge.targetHandle ? { targetHandle: edge.targetHandle } : {} as any),
      ...((edge as any).markerStart ? { markerStart: (edge as any).markerStart as any } : {}),
      ...((edge as any).markerEnd ? { markerEnd: (edge as any).markerEnd as any } : {}),
    }));

    return {
      nodes: exportedNodes,
      edges: exportedEdges,
    };
  }, [nodes, edges]);

  const syncNodes = useCallback((nextNodes: Node[]) => {
    setNodes(nextNodes);
  }, []);

  const syncEdges = useCallback((nextEdges: Edge[]) => {
    setEdges(nextEdges);
  }, []);

  // 重新布局
  const relayout = useCallback(() => {
    const layout = config?.layout === 'vertical' ? 'TB' : 'LR';
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      layout
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, config]);

  // 復原
  const undo = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setNodes(history[prevStep].nodes);
      setEdges(history[prevStep].edges);
      setCurrentStep(prevStep);
    }
  }, [history, currentStep]);

  // 重做
  const redo = useCallback(() => {
    if (currentStep < history.length - 1) {
      const nextStep = currentStep + 1;
      setNodes(history[nextStep].nodes);
      setEdges(history[nextStep].edges);
      setCurrentStep(nextStep);
    }
  }, [history, currentStep]);

  // 重置
  const reset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setHistory([]);
    setCurrentStep(-1);
  }, []);

  return {
    nodes,
    edges,
    addNode,
    updateNode,
    deleteNode,
    exportData,
    syncNodes,
    syncEdges,
    initializeData,
    relayout,
    undo,
    redo,
    reset,
    canUndo: currentStep > 0,
    canRedo: currentStep < history.length - 1,
  };
};
