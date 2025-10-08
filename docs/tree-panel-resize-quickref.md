# 🔧 屬性面板寬度調整 - 快速參考

> **更新日期：** 2025年10月8日  
> **功能狀態：** ✅ 已完成並可用

## 🎯 功能摘要

為樹狀圖節點屬性編輯面板添加**滑鼠拖曳調整寬度**功能，提供更靈活的界面體驗。

## 🖱 使用方法

1. **開啟屬性面板**：點擊任一樹狀圖節點
2. **找到拖曳手柄**：屬性面板左邊界的垂直指示線
3. **開始拖曳**：點擊並拖曳左邊界
4. **調整寬度**：向左拖曳擴大，向右拖曳縮小

## ⚙️ 技術細節

### 核心檔案
- `TreeDiagram.tsx` - 拖曳邏輯與狀態管理
- `TreeDiagram.css` - 視覺樣式與動畫效果

### 關鍵約束
```typescript
const minWidth = 250;                    // 最小寬度
const maxWidth = window.innerWidth * 0.5; // 最大寬度 (50%)
const defaultWidth = 320;               // 預設寬度
```

### 狀態管理
```typescript
const [panelWidth, setPanelWidth] = useState(320);
const [isResizing, setIsResizing] = useState(false);
```

## 🎨 視覺效果

| 狀態 | 指示器高度 | 背景色 |
|------|------------|--------|
| 預設 | 24px | 透明 |
| Hover | 32px | 淡藍色 |
| 拖曳 | 40px | 深藍色 |

## 🔧 測試要點

- ✅ **基本拖曳**：左邊界拖曳調整寬度
- ✅ **最小約束**：不能小於 250px
- ✅ **最大約束**：不能超過螢幕寬度 50%
- ✅ **視覺反饋**：游標變化與指示器動畫
- ✅ **布局更新**：Grid 即時調整

## 🚀 優勢特點

- **即時調整**：拖曳時寬度即時更新
- **智能約束**：防止過小或過大設定
- **視覺指導**：清晰的拖曳手柄與狀態反饋
- **平滑體驗**：CSS 過渡動畫與游標控制

## 🔗 相關文檔

- 詳細實作：[tree-panel-resize-feature.md](./tree-panel-resize-feature.md)
- 更新日誌：[CHANGELOG.md](../CHANGELOG.md)
- 樹狀圖系統：[tree-system-overview.md](./tree-system-overview.md)

---

**🎯 體驗位置：** http://localhost:5030/ → 選擇樹狀圖 → 點擊節點 → 拖曳左邊界