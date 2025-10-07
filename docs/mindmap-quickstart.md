# 心智圖模組 - 快速入門

## 🎯 概述

心智圖模組已成功整合到專案中，提供完整的可視化心智圖繪製功能。

## 📁 檔案結構

```
client/
├── types/
│   └── mindmap.ts                # 型別定義
├── components/
│   └── MindMap/
│       ├── index.ts              # 模組匯出
│       ├── MindMapCanvas.tsx     # 畫布元件
│       ├── MindMapCanvas.css     # 畫布樣式
│       ├── MindMapNode.tsx       # 節點元件
│       ├── MindMapNode.css       # 節點樣式
│       ├── MindMapDemo.tsx       # 示範元件
│       └── MindMapDemo.css       # 示範樣式
└── hooks/
    └── useMindMap.ts             # 資料管理 Hook
```

## 🚀 快速開始

### 1. 啟動開發伺服器

```bash
# 同時啟動前後端
npm run dev

# 或分別啟動
npm run dev:server  # 後端：http://localhost:5010
npm run dev:client  # 前端：http://localhost:5030
```

### 2. 訪問心智圖

1. 開啟瀏覽器：http://localhost:5030
2. 點擊「📊 開啟心智圖」按鈕
3. 開始使用心智圖工具

## ✨ 主要功能

- ✅ **自動布局**：使用 Dagre 演算法智能排列節點
- ✅ **拖曳操作**：可拖曳節點自由移動
- ✅ **縮放控制**：滾輪縮放、控制面板縮放
- ✅ **節點連接**：點擊節點建立連接
- ✅ **多選操作**：框選多個節點
- ✅ **小地圖導航**：快速定位
- ✅ **歷史記錄**：復原/重做功能
- ✅ **資料匯出**：JSON 格式匯出
- ✅ **動畫效果**：流暢的連接線動畫

## 🎨 節點類型

### Root（根節點）
- 紫色漸層背景
- 適用於主題或中心概念

### Branch（分支節點）
- 綠色邊框
- 適用於主要分類或章節

### Leaf（葉節點）
- 橘色邊框
- 適用於具體項目或細節

## 🛠️ 工具列功能

| 按鈕 | 功能 | 快捷鍵 |
|------|------|--------|
| ➕ 新增節點 | 隨機添加新節點 | - |
| 🔄 重新布局 | 重新計算節點位置 | - |
| ↶ 復原 | 撤銷上一步操作 | - |
| ↷ 重做 | 重做被撤銷的操作 | - |
| 💾 匯出 JSON | 下載心智圖資料 | - |
| 🗑️ 清空 | 重置所有資料 | - |

## 📝 程式碼範例

### 基礎使用

```tsx
import { MindMapDemo } from './components/MindMap';

function App() {
  return <MindMapDemo />;
}
```

### 自訂實作

```tsx
import { MindMapCanvas, useMindMap } from './components/MindMap';

function MyMindMap() {
  const { nodes, edges, initializeData } = useMindMap();

  React.useEffect(() => {
    initializeData({
      nodes: [
        { id: '1', label: '根節點', type: 'root' },
        { id: '2', label: '子節點', type: 'branch' },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
      ],
    });
  }, []);

  return (
    <MindMapCanvas
      initialNodes={nodes}
      initialEdges={edges}
      config={{ minimap: true, controls: true }}
    />
  );
}
```

## 🎯 使用案例

### 1. SDD 開發流程
預設示範展示了 Spec-Driven Development 的完整流程：
- 規格定義
- 引擎開發
- 測試驗證
- 部署發布

### 2. 專案規劃
可用於：
- 專案架構設計
- 功能模組分解
- 任務依賴關係
- 團隊協作流程

### 3. 知識管理
適合：
- 學習筆記整理
- 技術文檔結構
- API 設計圖
- 資料庫 ER 圖

## 📚 進階功能

### 自訂節點樣式

```typescript
const customNode: MindMapNode = {
  id: 'custom-1',
  label: '自訂節點',
  type: 'branch',
  style: {
    backgroundColor: '#ff6b6b',
    borderColor: '#c92a2a',
    textColor: 'white',
    fontSize: 16,
    borderRadius: 12,
  },
};
```

### 程式化添加節點

```typescript
const { addNode } = useMindMap();

// 添加到特定父節點
addNode('parent-id', {
  label: '新節點',
  type: 'leaf',
  data: { description: '描述文字' },
});
```

### 匯出資料

```typescript
const { exportData } = useMindMap();

const data = exportData();
console.log(JSON.stringify(data, null, 2));
```

## 🔧 配置選項

```typescript
const config: MindMapConfig = {
  layout: 'horizontal',        // 布局方向：horizontal | vertical
  animated: true,              // 啟用動畫效果
  minimap: true,               // 顯示小地圖
  controls: true,              // 顯示控制面板
  zoomOnScroll: true,          // 滾輪縮放
  panOnDrag: true,             // 拖曳平移
  nodeSpacing: 50,             // 節點間距
  rankSpacing: 100,            // 層級間距
};
```

## ⚡ 效能提示

1. **大量節點**：關閉 minimap 和 animated
2. **初次載入**：使用懶加載載入心智圖元件
3. **頻繁更新**：使用 React.memo 優化渲染

## 🐛 常見問題

### Q: 節點重疊怎麼辦？
A: 點擊「🔄 重新布局」按鈕重新計算位置

### Q: 如何匯出圖片？
A: 目前僅支援 JSON 匯出，圖片匯出功能開發中

### Q: 能否自訂節點形狀？
A: 可以透過 CSS 修改 `.mindmap-node` 類別樣式

### Q: 支援協作編輯嗎？
A: 目前為本地版本，協作功能待後續版本

## 📖 完整文檔

詳細使用指南請參閱：
- [mindmap-usage-guide.md](./mindmap-usage-guide.md)

## 🎓 學習資源

- [ReactFlow 官方文檔](https://reactflow.dev/)
- [Dagre 布局算法](https://github.com/dagrejs/dagre)

---

**最後更新**：2025-10-06  
**版本**：1.0.0
