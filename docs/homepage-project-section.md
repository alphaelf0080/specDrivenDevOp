# 首頁專案區塊功能

## 功能概述

在首頁中間版面新增置頂的專案區塊，用於展示當前主要專案的概況和快速操作入口。

## 視覺設計

### 置頂效果
- **橘色主題**：使用橘黃色漸層配色 (#f59e0b → #d97706)
- **置頂標識**：
  - 3px 橘色邊框
  - 「置頂」徽章（右上角）
  - 📌 動態大頭針圖示（跳動動畫）
- **立體陰影**：多層陰影增強置頂效果

### 卡片結構

#### 1. 專案卡片標題區
- **專案圖示**：64x64 像素資料夾圖示，橘黃漸層
- **專案名稱**：大標題 "規格驅動老虎機開發"
- **狀態標籤**：綠色「進行中」徽章
- **更新日期**：顯示最後更新時間

#### 2. 專案描述
簡潔的專案說明文字，介紹專案核心理念和技術特色。

#### 3. 專案統計數據
四個統計項目：
- 🧠 心智圖數量
- 🌳 樹狀圖數量
- 📝 文檔數量
- ✅ 完成任務數量

每個統計項目：
- 大圖示
- 數值（粗體顯示）
- 標籤
- Hover 效果（向上移動 + 背景高亮）

#### 4. 快速操作按鈕
三個操作按鈕：
- **查看心智圖**（主要按鈕）：橘黃漸層背景
- **查看樹狀圖**（次要按鈕）：白色背景 + 橘色邊框
- **專案文檔**（次要按鈕）：白色背景 + 橘色邊框

## 技術實現

### React 組件結構

```tsx
<section className="project-section pinned">
  <div className="section-header">
    <h2>📂 專案</h2>
    <span className="pin-badge">置頂</span>
  </div>

  <div className="project-container">
    <div className="project-card">
      {/* 專案卡片標題區 */}
      <div className="project-card-header">
        <div className="project-icon">{/* SVG 圖示 */}</div>
        <div className="project-info">
          <div className="project-title">規格驅動老虎機開發</div>
          <div className="project-status">
            <span className="status-badge active">進行中</span>
            <span className="project-date">2025-10-08</span>
          </div>
        </div>
      </div>
      
      {/* 專案描述 */}
      <div className="project-card-body">
        <p className="project-description">{/* 描述文字 */}</p>

        {/* 統計數據 */}
        <div className="project-stats">
          <div className="stat-item">{/* 統計項目 */}</div>
          {/* ... 其他統計 */}
        </div>

        {/* 操作按鈕 */}
        <div className="project-actions">
          <button className="action-btn primary">{/* 主按鈕 */}</button>
          <button className="action-btn secondary">{/* 次按鈕 */}</button>
          {/* ... */}
        </div>
      </div>
    </div>
  </div>
</section>
```

### CSS 關鍵樣式

#### 置頂效果
```css
.project-section.pinned {
  border: 3px solid #f59e0b;
  box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(245, 158, 11, 0.1);
}

.project-section.pinned::before {
  content: '📌';
  position: absolute;
  top: -15px;
  right: 2rem;
  font-size: 2rem;
  animation: pinBounce 2s ease-in-out infinite;
}

@keyframes pinBounce {
  0%, 100% {
    transform: translateY(0) rotate(-15deg);
  }
  50% {
    transform: translateY(-5px) rotate(-15deg);
  }
}
```

#### 統計項目網格
```css
.project-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #fde68a;
}
```

#### 按鈕樣式
```css
.action-btn.primary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}
```

## 動態數據

### 統計數據來源
```typescript
// 心智圖數量
recentMindMaps.length

// 樹狀圖數量
recentTrees.length

// 文檔數量（固定值，可後續改為動態）
12

// 完成任務數量（固定值，可後續改為動態）
24
```

### 按鈕導航
```typescript
// 查看心智圖
onClick={() => onNavigate('mindmap-manager')}

// 查看樹狀圖
onClick={() => onNavigate('tree-ui-layout')}
```

## 位置與順序

專案區塊位於首頁的最前面，順序如下：
1. **頁面標題**（規格驅動開發平台）
2. **專案區塊**（置頂）⬅️ 新增
3. 心智圖區塊
4. 樹狀圖區塊

## 響應式設計

### 統計網格
- 預設：4 欄網格（repeat(4, 1fr)）
- 可根據螢幕寬度調整為 2x2 或單欄

### 按鈕佈局
- 預設：彈性佈局（flex: 1）
- 最小寬度：150px
- 自動換行：flex-wrap: wrap

## 互動效果

### Hover 效果

1. **專案卡片**
   - 邊框顏色變亮（#f59e0b）
   - 陰影增強

2. **統計項目**
   - 向上移動 2px
   - 背景高亮（#fffbeb）

3. **按鈕**
   - 向上移動 2px
   - 陰影增強

### 動畫效果

1. **大頭針跳動**
   - 2 秒循環
   - 垂直移動 5px
   - 保持 -15° 旋轉

2. **進入動畫**
   - fadeInUp 0.5s（最快進入）
   - 比其他區塊優先顯示

## 配色方案

### 主色調
- **主色**：#f59e0b（橘黃）
- **深色**：#d97706（深橘）
- **淺色**：#fde68a（淺黃）
- **背景**：#fffbeb（米白）

### 漸層
- **圖示漸層**：#f59e0b → #d97706
- **按鈕漸層**：#f59e0b → #d97706
- **卡片背景**：#fffbeb → #fef3c7

## 未來擴展

### 可新增功能
1. **多專案支援**：顯示多個專案，可切換
2. **進度條**：顯示專案完成進度
3. **團隊成員**：顯示專案參與者
4. **最近活動**：顯示最新更新記錄
5. **專案設定**：編輯專案資訊
6. **專案歸檔**：歸檔完成的專案

### API 整合
可以考慮建立專案 API 端點：
```
GET  /api/projects       - 取得所有專案
GET  /api/projects/:id   - 取得特定專案
POST /api/projects       - 建立新專案
PUT  /api/projects/:id   - 更新專案
```

## 檔案清單

### 修改檔案
- `client/components/Navigation/HomePage.tsx` - 新增專案區塊 HTML 結構
- `client/components/Navigation/HomePage.css` - 新增專案區塊樣式

### 相關檔案
- `client/components/Navigation/HomePage.tsx` - 首頁主組件
- `client/utils/treeHistory.ts` - 樹狀圖歷史追蹤（提供統計數據）