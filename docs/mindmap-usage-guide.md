# 心智圖模組使用指南

## 📚 目錄

- [簡介](#簡介)
- [安裝](#安裝)
- [快速開始](#快速開始)
- [API 參考](#api-參考)
- [範例](#範例)
- [自訂樣式](#自訂樣式)
- [最佳實踐](#最佳實踐)

---

## 簡介

心智圖模組是一個基於 React + TypeScript + ReactFlow 的可視化工具，用於繪製和管理心智圖、流程圖、組織架構圖等。

### 主要特性

- ✅ **TypeScript 支援**：完整的型別定義
- 🎨 **可自訂樣式**：支援節點和邊線的自訂樣式
- 🔄 **自動布局**：使用 Dagre 演算法自動排列
- 📱 **響應式設計**：適配各種螢幕尺寸
- 🎭 **豐富互動**：拖曳、縮放、連接、選擇
- 💾 **資料匯出**：支援 JSON 格式匯出
- ↶ **歷史記錄**：支援復原/重做操作
- 🎯 **易於整合**：模組化設計，易於嵌入現有專案

---

## 安裝

```bash
npm install reactflow dagre @types/dagre
```

---

## 快速開始

### 基礎使用

```tsx
import React from 'react';
import { MindMapDemo } from './components/MindMap';

function App() {
  return <MindMapDemo />;
}

export default App;
```

### 自訂實作

```tsx
import React, { useEffect } from 'react';
import { MindMapCanvas, useMindMap, MindMapData } from './components/MindMap';

function MyMindMap() {
  const { nodes, edges, initializeData } = useMindMap();

  useEffect(() => {
    const data: MindMapData = {
      nodes: [
        { id: '1', label: '根節點', type: 'root' },
        { id: '2', label: '子節點 1', type: 'branch' },
        { id: '3', label: '子節點 2', type: 'branch' },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '1', target: '3' },
      ],
    };
    initializeData(data);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MindMapCanvas
        initialNodes={nodes}
        initialEdges={edges}
        config={{ minimap: true, controls: true }}
      />
    </div>
  );
}
```

---

## API 參考

### MindMapData 型別

```typescript
interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  title?: string;
  description?: string;
}

interface MindMapNode {
  id: string;
  label: string;
  type?: 'root' | 'branch' | 'leaf';
  data?: Record<string, any>;
  style?: NodeStyle;
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: EdgeStyle;
}
```

### MindMapConfig 配置

```typescript
interface MindMapConfig {
  layout?: 'horizontal' | 'vertical' | 'radial';  // 布局方向
  nodeSpacing?: number;                            // 節點間距
  rankSpacing?: number;                            // 層級間距
  edgeType?: 'default' | 'step' | 'smoothstep';  // 邊線類型
  animated?: boolean;                              // 動畫效果
  minimap?: boolean;                               // 小地圖
  controls?: boolean;                              // 控制面板
  zoomOnScroll?: boolean;                          // 滾輪縮放
  panOnDrag?: boolean;                             // 拖曳平移
}
```

### useMindMap Hook

```typescript
const {
  nodes,           // 當前節點列表
  edges,           // 當前邊線列表
  addNode,         // 添加節點
  updateNode,      // 更新節點
  deleteNode,      // 刪除節點
  exportData,      // 匯出資料
  initializeData,  // 初始化資料
  relayout,        // 重新布局
  undo,            // 復原
  redo,            // 重做
  reset,           // 重置
  canUndo,         // 是否可復原
  canRedo,         // 是否可重做
} = useMindMap(initialData?, config?);
```

### 主要方法

#### addNode

```typescript
addNode(parentId: string, nodeData: Omit<MindMapNode, 'id'>): void
```

添加新節點到指定父節點。

#### updateNode

```typescript
updateNode(id: string, updates: Partial<MindMapNode>): void
```

更新指定節點的屬性。

#### deleteNode

```typescript
deleteNode(id: string): void
```

刪除指定節點及其相關連接。

#### exportData

```typescript
exportData(): MindMapData
```

匯出當前心智圖資料為 JSON 格式。

---

## 範例

### 範例 1：基礎心智圖

```tsx
const basicData: MindMapData = {
  title: '專案規劃',
  nodes: [
    { id: '1', label: '專案啟動', type: 'root' },
    { id: '2', label: '需求分析', type: 'branch' },
    { id: '3', label: '設計階段', type: 'branch' },
    { id: '4', label: '開發階段', type: 'branch' },
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '1', target: '3' },
    { id: 'e3', source: '1', target: '4' },
  ],
};
```

### 範例 2：垂直布局

```tsx
const { nodes, edges, initializeData } = useMindMap(undefined, {
  layout: 'vertical',  // 垂直布局
  animated: true,
});
```

### 範例 3：動態添加節點

```tsx
function DynamicMindMap() {
  const { nodes, edges, addNode, initializeData } = useMindMap();

  useEffect(() => {
    initializeData({
      nodes: [{ id: 'root', label: '根節點', type: 'root' }],
      edges: [],
    });
  }, []);

  const handleAddChild = () => {
    addNode('root', {
      label: `新節點 ${Date.now()}`,
      type: 'leaf',
    });
  };

  return (
    <>
      <button onClick={handleAddChild}>添加子節點</button>
      <MindMapCanvas initialNodes={nodes} initialEdges={edges} />
    </>
  );
}
```

### 範例 4：自訂節點樣式

```tsx
const styledData: MindMapData = {
  nodes: [
    {
      id: '1',
      label: '重要節點',
      type: 'root',
      style: {
        backgroundColor: '#ff6b6b',
        borderColor: '#c92a2a',
        textColor: 'white',
        fontSize: 18,
        borderRadius: 12,
      },
    },
  ],
  edges: [],
};
```

---

## 自訂樣式

### 全域樣式覆蓋

在您的 CSS 檔案中：

```css
/* 自訂根節點樣式 */
.mindmap-node-root {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  font-size: 18px;
  padding: 16px 24px;
}

/* 自訂邊線樣式 */
.react-flow__edge-path {
  stroke: #667eea;
  stroke-width: 3;
}
```

### 主題配置

```tsx
// 建立自訂主題
const darkTheme = {
  backgroundColor: '#1e293b',
  nodeColor: '#334155',
  textColor: '#f1f5f9',
  borderColor: '#475569',
  edgeColor: '#64748b',
};

// 應用到元件
<div style={{ background: darkTheme.backgroundColor }}>
  <MindMapCanvas initialNodes={nodes} initialEdges={edges} />
</div>
```

---

## 最佳實踐

### 1. 效能優化

```tsx
// 使用 memo 避免不必要的重新渲染
const MemoizedMindMap = React.memo(MindMapCanvas);

// 大量節點時限制渲染區域
<MindMapCanvas
  initialNodes={nodes}
  initialEdges={edges}
  config={{
    zoomOnScroll: true,
    panOnDrag: true,
    minimap: false,  // 大量節點時關閉小地圖
  }}
/>
```

### 2. 資料驗證

```tsx
import { z } from 'zod';

const MindMapNodeSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  type: z.enum(['root', 'branch', 'leaf']).optional(),
});

// 驗證資料
function validateMindMapData(data: unknown) {
  return MindMapNodeSchema.array().safeParse(data);
}
```

### 3. 錯誤處理

```tsx
function SafeMindMap() {
  const [error, setError] = useState<string | null>(null);
  
  const handleImport = (data: unknown) => {
    try {
      const validation = validateMindMapData(data);
      if (!validation.success) {
        setError('資料格式錯誤');
        return;
      }
      initializeData(validation.data);
    } catch (err) {
      setError('載入失敗');
    }
  };

  if (error) return <div>錯誤：{error}</div>;
  return <MindMapCanvas />;
}
```

### 4. 響應式設計

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

function ResponsiveMindMap() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <MindMapCanvas
      config={{
        controls: !isMobile,  // 手機隱藏控制面板
        minimap: !isMobile,   // 手機隱藏小地圖
      }}
    />
  );
}
```

---

## 進階功能

### 匯出為圖片

```tsx
import html2canvas from 'html2canvas';

const exportAsImage = async () => {
  const element = document.querySelector('.mindmap-canvas');
  if (!element) return;

  const canvas = await html2canvas(element as HTMLElement);
  const link = document.createElement('a');
  link.download = 'mindmap.png';
  link.href = canvas.toDataURL();
  link.click();
};
```

### 搜尋節點

```tsx
const searchNode = (keyword: string) => {
  return nodes.filter((node) =>
    node.data.label.toLowerCase().includes(keyword.toLowerCase())
  );
};
```

### 折疊/展開

```tsx
const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

const toggleCollapse = (nodeId: string) => {
  setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    return next;
  });
};
```

---

## 疑難排解

### 問題：節點重疊

**解決方案**：調整布局參數

```tsx
const config: MindMapConfig = {
  nodeSpacing: 100,  // 增加節點間距
  rankSpacing: 150,  // 增加層級間距
};
```

### 問題：效能緩慢

**解決方案**：
1. 關閉不必要的功能（minimap, animated）
2. 使用虛擬化渲染
3. 限制節點數量

### 問題：自訂樣式不生效

**解決方案**：確保 CSS 載入順序正確

```tsx
// 先載入預設樣式
import 'reactflow/dist/style.css';
// 再載入自訂樣式
import './MindMapNode.css';
```

---

## 授權

MIT License

---

## 相關資源

- [ReactFlow 官方文檔](https://reactflow.dev/)
- [Dagre 布局演算法](https://github.com/dagrejs/dagre)
- [專案 GitHub](https://github.com/your-repo/specDrivenDevOp)
