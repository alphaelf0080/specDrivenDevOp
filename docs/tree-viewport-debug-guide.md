# 樹狀圖視圖狀態持久化 - 除錯指南

## 🐛 問題現象
Pan/Zoom 操作後無法記錄，重新載入頁面後視圖狀態被重置。

## 🔍 除錯步驟

### 1. 開啟瀏覽器開發者工具
按下 `F12` 或 `Cmd+Option+I` (Mac) 開啟開發者工具，切換到 **Console** 標籤。

### 2. 測試視圖狀態記錄

#### 步驟 A：檢查初始化
1. 重新載入頁面
2. 查看控制台輸出，應該看到：
   ```
   [TreeDiagram] 首次訪問，使用 fitView
   ```
   或
   ```
   [TreeDiagram] 恢復視圖狀態: {x: ..., y: ..., zoom: ...}
   ```

#### 步驟 B：測試 Pan 移動
1. 在樹狀圖上拖曳移動視圖
2. 即時查看控制台（無需等待）
3. 查看控制台，應該看到：
   ```
   [TreeDiagram] onMove 觸發: {x: ..., y: ..., zoom: ...}
   [TreeDiagram] 保存視圖狀態: {x: ..., y: ..., zoom: ...}
   ```
4. 等待 500ms 後，應該看到：
   ```
   [TreeDiagram] 寫入 localStorage: {x: ..., y: ..., zoom: ...}
   ```

#### 步驟 C：測試 Zoom 縮放
1. 使用滑鼠滾輪縮放視圖
2. 即時查看控制台
3. 查看控制台，應該看到相同的日誌序列

#### 步驟 D：驗證持久化
1. 重新載入頁面 (`Cmd+R` 或 `F5`)
2. 查看控制台，應該看到：
   ```
   [TreeDiagram] 恢復視圖狀態: {x: ..., y: ..., zoom: ...}
   ```
3. 視圖應該恢復到您之前設置的狀態

### 3. 檢查 localStorage

在開發者工具的 **Console** 中執行：

```javascript
// 查看當前樹狀圖的視圖狀態
const treeId = 'ui-layout'; // 替換為實際的樹狀圖 ID
console.log(localStorage.getItem(`tree-viewport-${treeId}`));

// 查看所有樹狀圖視圖狀態
Object.keys(localStorage)
  .filter(key => key.startsWith('tree-viewport-'))
  .forEach(key => {
    console.log(key, ':', localStorage.getItem(key));
  });
```

### 4. 常見問題診斷

#### 問題 1：沒有看到任何日誌
**可能原因**：
- React Flow instance 未正確初始化
- onMove 事件未正確綁定

**檢查方法**：
```javascript
// 在控制台執行
console.log('ReactFlow instances:', document.querySelectorAll('.react-flow'));
```

#### 問題 2：看到 onMove 日誌但沒有保存日誌
**可能原因**：
- viewport 數據驗證失敗
- 數據格式不正確

**檢查方法**：
查看 `[TreeDiagram] onMove 觸發` 後是否有相應的 `[TreeDiagram] 保存視圖狀態` 日誌。

#### 問題 3：看到保存日誌但沒有寫入 localStorage
**可能原因**：
- hasInitialized 標記未設置
- setTimeout 被清除

**檢查方法**：
等待 500ms 查看是否有 `[TreeDiagram] 寫入 localStorage` 日誌。
**可能原因**：
- 數據格式錯誤
- 初始化時機問題

**檢查方法**：
```javascript
// 驗證 localStorage 數據格式
const saved = localStorage.getItem('tree-viewport-ui-layout');
try {
  const parsed = JSON.parse(saved);
  console.log('Valid data:', parsed);
  console.log('Has x:', typeof parsed.x === 'number');
  console.log('Has y:', typeof parsed.y === 'number');
  console.log('Has zoom:', typeof parsed.zoom === 'number');
} catch (e) {
  console.error('Invalid JSON:', e);
}
```

