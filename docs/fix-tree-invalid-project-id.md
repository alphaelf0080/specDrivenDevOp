# 修復: 首頁樹狀圖點擊「無效的專案 ID」問題

## 🐛 問題描述

當在首頁點擊樹狀圖區塊的樹狀圖卡片時,會顯示「**無效的專案 ID**」錯誤訊息。

## 🔍 問題原因

1. **錯誤的頁面導覽**: 點擊樹狀圖時,系統導覽到 `project-page` 頁面
2. **缺少必要參數**: `ProjectPage` 需要從 URL 獲取 `?id=xxx` 參數來載入專案
3. **樹狀圖 vs 專案**: 樹狀圖有自己的 ID 和 UUID,不應該直接導覽到專案頁面

### 錯誤流程
```
用戶點擊樹狀圖 
→ handleOpenTree(treeId, uuid) 
→ App 導覽到 'project-page'
→ ProjectPage 找不到 URL 中的 ?id 參數
→ 顯示「無效的專案 ID」
```

## ✅ 解決方案

創建一個**專用的樹狀圖編輯頁面** (`TreeEditorPage`),讓樹狀圖有自己的編輯環境。

### 新增檔案

#### 1. `client/pages/TreeEditorPage.tsx`
專用的樹狀圖編輯頁面組件

**主要功能**:
- ✅ 從 URL 參數或 props 獲取 `treeId` 和 `uuid`
- ✅ 從資料庫載入完整的樹狀圖資料
- ✅ 支援通過 ID 或 UUID 載入 (靈活)
- ✅ 顯示載入狀態 (spinner 動畫)
- ✅ 顯示錯誤狀態 (友善的錯誤訊息)
- ✅ 顯示樹狀圖詳細資訊
- ✅ 提供儲存功能
- ✅ 返回首頁按鈕

**Props 介面**:
```typescript
interface TreeEditorPageProps {
  treeId?: number;        // 樹狀圖 ID
  uuid?: string;          // 樹狀圖 UUID
  onClose?: () => void;   // 關閉回調
}
```

**API 整合**:
```typescript
// 通過 ID 載入
GET /api/trees/:id

// 通過 UUID 載入
GET /api/trees/uuid/:uuid

// 儲存更新
PUT /api/trees/:id
```

#### 2. `client/pages/TreeEditorPage.css`
樹狀圖編輯頁面的樣式

**樣式特色**:
- 全螢幕布局 (100vw × 100vh)
- 固定 Header (標題、操作按鈕)
- 可滾動 Content 區域
- 漸層紫色主題
- 響應式設計
- 載入動畫
- 錯誤狀態樣式

### 修改檔案

#### 1. `client/App.tsx`
更新路由配置

**變更內容**:
1. 導入 `TreeEditorPage` 組件
2. 添加 `'tree-editor'` 到 `PageView` type
3. 添加 `'tree-editor'` 到 URL 參數檢查列表
4. 新增 `case 'tree-editor'` 路由處理
5. 更新 `onOpenTree` 回調,導覽到樹狀圖編輯頁面

**關鍵變更**:
```typescript
// 之前: 導覽到專案頁面 (錯誤)
onOpenTree={(treeId, uuid) => {
  setCurrentPage('project-page'); // ❌ 錯誤
}}

// 之後: 導覽到樹狀圖編輯頁面 (正確)
onOpenTree={(treeId, uuid) => {
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'tree-editor');
  url.searchParams.set('treeId', treeId.toString());
  url.searchParams.set('uuid', uuid);
  window.history.pushState({}, '', url);
  setCurrentPage('tree-editor'); // ✅ 正確
}}
```

## 🎯 修復後的流程

### 正確流程
```
用戶點擊樹狀圖卡片
↓
handleOpenTree(treeId=1, uuid="550e8400...")
↓
App.onOpenTree 回調
↓
設置 URL: ?view=tree-editor&treeId=1&uuid=550e8400...
↓
導覽到 tree-editor 頁面
↓
TreeEditorPage 載入
↓
從 URL 獲取參數 (treeId=1, uuid="550e8400...")
↓
呼叫 API: GET /api/trees/1
↓
載入成功,顯示樹狀圖資訊
```

## 🎨 頁面功能

### Header 區域
- **返回按鈕**: 返回首頁
- **樹狀圖資訊**:
  - 名稱
  - 描述 (如果有)
  - Meta 標籤 (UUID、節點數、深度、版本、專案)
- **操作按鈕**:
  - 儲存按鈕
  - 關閉按鈕

### Content 區域 (目前)
- **編輯器佔位符**: 顯示開發中提示
- **樹狀圖資訊面板**: 顯示完整的樹狀圖資料
  - ID
  - UUID
  - 類型
  - 節點數
  - 最大深度
  - 版本
  - 建立時間
  - 更新時間
