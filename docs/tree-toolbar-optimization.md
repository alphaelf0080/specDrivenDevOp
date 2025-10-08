# 樹狀圖工具列優化

## 功能說明

優化樹狀圖頁面工具列布局，將「返回首頁」按鈕放在左側，「全部展開」按鈕放在右側，並移除外部懸浮按鈕。

## 變更內容

### 1. TreeDiagram 元件更新

**新增 Props**：
- `onBackHome?: () => void` - 返回首頁回調函數

**工具列布局**：
```
┌─────────────────────────────────────┐
│ [← 返回首頁]  樹枝圖  [全部展開]    │
└─────────────────────────────────────┘
    左側          中間      右側
```

### 2. 樣式優化

**新增 CSS 類別**：
- `.tree-title` - 標題居中，flex: 1
- `.btn-back-home` - 返回按鈕（紫色主題）
- `.btn-expand-all` - 展開按鈕（綠色主題）

**按鈕樣式**：
- 統一邊框和圓角
- Hover 效果：背景色變化
- 圖標 + 文字組合
- 顏色主題化

### 3. 頁面整合

更新三個樹狀圖頁面：
- `TreeUiLayoutPage` - UI Layout 樹狀圖
- `TreeUiLayoutRichPage` - UI Layout 完整資訊
- `TreePsdStructurePage` - PSD 完整結構樹

每個頁面都新增 `onBackHome` prop 並傳遞給 TreeDiagram。

### 4. App.tsx 簡化

移除外部懸浮按鈕，直接渲染樹狀圖頁面組件：

**之前**：
```tsx
case 'tree-ui-layout':
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleBackToHome}>← 返回首頁</button>
      <TreeUiLayoutPage />
    </div>
  );
```

**之後**：
```tsx
case 'tree-ui-layout':
  return <TreeUiLayoutPage onBackHome={handleBackToHome} />;
```

## 視覺設計

### 按鈕主題

| 按鈕 | 圖標 | 顏色 | Hover 背景 |
|------|------|------|-----------|
| 返回首頁 | ← | #667eea (紫) | #eef2ff |
| 全部展開 | - | #22c55e (綠) | #f0fdf4 |

### 工具列樣式

- 背景：白色 (#fff)
- 底部邊框：#e2e8f0
- Padding：8px 12px
- 按鈕間距：8px

## 技術細節

**修改檔案**：
- `client/components/Tree/TreeDiagram.tsx` - 核心元件
- `client/components/Tree/TreeDiagram.css` - 樣式
- `client/components/Tree/TreeUiLayoutPage.tsx`
- `client/components/Tree/TreeUiLayoutRichPage.tsx`
- `client/components/Tree/TreePsdStructurePage.tsx`
- `client/App.tsx` - 路由整合

**TypeScript 類型**：
```typescript
interface TreeDiagramProps {
  // ...existing props
  onBackHome?: () => void;
}

interface TreeUiLayoutPageProps {
  onBackHome?: () => void;
}
```

## 使用體驗

✅ 更統一的視覺層級  
✅ 按鈕位置符合常規習慣（返回在左，操作在右）  
✅ 移除懸浮按鈕，減少視覺干擾  
✅ 主題化配色，增強識別度  
✅ 響應式 hover 效果
