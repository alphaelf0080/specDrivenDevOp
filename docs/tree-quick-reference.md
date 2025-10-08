# 樹狀圖系統快速參考

## 🚀 快速開始

### 使用樹狀圖

```typescript
import TreeDiagram from '@/components/Tree/TreeDiagram';

<TreeDiagram
  data={treeData}           // TreeNode 資料
  direction="LR"            // 'LR' | 'TB'
  onBackHome={() => navigate('/')}
/>
```

### 基本操作

| 操作 | 說明 |
|------|------|
| 點擊節點 | 收合/展開子節點 + 顯示屬性 |
| 滾輪 | 縮放視圖 |
| 拖曳 | 移動視窗位置 |
| 全部展開 | 展開所有收合的節點 |
| 返回首頁 | 回到導覽頁面 |

## 📐 布局配置

### Grid 布局

```
┌─────────────────────────────────────┐
│          工具列 (auto)               │
├────┬─────────────────────┬──────────┤
│ 左 │      中間           │   右      │
│ 80 │      1fr            │   320     │
└────┴─────────────────────┴──────────┘
```

### 方向選擇

```typescript
direction="LR"  // 水平：左→右（適合寬樹）
direction="TB"  // 垂直：上→下（適合深樹）
```

## 🎨 配色系統

### 節點顏色（深度 0-5）

```typescript
const depthPalette = [
  { bg: '#312e81', border: '#818cf8', text: '#c7d2fe' }, // 0: 靛藍
  { bg: '#164e63', border: '#22d3ee', text: '#a5f3fc' }, // 1: 青色
  { bg: '#14532d', border: '#4ade80', text: '#bbf7d0' }, // 2: 綠色
  { bg: '#7c2d12', border: '#fb923c', text: '#fed7aa' }, // 3: 橙色
  { bg: '#831843', border: '#f472b6', text: '#fbcfe8' }, // 4: 粉紅
  { bg: '#334155', border: '#94a3b8', text: '#cbd5e1' }, // 5: 灰藍
];
```

### 獲取節點樣式

```typescript
const style = styleForDepth(depth);
// 返回：{ background, border, color, fontWeight }
```

## 📋 資料格式

### TreeNode 結構

```typescript
type TreeNode = {
  id: string;              // 唯一識別碼
  label: string;           // 顯示標籤
  children?: TreeNode[];   // 子節點陣列
};
```

### 範例資料

```typescript
const treeData: TreeNode = {
  id: 'root',
  label: '根節點',
  children: [
    {
      id: 'child1',
      label: '子節點 1',
      children: [
        { id: 'grandchild1', label: '孫節點 1' },
        { id: 'grandchild2', label: '孫節點 2' }
      ]
    },
    {
      id: 'child2',
      label: '子節點 2'
    }
  ]
};
```

## 🔧 常用功能

### 預設收合特定節點

```typescript
<TreeDiagram
  data={treeData}
  defaultCollapsedIds={['child1', 'child2']}
/>
```

### 自訂節點渲染

```typescript
<TreeDiagram
  data={treeData}
  renderNode={({ id, data }) => (
    <div>
      <strong>{data.label}</strong>
      <span>{id}</span>
    </div>
  )}
/>
```

### 監聽節點選取

```typescript
<TreeDiagram
  data={treeData}
  onSelectNode={(node) => {
    console.log('選取:', node.id, node.data);
  }}
/>
```

## 🎯 屬性面板

### 顯示資訊

- **ID**：節點唯一識別碼
- **標籤**：節點顯示文字
- **深度**：從根節點算起的層級（0開始）
- **位置**：節點在畫布上的 X, Y 座標
- **狀態**：已展開 / 已收合
- **顏色**：節點配色預覽（色塊）

### 空狀態

未選取節點時顯示：
```
     👆
  點擊節點查看屬性
```

## 📊 瀏覽歷史

### 記錄訪問

```typescript
import { recordTreeVisit } from '@/utils/treeHistory';

recordTreeVisit(
  'ui-layout',           // ID
  'UI Layout 樹',        // 名稱
  '/tree/ui-layout'      // 路徑
);
```

### 獲取歷史

```typescript
import { getTreeHistory } from '@/utils/treeHistory';

const history = getTreeHistory(); // 最多 3 筆
```

### 清除歷史

```typescript
localStorage.removeItem('treeHistory');
```

## ⚡ 效能優化

### 布局緩存

```typescript
// ✅ 好：只在 data 改變時重新計算
const fullLayout = useMemo(
  () => layoutTree(data, direction, nodeSize), 
  [data, direction, nodeSize]
);

// ❌ 壞：每次 collapsed 都重新計算
const layout = layoutTree(filteredData, direction, nodeSize);
```