#### 問題 4：localStorage 中有數據但未恢復
**可能原因**：
- 數據格式錯誤
- 初始化時機問題
- 延遲設置未生效

**檢查方法**：
```javascript
// 驗證 localStorage 數據格式
const saved = localStorage.getItem('tree-viewport-ui-layout');
try {
  const parsed = JSON.parse(saved);
  console.log('Valid data:', parsed);
  console.log('Has x:', typeof parsed.x === 'number');
  console.log('Has y:', typeof parsed.y === 'number');
  console.log('Has zoom:', typeof parsed.zoom === 'number');
} catch (e) {
  console.error('Invalid JSON:', e);
}
```

#### 問題 5：視圖狀態一直被重置
**可能原因**：
- 組件重新掛載
- React Flow 內部重置視圖
- fitView 被意外調用
- defaultViewport 被覆蓋

**檢查方法**：
查看控制台是否有多次 `[TreeDiagram] 首次訪問，使用 fitView` 日誌。

### 5. 手動測試命令

#### 清除所有視圖狀態
```javascript
Object.keys(localStorage)
  .filter(key => key.startsWith('tree-viewport-'))
  .forEach(key => localStorage.removeItem(key));
console.log('已清除所有視圖狀態');
```

#### 手動設置視圖狀態
```javascript
const testViewport = { x: 100, y: 200, zoom: 1.5 };
localStorage.setItem('tree-viewport-ui-layout', JSON.stringify(testViewport));
console.log('已設置測試視圖狀態，請重新載入頁面');
```

#### 監控 localStorage 變化
```javascript
// 添加 localStorage 監聽器
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key.startsWith('tree-viewport-')) {
    console.log('🔵 localStorage.setItem:', key, value);
  }
  originalSetItem.apply(this, arguments);
};
console.log('已開啟 localStorage 監控');
```

## 🔧 修復建議

### 如果視圖狀態未保存
1. 檢查是否有 JavaScript 錯誤阻止執行
2. 確認 localStorage 未被禁用
3. 驗證 onMove 事件是否正常觸發
4. 檢查 hasInitialized 標記是否正確設置

### 如果視圖狀態未恢復
1. 清除瀏覽器緩存並重試
2. 檢查 localStorage 數據格式
3. 確認 React Flow instance 初始化時機
4. 驗證 100ms 延遲是否生效

### 如果視圖狀態被意外重置
1. 檢查是否有其他代碼調用 fitView()
2. 確認組件是否有不必要的重新掛載
3. 驗證 hasInitialized.current 是否正確設置
4. 檢查 defaultViewport 是否被正確傳遞

## 📊 預期行為

| 操作 | 預期日誌 | 預期結果 |
|------|---------|---------|
| 首次載入 | `[TreeDiagram] 首次訪問，使用 fitView` | 視圖自動調整到最佳位置 |
| Pan 移動 | `[TreeDiagram] onMove 觸發` → `[TreeDiagram] 保存視圖狀態` → `[TreeDiagram] 寫入 localStorage` | 即時捕捉，500ms 後寫入 |
| Zoom 縮放 | `[TreeDiagram] onMove 觸發` → `[TreeDiagram] 保存視圖狀態` → `[TreeDiagram] 寫入 localStorage` | 即時捕捉，500ms 後寫入 |
| 重新載入 | `[TreeDiagram] 恢復視圖狀態` | 視圖恢復到之前狀態 |

## 🎯 成功標準

✅ Pan/Zoom 操作時立即看到 `onMove` 日誌
✅ 500ms 後看到 `寫入 localStorage` 日誌
✅ localStorage 中正確保存視圖數據
✅ 重新載入後視圖狀態正確恢復
✅ 沒有 JavaScript 錯誤或警告

## 📝 報告問題

如果問題持續存在，請提供：
1. 控制台完整日誌輸出
2. localStorage 數據內容
3. 瀏覽器類型和版本
4. 重現步驟說明