# 樹狀圖視圖狀態持久化功能

## 功能概述

樹狀圖視圖狀態持久化系統允許用戶的 Pan 移動與 Zoom 縮放操作被記錄和恢復，實現跨會話的視圖狀態一致性。當用戶下次訪問相同的樹狀圖時，系統會自動恢復之前的視圖狀態。

## 技術實現

### 核心架構

```typescript
// 視圖狀態管理
const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
const hasInitialized = useRef(false);

// 持久化存儲 Key
const VIEWPORT_STORAGE_KEY = `tree-viewport-${id}`;
```

### 狀態持久化機制

1. **智能初始化邏輯**
   ```typescript
   useEffect(() => {
     if (reactFlowInstance && !hasInitialized.current) {
       try {
         // 直接從 localStorage 讀取視圖狀態
         const savedViewportStr = localStorage.getItem(viewportKey);
         
         if (savedViewportStr) {
           const savedViewport = JSON.parse(savedViewportStr);
           // 驗證數據有效性
           if (savedViewport && 
               typeof savedViewport.x === 'number' && 
               typeof savedViewport.y === 'number' && 
               typeof savedViewport.zoom === 'number') {
             // 延遲 100ms 確保 React Flow 完全初始化
             setTimeout(() => {
               reactFlowInstance.setViewport(savedViewport);
             }, 100);
             hasInitialized.current = true;
             return;
           }
         }
         
         // 首次訪問，使用 fitView
         setTimeout(() => {
           reactFlowInstance.fitView({ padding: 0.1 });
         }, 100);
       } catch (error) {
         console.warn('Failed to initialize viewport:', error);
         setTimeout(() => {
           reactFlowInstance.fitView({ padding: 0.1 });
         }, 100);
       }
       
       hasInitialized.current = true;
     }
   }, [reactFlowInstance, viewportKey]);
   ```

2. **視圖變更檢測與保存（使用 onMove 事件）**
   ```typescript
   // 處理視圖移動事件（Pan & Zoom）
   const onMove = useCallback((_event: any, newViewport: Viewport) => {
     console.log('[TreeDiagram] onMove 觸發:', newViewport);
     debouncedViewportSave(newViewport);
   }, [debouncedViewportSave]);

   // 節流保存
   const debouncedViewportSave = useCallback((newViewport: Viewport) => {
     if (newViewport && 
         typeof newViewport.x === 'number' && 
         typeof newViewport.y === 'number' && 
         typeof newViewport.zoom === 'number' &&
         !isNaN(newViewport.x) && 
         !isNaN(newViewport.y) && 
         !isNaN(newViewport.zoom)) {
       setViewport(newViewport);
     }
   }, []);

   // 實際寫入 localStorage（500ms 延遲）
   useEffect(() => {
     if (!hasInitialized.current) return;
     
     const timeoutId = setTimeout(() => {
       try {
         localStorage.setItem(viewportKey, JSON.stringify(viewport));
       } catch (error) {
         console.warn('Failed to save viewport state:', error);
       }
     }, 500);
     
     return () => clearTimeout(timeoutId);
   }, [viewport, viewportKey]);
   ```

### React Flow 配置

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onInit={setReactFlowInstance}
  onMove={onMove}  // 關鍵：監聽視圖移動事件
  nodeTypes={nodeTypes}
  defaultViewport={viewport}  // 設置初始視圖
  zoomOnScroll
  panOnScroll
>
```

## 功能特性

### 1. 按樹狀圖 ID 分別存儲
- 每個樹狀圖擁有獨立的視圖狀態
- 存儲 Key：`tree-viewport-${treeId}`
- 支援多個樹狀圖並行使用

### 2. 智能首次訪問處理
- 檢測是否存在歷史視圖狀態
- 首次訪問：自動執行 `fitView()` 最佳化視圖
- 後續訪問：恢復保存的視圖狀態

### 3. 實時狀態檢測
- 使用 React Flow `onMove` 事件即時捕捉視圖變化
- 每次 pan/zoom 操作立即觸發保存邏輯
- 500ms 節流機制優化性能，避免過度頻繁的 localStorage 寫入

### 4. 容錯處理
- localStorage 讀取/寫入異常處理
- API 相容性問題降級處理
- 優雅降級到 fitView 模式

## 使用方式

### 自動運行
視圖狀態持久化功能自動運行，無需額外配置：

1. **首次訪問樹狀圖**
   - 系統自動執行 `fitView()`
   - 視圖調整到最適合的縮放和位置

2. **操作視圖**
   - 使用滑鼠拖曳進行 Pan 移動
   - 使用滑鼠滾輪進行 Zoom 縮放
   - 系統自動檢測並保存變更

3. **重新載入頁面**
   - 系統自動恢復之前的視圖狀態
   - 保持相同的 Pan 和 Zoom 設定

### 手動清除狀態
如需重置視圖狀態到初始狀態：

```javascript
// 清除特定樹狀圖的視圖狀態
localStorage.removeItem(`tree-viewport-${treeId}`);

// 重新載入頁面以應用預設視圖
window.location.reload();
```

## 技術規格

### 性能優化
- **檢測機制**：React Flow `onMove` 事件驅動，即時響應
- **節流機制**：500ms 延遲寫入 localStorage
- **記憶體使用**：使用原生 localStorage，無額外依賴
- **初始化延遲**：100ms 確保 React Flow 完全就緒

### 存儲格式
```typescript
interface Viewport {
  x: number;      // Pan X 軸位移
  y: number;      // Pan Y 軸位移  
  zoom: number;   // 縮放倍數
}
```

### 相容性
- 支援所有現代瀏覽器的 localStorage API
- React Flow v11+ 相容
- TypeScript 嚴格模式支援

## 故障排除

### 常見問題

1. **視圖狀態不保存**
   - 檢查瀏覽器 localStorage 是否啟用
   - 確認 React Flow instance 正確初始化
   - 查看控制台是否有錯誤訊息

2. **視圖恢復不正確**
   - 清除 localStorage 中的視圖狀態
   - 重新載入頁面讓系統重新初始化
   - 檢查樹狀圖 ID 是否正確

3. **性能問題**
   - 檢查檢測間隔是否設定合理（建議 1秒）
   - 確認沒有過於頻繁的 localStorage 寫入
   - 監控記憶體使用情況

### 除錯指令

```javascript
// 查看當前保存的視圖狀態
console.log(localStorage.getItem(`tree-viewport-${treeId}`));

// 查看所有樹狀圖視圖狀態
Object.keys(localStorage)
  .filter(key => key.startsWith('tree-viewport-'))
  .forEach(key => {
    console.log(key, localStorage.getItem(key));
  });

// 清除所有樹狀圖視圖狀態
Object.keys(localStorage)
  .filter(key => key.startsWith('tree-viewport-'))
  .forEach(key => localStorage.removeItem(key));
```

## 未來擴展

### 可能的改進方向
1. **視圖狀態版本控制**：支援視圖狀態的歷史記錄
2. **雲端同步**：將視圖狀態同步到雲端服務
3. **視圖狀態分享**：允許用戶分享特定的視圖狀態
4. **進階視圖操作**：書籤、預設視圖等功能

### API 擴展點
```typescript
interface ViewportManager {
  saveViewport(id: string, viewport: Viewport): void;
  loadViewport(id: string): Viewport | null;
  clearViewport(id: string): void;
  getAllViewports(): Record<string, Viewport>;
}
```