### 可見性過濾

```typescript
// 使用 Set 快速查找（O(1)）
const visibleNodeIds = new Set<string>();

// 遞迴標記可見節點（O(V+E)）
function markVisible(nodeId: string) {
  visibleNodeIds.add(nodeId);
  if (!collapsed[nodeId]) {
    // 標記子節點...
  }
}
```

## 🐛 常見問題

### Q1: 節點收合時位置移動？

**A:** 已修復。使用 `fullLayout` 緩存完整樹布局，收合時只過濾可見性。

### Q2: 畫面跳動？

**A:** 已修復。使用 `onInit` + `useEffect` 控制 `fitView` 只執行一次。

### Q3: 連線不見了？

**A:** 已修復。為每個節點明確定義 `Handle` 組件。

### Q4: 大型樹效能問題？

**A:** 
- 使用 `useMemo` 緩存布局
- 使用 `Set` 快速過濾
- 避免不必要的重新渲染

### Q5: 自訂節點樣式？

**A:** 
```typescript
<TreeDiagram
  renderNode={({ id, data }) => (
    <div className="custom-node">
      {/* 自訂內容 */}
    </div>
  )}
/>
```

## 🔗 相關連結

### 文件

- [系統總覽](./tree-system-overview.md)
- [Dark 模式](./tree-dark-mode.md)
- [屬性面板](./tree-property-panel.md)
- [視窗固定](./tree-fixed-viewport.md)
- [節點固定](./tree-node-position-fixed.md)

### 外部資源

- [React Flow 文件](https://reactflow.dev/)
- [Dagre 文件](https://github.com/dagrejs/dagre/wiki)

## 📝 CSS 類別參考

```css
.tree-diagram-container    /* 主容器 */
.tree-toolbar              /* 工具列 */
.tree-sidebar-left         /* 左側導覽 */
.tree-diagram-flow         /* 中間樹狀圖 */
.tree-sidebar-right        /* 右側屬性面板 */
.tree-node                 /* 節點 */
.tree-node.root            /* 根節點 */
.tree-node.collapsed       /* 已收合節點 */
.sidebar-tool-btn          /* 側邊欄按鈕 */
.property-panel            /* 屬性面板 */
.property-section          /* 屬性區段 */
.property-label            /* 屬性標籤 */
.property-value            /* 屬性值 */
.color-preview             /* 顏色預覽 */
```

## 🎨 視覺效果

### 節點 Hover

```css
.tree-node:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.6);
  transform: translateY(-1px);
  filter: brightness(1.2);
}
```

### 按鈕 Hover

```css
.tree-toolbar button:hover {
  background: #475569;
  border-color: #64748b;
}

.btn-back-home:hover {
  background: rgba(99, 102, 241, 0.2) !important;
}
```

## 🧪 測試

### 功能測試

```typescript
// 測試節點點擊
const handleNodeClick = jest.fn();
render(<TreeDiagram data={data} onSelectNode={handleNodeClick} />);
fireEvent.click(screen.getByText('節點1'));
expect(handleNodeClick).toHaveBeenCalled();
```

### 視覺測試

```typescript
// 測試配色
const style = styleForDepth(0);
expect(style.background).toBe('#312e81');
expect(style.border).toContain('#818cf8');
```

## 📱 響應式設計

目前固定布局：`80px 1fr 320px`

未來可改為：
```css
@media (max-width: 768px) {
  grid-template-columns: 60px 1fr 0;
  /* 隱藏右側面板 */
}
```

## 🚀 進階用法

### 動態改變布局方向

```typescript
const [direction, setDirection] = useState<'LR' | 'TB'>('LR');

<TreeDiagram data={data} direction={direction} />
<button onClick={() => setDirection(d => d === 'LR' ? 'TB' : 'LR')}>
  切換方向
</button>
```

### 程式控制收合

```typescript
const [collapsed, setCollapsed] = useState({});

// 收合特定節點
setCollapsed(prev => ({ ...prev, 'node-1': true }));

// 展開所有
setCollapsed({});
```

### 節點搜尋

```typescript
const searchNode = (keyword: string) => {
  const found = findNodeById(treeData, keyword);
  if (found) {
    // 展開到該節點的路徑
    const path = getPathToNode(found.id);
    path.forEach(id => {
      setCollapsed(prev => ({ ...prev, [id]: false }));
    });
  }
};
```

---

**快速參考版本：** 1.0  
**最後更新：** 2025年10月8日
