/**
 * 心智圖資料結構定義
 */

export interface MindMapNode {
  id: string;
  label: string;
  type?: "root" | "branch" | "leaf";
  data?: Record<string, unknown>;
  style?: NodeStyle;
  position?: {
    x: number;
    y: number;
  };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: EdgeStyle;
}

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  fontSize?: number;
  borderRadius?: number;
  padding?: number;
}

export interface EdgeStyle {
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  animated?: boolean;
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  title?: string;
  description?: string;
}

export interface MindMapConfig {
  layout?: "horizontal" | "vertical" | "radial";
  nodeSpacing?: number;
  rankSpacing?: number;
  edgeType?: "default" | "step" | "smoothstep" | "straight";
  animated?: boolean;
  minimap?: boolean;
  controls?: boolean;
  zoomOnScroll?: boolean;
  panOnDrag?: boolean;
  nodesDraggable?: boolean;
}

export interface MindMapActions {
  addNode: (parentId: string, node: Omit<MindMapNode, "id">) => void;
  updateNode: (id: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<MindMapEdge, "id">) => void;
  updateEdge: (id: string, updates: Partial<MindMapEdge>) => void;
  deleteEdge: (id: string) => void;
  exportData: () => MindMapData;
  importData: (data: MindMapData) => void;
  reset: () => void;
}
