# 樹狀圖瀏覽歷史功能

## 功能說明

在首頁新增了「最近查看的樹狀圖」區域，自動追蹤並顯示最近訪問過的三個樹狀圖。

## 特色

- ✅ 自動追蹤樹狀圖訪問記錄
- ✅ 顯示最近三個訪問的樹狀圖
- ✅ 顯示相對時間（剛剛、X分鐘前、X小時前等）
- ✅ 點擊卡片快速跳轉到對應樹狀圖
- ✅ 使用 localStorage 持久化存儲
- ✅ 綠色主題配色與樹狀圖呼應

## 實作細節

### 新增檔案

1. **`client/utils/treeHistory.ts`**
   - 樹狀圖歷史追蹤工具模組
   - 提供 `recordTreeVisit()` 記錄訪問
   - 提供 `getTreeHistory()` 讀取歷史
   - 提供 `formatRelativeTime()` 格式化時間顯示

### 修改檔案

1. **樹狀圖頁面** (自動記錄訪問)
   - `TreeUiLayoutPage.tsx`
   - `TreeUiLayoutRichPage.tsx`
   - `TreePsdStructurePage.tsx`

2. **首頁** (`HomePage.tsx`)
   - 新增「最近查看的樹狀圖」區域
   - 載入並顯示歷史記錄
   - 支援點擊跳轉

3. **樣式** (`HomePage.css`)
   - 新增 `.tree-section` 樣式
   - 新增 `.tree-card` 系列樣式
   - 綠色漸層主題配色

## 使用方式

1. 訪問任一樹狀圖頁面（會自動記錄）
2. 返回首頁查看「最近查看的樹狀圖」區域
3. 點擊卡片快速跳轉到對應頁面

## 資料結構

```typescript
interface TreeHistoryItem {
  id: string;          // 唯一識別碼
  name: string;        // 顯示名稱
  path: string;        // 路由路徑
  visitedAt: string;   // 訪問時間 (ISO格式)
}
```

## 儲存機制

- 使用瀏覽器 localStorage
- 鍵名: `tree_diagram_history`
- 最多保留 3 筆記錄
- 重複訪問會更新到最前面

## 視覺設計

- 樹狀圖卡片使用綠色漸層 (#f0fdf4 → #dcfce7)
- 左側綠色指示條 (#22c55e → #15803d)
- Hover 效果: 向右移動 + 陰影加深
- 與心智圖卡片保持視覺一致性但顏色區分

## 未來擴展

- [ ] 支援刪除單筆記錄
- [ ] 支援釘選常用樹狀圖
- [ ] 支援搜尋歷史記錄
- [ ] 支援匯出/匯入歷史
- [ ] 統計訪問次數