- **提示**: 可整合 ReactFlow 或其他樹狀圖庫

### 狀態顯示

#### 載入中
```
┌─────────────┐
│   [Spinner] │
│   載入中... │
└─────────────┘
```

#### 錯誤狀態
```
┌─────────────────┐
│   [Error Icon]  │
│    載入失敗     │
│   錯誤訊息...   │
│  [返回] [重試]  │
└─────────────────┘
```

#### 正常狀態
```
┌──────────────────────────────────┐
│ [←] 樹狀圖名稱         [儲存] [X] │
│     UUID、節點數、深度等 meta     │
├──────────────────────────────────┤
│                                  │
│         編輯器區域 (開發中)        │
│                                  │
│    ┌──────────────────────┐     │
│    │   樹狀圖資訊面板      │     │
│    │   - ID: 1            │     │
│    │   - UUID: 550e...    │     │
│    │   - 節點數: 15       │     │
│    └──────────────────────┘     │
└──────────────────────────────────┘
```

## 📊 URL 參數設計

### 支援兩種參數模式

#### 模式 1: 使用 treeId
```
http://localhost:5030?view=tree-editor&treeId=1
```

#### 模式 2: 使用 UUID
```
http://localhost:5030?view=tree-editor&uuid=550e8400-e29b-41d4-a716-446655440000
```

#### 模式 3: 兩者都有 (優先使用 treeId)
```
http://localhost:5030?view=tree-editor&treeId=1&uuid=550e8400...
```

## 🔄 資料載入邏輯

```typescript
// 優先順序: props > URL params
const [treeId, setTreeId] = useState<number | null>(propTreeId || null);
const [uuid, setUuid] = useState<string | null>(propUuid || null);

// 從 URL 獲取參數
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const urlTreeId = params.get('treeId');
  const urlUuid = params.get('uuid');
  
  if (urlTreeId) setTreeId(parseInt(urlTreeId, 10));
  if (urlUuid) setUuid(urlUuid);
}, []);

// 載入資料
useEffect(() => {
  if (treeId) {
    // 優先使用 ID
    fetch(`/api/trees/${treeId}`)
  } else if (uuid) {
    // 回退使用 UUID
    fetch(`/api/trees/uuid/${uuid}`)
  }
}, [treeId, uuid]);
```

## 🎨 樣式設計

### 配色方案
- **主色**: 紫色漸層 (`#667eea` → `#764ba2`)
- **背景**: 淺灰 (`#f5f7fa`)
- **卡片**: 白色 (`#ffffff`)
- **文字**: 深灰 (`#2c3e50`)

### 動畫效果
- **按鈕 Hover**: 上浮效果
- **載入動畫**: 旋轉 spinner
- **返回按鈕**: 向左平移

### 響應式設計
- **桌面** (>768px): 標準布局
- **平板/手機** (≤768px):
  - Header 垂直排列
  - 按鈕全寬
  - 資訊面板單欄

## 🚀 下一步開發

### 短期 (1-2 天)
- [ ] 整合 ReactFlow 實現真正的樹狀圖編輯器
- [ ] 添加節點拖拽功能
- [ ] 添加節點編輯功能
- [ ] 實作自動儲存

### 中期 (1 週)
- [ ] 添加撤銷/重做功能
- [ ] 添加樹狀圖縮圖預覽
- [ ] 添加匯出功能 (PNG, SVG, JSON)
- [ ] 添加鍵盤快捷鍵

### 長期 (1 個月)
- [ ] 添加多人協作編輯
- [ ] 添加版本歷史查看
- [ ] 添加評論系統
- [ ] 添加範本系統

## 📝 測試清單

- [x] 從首頁點擊樹狀圖卡片
- [x] 正確導覽到樹狀圖編輯頁面
- [x] URL 參數正確設置
- [x] 從資料庫載入樹狀圖資料
- [x] 顯示載入狀態
- [x] 顯示樹狀圖資訊
- [x] 返回首頁功能
- [ ] 儲存功能測試
- [ ] 錯誤處理測試
- [ ] 響應式布局測試

## ✅ 問題已解決!

現在點擊首頁的樹狀圖卡片會:
1. ✅ 正確導覽到樹狀圖編輯頁面
2. ✅ 通過 treeId 和 uuid 載入資料
3. ✅ 顯示完整的樹狀圖資訊
4. ✅ 提供友善的使用者介面
5. ✅ 不再顯示「無效的專案 ID」錯誤

## 📚 相關文件

- [首頁樹狀圖資料庫整合](./homepage-tree-database-integration.md)
- [樹狀圖資料庫操作指南](./tree-operations-guide.md)
- [資料庫初始化完成報告](./database-initialization-complete.md)

## 🎉 完成!

樹狀圖現在有自己專用的編輯頁面,不再與專案頁面混淆!
