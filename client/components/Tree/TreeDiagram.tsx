import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, BaseEdge, Controls, Edge, EdgeProps, Handle, MarkerType, Node, Position, getSmoothStepPath } from 'reactflow';
import 'reactflow/dist/style.css';
import './TreeDiagram.css';
import dagre from 'dagre';

export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

export type TreeDiagramProps = {
  data: TreeNode;
  direction?: 'LR' | 'TB';
  nodeWidth?: number;
  nodeHeight?: number;
  renderNode?: (args: { id: string; data: any }) => React.ReactNode;
  onSelectNode?: (node: Node) => void;
  defaultCollapsedIds?: string[];
};

const nodeDefaults = { width: 200, height: 56 };

const depthPalette = [
  { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' }, // indigo - 深藍紫 (淡背景+深邊框)
  { bg: '#cffafe', border: '#06b6d4', text: '#0e7490' }, // cyan - 青色
  { bg: '#dcfce7', border: '#22c55e', text: '#15803d' }, // green - 綠色
  { bg: '#fed7aa', border: '#f97316', text: '#c2410c' }, // orange - 橙色
  { bg: '#fce7f3', border: '#ec4899', text: '#be185d' }, // pink - 粉紅
  { bg: '#e2e8f0', border: '#64748b', text: '#334155' }, // slate - 灰藍
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
  g.setGraph({ rankdir: dir, nodesep, ranksep, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function walk(n: TreeNode, parent?: TreeNode, depth = 0) {
    g.setNode(n.id, { width: nodeSize.width, height: nodeSize.height });
    nodes.push({ id: n.id, data: { label: n.label, depth }, position: { x: 0, y: 0 } });
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

  return { nodes: positionedNodes, edges };
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

export default function TreeDiagram({ data, direction = 'LR', nodeWidth = 200, nodeHeight = 56, renderNode, onSelectNode, defaultCollapsedIds }: TreeDiagramProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    (defaultCollapsedIds || []).forEach(id => { init[id] = true; });
    return init;
  });
  const nodeSize = useMemo(() => ({ width: nodeWidth, height: nodeHeight }), [nodeWidth, nodeHeight]);

  const filteredData = useMemo<TreeNode>(() => {
    function filter(n: TreeNode): TreeNode {
      if (collapsed[n.id]) return { id: n.id, label: n.label, children: [] };
      return { id: n.id, label: n.label, children: n.children?.map(filter) };
    }
    return filter(data);
  }, [data, collapsed]);

  const { nodes, edges } = useMemo(() => layoutTree(filteredData, direction, nodeSize), [filteredData, direction, nodeSize]);

  const onNodeClick = useCallback((_e: any, node: Node) => {
    setCollapsed((prev) => ({ ...prev, [node.id]: !prev[node.id] }));
    onSelectNode && onSelectNode(node);
  }, [onSelectNode]);

  const nodeTypes = useMemo(() => ({
    default: ({ data, id }: any) => {
      const depth = typeof data.depth === 'number' ? data.depth : 0;
      const style = styleForDepth(depth);
      const dir = data.direction || 'LR';
      return (
        <div className={`tree-node ${id === data.rootId ? 'root' : ''} ${collapsed[id] ? 'collapsed' : ''}`} style={style}>
          <Handle
            type="target"
            position={dir === 'LR' ? Position.Left : Position.Top}
            style={{ opacity: 0 }}
          />
          {renderNode ? renderNode({ id, data }) : data.label}
          <Handle
            type="source"
            position={dir === 'LR' ? Position.Right : Position.Bottom}
            style={{ opacity: 0 }}
          />
        </div>
      );
    },
  }), [collapsed, renderNode]);

  const initialNodes = nodes.map(n => ({ ...n, data: { ...n.data, rootId: data.id, direction } }));
  const edgeTypes = useMemo(() => ({ coloredSmooth: ColoredSmoothEdge }), []);

  return (
    <div className="tree-diagram-container">
      <div className="tree-toolbar">
        <span>樹枝圖</span>
        <button onClick={() => setCollapsed({})}>全部展開</button>
      </div>
      <div className="tree-diagram-flow">
        <ReactFlow
          nodes={initialNodes}
          edges={edges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'coloredSmooth' }}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll
          panOnScroll
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
