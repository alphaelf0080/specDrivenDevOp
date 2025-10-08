# 樹狀圖視圖狀態持久化 - 快速參考

## 🎯 功能需求實現狀態

✅ **"樹狀圖 pan 移動 與 zoom in/out 要能紀錄，下次載入時，要能相同"**

## 📋 功能摘要

| 功能 | 說明 | 實現狀態 |
|------|------|----------|
| Pan 移動記錄 | 滑鼠拖曳移動位置自動保存 | ✅ 完成 |
| Zoom 縮放記錄 | 滑鼠滾輪縮放倍數自動保存 | ✅ 完成 |
| 狀態恢復 | 下次載入時自動恢復視圖狀態 | ✅ 完成 |
| 多樹狀圖支援 | 不同樹狀圖獨立保存視圖狀態 | ✅ 完成 |
| 首次訪問優化 | 新樹狀圖自動 fitView 最佳視圖 | ✅ 完成 |

## 🔧 技術實現

### 核心組件
- **檔案**：`client/components/Tree/TreeDiagram.tsx`
- **存儲方式**：localStorage (按樹狀圖 ID 分別存儲)
- **檢測機制**：React Flow `onMove` 事件驅動
- **API 整合**：React Flow Viewport API + onMove handler

### 存儲結構
```javascript
localStorage['tree-viewport-{treeId}'] = {
  "x": -123.45,    // Pan X 軸位移
  "y": 67.89,      // Pan Y 軸位移  
  "zoom": 1.25     // 縮放倍數
}
```

## 🚀 用戶體驗

### 使用流程
1. **首次訪問**：自動執行 `fitView()` 最佳化視圖
2. **操作視圖**：拖曳移動、滾輪縮放，系統自動保存
3. **重新載入**：自動恢復上次的視圖狀態

### 智能行為
- ✅ 使用 `onMove` 事件即時捕捉視圖變化
- ✅ 首次訪問與狀態恢復的智能判斷
- ✅ 容錯處理，localStorage 異常時優雅降級
- ✅ 500ms 節流機制避免過度頻繁的存儲操作
- ✅ 100ms 初始化延遲確保 React Flow 完全就緒

## 🛠️ 故障排除

### 快速重置
```javascript
// 清除特定樹狀圖視圖狀態
localStorage.removeItem('tree-viewport-{treeId}');

// 清除所有樹狀圖視圖狀態
Object.keys(localStorage)
  .filter(key => key.startsWith('tree-viewport-'))
  .forEach(key => localStorage.removeItem(key));
```

### 除錯檢查
```javascript
// 查看當前保存的視圖狀態
console.log(localStorage.getItem('tree-viewport-{treeId}'));
```

## 📚 相關文檔

- **詳細技術文檔**：[tree-viewport-persistence.md](./tree-viewport-persistence.md)
- **系統概覽**：[tree-system-overview.md](./tree-system-overview.md)
- **更新紀錄**：[CHANGELOG.md](../CHANGELOG.md)

## ⚡ 性能規格

- **檢測機制**：React Flow `onMove` 事件（即時）
- **節流延遲**：500ms
- **初始化延遲**：100ms
- **儲存大小**：~50 bytes 每個樹狀圖
- **記憶體開銷**：最小化，使用原生 localStorage
- **相容性**：支援所有現代瀏覽器