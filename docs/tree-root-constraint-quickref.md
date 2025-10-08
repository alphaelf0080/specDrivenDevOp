# 🎯 樹狀圖根節點位置約束 - 快速參考

> **更新日期：** 2025年10月8日  
> **功能狀態：** ✅ 已完成並可用

## 📋 功能摘要

確保樹狀圖的**根節點始終位於最左上角**，其他節點展開時不會越過根節點的上方或左方。

## 🔧 關鍵檔案

| 檔案 | 修改內容 |
|------|----------|
| `TreeDiagram.tsx` | 位置約束算法、Dagre 優化設定、DOM 屬性 |
| `TreeDiagram.css` | 根節點視覺樣式、z-index 層級控制 |

## ⚡ 核心約束

### 位置約束
```typescript
// 根節點固定在最左上角
rootNode.position.x = minX;
rootNode.position.y = minY;

// 其他節點向右下偏移
otherNode.position.x += Math.abs(xOffset);
otherNode.position.y += Math.abs(yOffset);
```

### 安全檢查
```typescript
// 50px 最小間距保護
if (n.position.x < rootFinalX) n.position.x = rootFinalX + 50;
if (n.position.y < rootFinalY) n.position.y = rootFinalY + 50;
```

### 視覺層級
```css
.tree-node.root {
  z-index: 10;
  background-color: rgba(129, 140, 248, 0.1) !important;
}
```

## 🎯 測試方式

1. **開啟開發服務器**：`npm run dev`
2. **訪問**：http://localhost:5030/
3. **測試場景**：
   - 展開樹狀圖節點
   - 檢查根節點是否在最左上角
   - 確認子節點不會超越根節點

## 📊 效果指標

- ✅ 根節點位於 `(minX, minY)` 座標
- ✅ X 軸約束：其他節點 X ≥ rootX + 50px
- ✅ Y 軸約束：其他節點 Y ≥ rootY + 50px
- ✅ 視覺優先：根節點 z-index: 10
- ✅ 動態穩定：展開/收合時約束自動生效

## 🔗 相關文檔

- 詳細實作：[tree-root-position-constraint.md](./tree-root-position-constraint.md)
- 更新日誌：[CHANGELOG.md](../CHANGELOG.md)
- 系統總覽：[tree-system-overview.md](./tree-system-overview.md)

---

**🚀 狀態：生產就緒** | **🔧 維護者：alphaelf0080** | **📅 最後更新：2025-10-08**