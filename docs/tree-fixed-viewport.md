# 樹狀圖視窗位置固定功能

## 問題說明

### 原始問題

當使用者點擊節點收合/展開時，整個畫面會自動重新調整位置（fitView），導致視覺跳動，影響使用體驗。

### 問題原因

React Flow 的 `fitView` 屬性設為 `true` 時，會在每次渲染時自動調整視圖以適應所有節點，包括：
- 初始載入時
- 節點數量改變時（收合/展開）
- 組件重新渲染時

這導致使用者每次點擊節點，畫面就會「跳」到新的位置。

## 解決方案

### 核心策略

**只在初始化時執行一次 `fitView`，之後保持使用者的視窗位置不變。**

### 技術實作

#### 1. 移除 `fitView` 屬性

```tsx
// ❌ 原本：每次渲染都會 fitView
<ReactFlow
  fitView  // 移除這個
  ...
/>

// ✅ 現在：不自動 fitView
<ReactFlow
  onInit={onInit}  // 使用 onInit 手動控制
  ...
/>
```

#### 2. 新增狀態管理

```typescript
const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
const hasInitialized = useRef(false);
```

- `reactFlowInstance`：存儲 React Flow 實例
- `hasInitialized`：追蹤是否已初始化（使用 `useRef` 避免重新渲染）

#### 3. 初始化回調

```typescript
const onInit = useCallback((instance: ReactFlowInstance) => {
  setReactFlowInstance(instance);
}, []);
```

React Flow 初始化完成時，保存實例引用。

#### 4. 只執行一次 fitView

```typescript
useEffect(() => {
  if (reactFlowInstance && !hasInitialized.current) {
    reactFlowInstance.fitView({ padding: 0.1 });
    hasInitialized.current = true;
  }
}, [reactFlowInstance]);
```

**執行條件**：
- `reactFlowInstance` 存在（已初始化）
- `hasInitialized.current` 為 `false`（尚未執行過）

**執行後**：
- 將 `hasInitialized.current` 設為 `true`
- 之後不再執行

## 程式碼變更

### 修改檔案

**`client/components/Tree/TreeDiagram.tsx`**

#### 1. 新增 import

```typescript
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { 
  // ... 其他 imports
  ReactFlowInstance,  // ← 新增
  // ...
} from 'reactflow';
```

#### 2. 新增狀態

```typescript
export default function TreeDiagram({ ... }: TreeDiagramProps) {
  // ... 現有狀態
  
  // ← 新增以下兩個狀態
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const hasInitialized = useRef(false);
  
  // ...
}
```

#### 3. 新增初始化邏輯

```typescript
// ← 新增 useEffect
useEffect(() => {
  if (reactFlowInstance && !hasInitialized.current) {
    reactFlowInstance.fitView({ padding: 0.1 });
    hasInitialized.current = true;
  }
}, [reactFlowInstance]);

// ← 新增 onInit 回調
const onInit = useCallback((instance: ReactFlowInstance) => {
  setReactFlowInstance(instance);
}, []);
```

#### 4. 更新 ReactFlow 組件

```tsx
<ReactFlow
  nodes={initialNodes}
  edges={edges}
  onNodeClick={onNodeClick}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  defaultEdgeOptions={{ type: 'coloredSmooth' }}
  onInit={onInit}  // ← 新增
  // fitView  ← 移除此行
  nodesDraggable={false}
  nodesConnectable={false}
  zoomOnScroll
  panOnScroll
>
```

## 行為對比

### 修改前

| 操作 | 畫面行為 |
|------|----------|
| 初次載入 | ✅ 自動調整視圖 |
| 收合節點 | ❌ 畫面重新調整（跳動） |
| 展開節點 | ❌ 畫面重新調整（跳動） |
| 縮放移動 | ⚠️ 下次點擊時會重置 |

### 修改後

| 操作 | 畫面行為 |
|------|----------|
| 初次載入 | ✅ 自動調整視圖 |
| 收合節點 | ✅ 畫面位置不變 |
| 展開節點 | ✅ 畫面位置不變 |
| 縮放移動 | ✅ 保持使用者視窗狀態 |

## 技術細節

### useRef vs useState

**為什麼 `hasInitialized` 使用 `useRef` 而非 `useState`？**

```typescript
// ❌ 使用 useState 會觸發重新渲染
const [hasInitialized, setHasInitialized] = useState(false);

// ✅ 使用 useRef 不會觸發重新渲染
const hasInitialized = useRef(false);
```

