# 🎯 同層級節點 X 軸對齊 - 快速參考

> **更新日期：** 2025年10月8日  
> **功能狀態：** ✅ 已完成並可用

## 📋 功能摘要

確保樹狀圖中**同層級（相同深度）的節點在 X 軸上對齊**，形成整齊的層級結構。

## 🎯 對齊規則

### 水平布局 (LR)
```
深度 0: |--[根]
深度 1:     |--[節點1]
           |--[節點2] 
深度 2:         |--[節點3]
               |--[節點4]
               |--[節點5]
```
- 每個深度有**固定 X 軸位置**
- 間距 = `nodeWidth + ranksep`

### 垂直布局 (TB)
```
      [根節點]
   /     |     \
[節點1] [節點2] [節點3]  ← 同層級居中對齊
   |       |
[子節點1] [子節點2]      ← 同層級居中對齊
```
- 同層級節點**居中對齊**
- X 軸 = 該層級平均位置

## ⚙️ 技術要點

### 核心算法
```typescript
// 1. 按深度分組
const nodesByDepth = new Map<number, Node[]>();

// 2. 計算統一 X 軸位置
if (dir === 'LR') {
  targetX = baseX + (depth * (nodeWidth + ranksep));
} else {
  targetX = avgX; // 居中對齊
}

// 3. 應用對齊
nodesAtDepth.forEach(node => {
  node.position.x = targetX;
});
```

### Dagre 優化
```typescript
g.setGraph({
  ranker: 'tight-tree',  // 緊湊樹排序
  acyclicer: 'greedy',   // 貪婪算法
  edgesep: 10           // 邊間距
});
```

## 🔧 測試方式

1. **開啟開發服務器**：`npm run dev`
2. **訪問**：http://localhost:5030/
3. **測試場景**：
   - 展開多層級節點
   - 檢查同深度節點 X 軸對齊
   - 切換 LR/TB 布局模式
   - 驗證根節點最左位置

## 📊 對齊效果

| 檢查項目 | 預期結果 |
|----------|----------|
| **同層級對齊** | X 軸位置相同 |
| **層級間距** | 固定間距遞增 |
| **根節點位置** | 最左端位置 |
| **視覺層次** | 清晰分層結構 |

## 🎨 視覺改善

- ✅ **整齊排列**：同層級節點垂直對齊
- ✅ **層次清晰**：不同深度明確分離
- ✅ **閱讀順暢**：視線跟隨更自然
- ✅ **美觀平衡**：對稱的樹形結構

## 🔗 相關文檔

- 詳細實作：[tree-same-level-alignment.md](./tree-same-level-alignment.md)
- 根節點約束：[tree-root-position-constraint.md](./tree-root-position-constraint.md)
- 更新日誌：[CHANGELOG.md](../CHANGELOG.md)

---

**🎯 體驗位置：** http://localhost:5030/ → 樹狀圖頁面 → 展開多層級節點 → 觀察對齊效果