`useRef` 的優勢：
- 不會觸發組件重新渲染
- 值在整個組件生命週期保持
- 適合追蹤內部狀態標記

### fitView 參數

```typescript
reactFlowInstance.fitView({ padding: 0.1 });
```

- `padding: 0.1`：視窗四周留 10% 的邊距
- 確保樹狀圖不會緊貼邊緣
- 提供更好的視覺呼吸空間

### useCallback 優化

```typescript
const onInit = useCallback((instance: ReactFlowInstance) => {
  setReactFlowInstance(instance);
}, []);
```

- 避免每次渲染時創建新函數
- 空依賴陣列 `[]` 表示函數永不變化
- 提升效能

## 使用者體驗提升

### 優勢

✅ **視覺穩定**：點擊節點時畫面不跳動  
✅ **上下文保持**：使用者可專注當前區域  
✅ **操作流暢**：快速連續點擊不會迷失方向  
✅ **縮放保留**：手動調整的視窗狀態會保留  
✅ **預期行為**：符合標準應用程式的互動模式

### 使用情境

#### 情境 1：探索大型樹狀圖

1. 使用者放大到某個特定區域
2. 點擊節點展開/收合
3. 畫面保持在當前位置 ✅
4. 使用者可繼續探索附近節點

#### 情境 2：比對兩個節點

1. 使用者調整視窗，將兩個節點都顯示在畫面中
2. 收合其中一個節點
3. 畫面不跳動，另一個節點仍在視野內 ✅
4. 方便進行比對

#### 情境 3：逐層展開

1. 使用者從根節點開始
2. 逐層展開子節點
3. 每次展開後畫面位置保持 ✅
4. 可持續追蹤層級關係

## 相關功能

### 全部展開按鈕

```typescript
<button className="btn-expand-all" onClick={() => setCollapsed({})}>
  全部展開
</button>
```

- 清空 `collapsed` 狀態
- 所有節點展開
- 畫面位置仍然保持不變 ✅

### 返回首頁按鈕

```typescript
<button className="btn-back-home" onClick={onBackHome}>
  返回首頁
</button>
```

- 離開樹狀圖頁面
- 下次進入時會重新初始化
- 再次執行 `fitView`

## 測試建議

### 功能測試

1. **初次載入**
   - 確認樹狀圖自動適應視窗
   - 所有節點可見

2. **收合節點**
   - 點擊任意節點收合
   - 確認畫面位置不變
   - 確認收合動畫流暢

3. **展開節點**
   - 點擊已收合節點展開
   - 確認畫面位置不變
   - 確認新節點出現在預期位置

4. **縮放測試**
   - 使用滾輪縮放
   - 點擊節點
   - 確認縮放級別保持

5. **拖曳測試**
   - 拖曳畫面移動
   - 點擊節點
   - 確認畫面位置保持

6. **連續操作**
   - 快速連續點擊多個節點
   - 確認畫面穩定不跳動

### 邊緣案例

1. **空樹**
   - 只有根節點
   - 確認不會崩潰

2. **深層樹**
   - 10+ 層深度
   - 確認展開時性能良好

3. **寬樹**
   - 單層 50+ 節點
   - 確認視窗處理正確

## 效能考量

### 渲染優化

- `useRef` 避免不必要的重新渲染
- `useCallback` 穩定函數引用
- `useMemo` 緩存計算結果

### 記憶體使用

- `ReactFlowInstance` 單一引用
- 不會累積歷史狀態
- 組件卸載時自動清理

## 未來優化

### 可能的擴展

- [ ] 新增「重置視圖」按鈕（手動執行 fitView）
- [ ] 記住上次的視窗位置（localStorage）
- [ ] 展開特定節點時可選擇是否居中顯示
- [ ] 動畫過渡到新節點位置
- [ ] 鍵盤快捷鍵：Space = 重置視圖

### 進階功能

```typescript
// 重置視圖按鈕
const resetView = () => {
  reactFlowInstance?.fitView({ padding: 0.1, duration: 300 });
};

// 居中顯示節點
const centerNode = (nodeId: string) => {
  reactFlowInstance?.setCenter(
    node.position.x,
    node.position.y,
    { zoom: 1.5, duration: 300 }
  );
};
```

## 總結

這次修改通過精確控制 `fitView` 的執行時機，大幅提升了樹狀圖的使用體驗：

- **技術**：從被動的自動調整改為主動的初始化控制
- **體驗**：從不穩定的跳動改為穩定的固定視窗
- **效能**：減少不必要的視圖計算和重新渲染

符合現代應用程式的互動標準，讓使用者能更專注於內容探索。
