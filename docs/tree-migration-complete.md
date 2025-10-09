# 樹狀圖資料遷移完成報告

## 遷移概述

已完成樹狀圖資料從 `projects.tree_data` 欄位遷移到獨立的 `trees` 資料表,實現專案與樹狀圖的關聯式管理。

## 完成項目

### 1. ✅ 資料庫結構更新

#### Projects 表新增欄位
- `main_tree_id` (INTEGER) - 關聯到 trees 表的主要樹狀圖 ID
- 外鍵約束: `REFERENCES trees(id) ON DELETE SET NULL`

#### Trees 表擴充 (已在 `table.config.ts` 中定義)
```typescript
{
  id: SERIAL PRIMARY KEY,
  uuid: UUID,
  name: VARCHAR(255),
  description: TEXT,
  project_id: INTEGER,          // 關聯到專案
  tree_type: VARCHAR(50),        // 樹狀圖類型
  data: JSONB,                   // 樹狀圖資料
  config: JSONB,                 // 配置
  direction: VARCHAR(10),        // 方向 (LR/TB/RL/BT)
  node_count: INTEGER,           // 節點數量 (自動計算)
  max_depth: INTEGER,            // 最大深度 (自動計算)
  version: INTEGER,              // 版本號 (自動遞增)
  is_template: BOOLEAN,          // 是否為範本
  tags: TEXT,                    // 標籤
  owner_id: INTEGER,             // 擁有者
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  deleted_at: TIMESTAMP          // 軟刪除
}
```

### 2. ✅ 樹狀圖操作模組

**檔案**: `server/operations/tree.operations.ts`

**功能**:
- `createTree()` - 創建樹狀圖 (自動計算統計資訊)
- `getTreeById()` / `getTreeByUuid()` - 查詢單一樹狀圖
- `listTrees()` - 查詢清單 (支持多種篩選)
- `updateTree()` - 更新樹狀圖 (自動重算統計和版本)
- `deleteTree()` - 軟刪除或永久刪除
- `restoreTree()` - 復原已刪除的樹狀圖
- `cloneTree()` - 複製樹狀圖
- `getTreesByProject()` - 取得專案的所有樹狀圖
- `getTemplates()` - 取得所有範本
- `transaction()` - 交易支援

**特性**:
- ✅ 自動計算節點數量和最大深度
- ✅ 自動版本管理
- ✅ 軟刪除支援
- ✅ 完整的 TypeScript 類型定義

### 3. ✅ API 路由

**檔案**: `server/routes/trees.ts`

**端點**:
```
GET    /api/trees                       - 獲取樹狀圖清單
GET    /api/trees/:id                   - 獲取單一樹狀圖 (by ID)
GET    /api/trees/uuid/:uuid            - 獲取單一樹狀圖 (by UUID)
GET    /api/trees/project/:id/main      - 獲取專案的主要樹狀圖
POST   /api/trees                       - 創建新樹狀圖
PUT    /api/trees/:id                   - 更新樹狀圖
DELETE /api/trees/:id                   - 刪除樹狀圖 (軟刪除)
POST   /api/trees/:id/restore           - 復原已刪除的樹狀圖
POST   /api/trees/:id/clone             - 複製樹狀圖
GET    /api/trees/templates/list        - 獲取所有範本
```

**查詢參數**:
- `projectId` - 專案 ID
- `treeType` - 樹狀圖類型
- `isTemplate` - 是否為範本
- `ownerId` - 擁有者 ID
- `tags` - 標籤 (逗號分隔)

### 4. ✅ 資料遷移腳本

**檔案**: `server/database/migrate-trees.ts`

**功能**:
1. 查詢所有有 `tree_data` 的專案
2. 為每個專案創建獨立的樹狀圖記錄
3. 更新專案的 `main_tree_id` 關聯
4. 顯示遷移結果統計

**執行方式**:
```bash
# 編譯
npm run build

# 執行遷移
node dist/server/database/migrate-trees.js
```

### 5. ✅ 前端更新

**檔案**: `client/components/Project/ProjectMainWindow.tsx`

**更新內容**:
1. 新增 `treeId` state - 儲存當前樹狀圖的 ID
2. 新增 `main_tree_id` 到 Project 介面
3. 更新 `loadProject()` - 優先使用 `main_tree_id` 載入樹狀圖
4. 新增 `loadTreeFromDatabase()` - 從 trees 表載入樹狀圖
5. 新增 `createDefaultTree()` - 創建新的樹狀圖記錄
6. 更新 `saveTreeData()` - 使用新的 `/api/trees/:id` 端點

**資料載入順序**:
1. 優先: 使用 `main_tree_id` 從 trees 表載入
2. 回退: 使用舊的 `tree_data` (遷移前的資料)
3. 預設: 創建新的樹狀圖記錄

### 6. ✅ Server 路由註冊

**檔案**: `server/index.ts`

新增:
```typescript
import treesRouter from "./routes/trees.js";
app.use("/api/trees", treesRouter);
```

## 資料結構對比

### 遷移前
```
projects 表
├── tree_data (JSONB)        - 直接儲存在專案表中
├── tree_config (JSONB)
└── tree_version (INTEGER)
```

### 遷移後
```
projects 表
├── main_tree_id (INTEGER)   - 關聯到 trees 表
└── tree_data (JSONB)        - 保留作為備份

trees 表 (獨立表)
├── id (SERIAL)              - 主鍵
├── uuid (UUID)              - 唯一識別碼
├── name (VARCHAR)
├── project_id (INTEGER)     - 關聯到專案
├── data (JSONB)             - 樹狀圖資料
├── node_count (INTEGER)     - 自動計算
├── max_depth (INTEGER)      - 自動計算
├── version (INTEGER)        - 自動遞增
└── ...其他欄位
```

## 優勢

1. **關聯式管理**: 一個專案可以有多個樹狀圖
2. **統計資訊**: 自動計算節點數、深度
3. **版本控制**: 每次更新自動遞增版本號
4. **獨立查詢**: 可以獨立搜尋和管理樹狀圖
5. **軟刪除**: 支援軟刪除和復原
6. **範本系統**: 支援樹狀圖範本
7. **標籤分類**: 可以用標籤分類和篩選

## 遷移步驟

### 步驟 1: 更新資料庫結構

執行以下 SQL 為 projects 表新增 `main_tree_id` 欄位:

```sql
-- 1. 新增 main_tree_id 欄位
ALTER TABLE projects 
ADD COLUMN main_tree_id INTEGER;

-- 2. 新增外鍵約束
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_main_tree 
FOREIGN KEY (main_tree_id) 
REFERENCES trees(id) 
ON DELETE SET NULL;

-- 3. 新增索引
CREATE INDEX idx_projects_main_tree_id ON projects(main_tree_id);
```

### 步驟 2: 編譯專案

```bash
npm run build
```

### 步驟 3: 執行資料遷移

```bash
node dist/server/database/migrate-trees.js
```

**預期輸出**:
```
🚀 開始遷移樹狀圖資料...

📊 找到 3 個專案需要遷移

📝 遷移專案: 專案A (ID: 1)
   ✅ 創建樹狀圖成功 (Tree ID: 1, UUID: 550e8400-...)
   📊 節點數: 5, 深度: 2
   ✅ 更新專案 main_tree_id 成功

📝 遷移專案: 專案B (ID: 2)
   ✅ 創建樹狀圖成功 (Tree ID: 2, UUID: 660f9500-...)
   📊 節點數: 8, 深度: 3
   ✅ 更新專案 main_tree_id 成功

...

============================================================
📊 遷移結果統計:
============================================================
✅ 成功: 3 個專案
❌ 失敗: 0 個專案
📊 總計: 3 個專案
============================================================
```

### 步驟 4: 驗證遷移結果

```bash
# 連接資料庫
psql -h 192.168.10.6 -U your_user -d your_database

# 檢查遷移結果
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.main_tree_id,
  t.id AS tree_id,
  t.name AS tree_name,
  t.node_count,
  t.max_depth,
  t.version
FROM projects p
LEFT JOIN trees t ON p.main_tree_id = t.id
WHERE p.deleted_at IS NULL;
```

### 步驟 5: 重啟伺服器

```bash
npm run server
```

### 步驟 6: 測試前端

1. 打開專案頁面
2. 檢查樹狀圖是否正確載入
3. 測試新增、編輯、刪除節點功能
4. 檢查瀏覽器 Console 確認使用新的 API

**預期 Console 輸出**:
```
[ProjectMainWindow] 載入樹狀圖: {id: 1, name: "...", data: {...}, ...}
[ProjectMainWindow] 樹狀圖已儲存 (版本: 2)
```

## 測試清單

- [ ] 載入現有專案的樹狀圖
- [ ] 創建新專案時自動創建樹狀圖
- [ ] 編輯節點標籤
- [ ] 新增子節點
- [ ] 刪除節點
- [ ] 儲存後版本號遞增
- [ ] 重新載入後資料正確
- [ ] 統計資訊 (node_count, max_depth) 正確
- [ ] 多個專案的樹狀圖互不干擾

## API 使用範例

### 創建樹狀圖
```typescript
const response = await fetch('/api/trees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '我的樹狀圖',
    projectId: 123,
    treeType: 'ui_layout',
    data: {
      id: 'root',
      label: '根節點',
      children: []
    },
    setAsMain: true // 設定為專案的主要樹狀圖
  })
});
```

### 獲取專案的主要樹狀圖
```typescript
const response = await fetch(`/api/trees/project/${projectId}/main`);
const result = await response.json();
const treeData = result.data.data; // TreeNode
```

### 更新樹狀圖
```typescript
const response = await fetch(`/api/trees/${treeId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: updatedTreeNode // 更新樹狀圖資料
  })
});
```

### 查詢專案的所有樹狀圖
```typescript
const response = await fetch(`/api/trees?projectId=${projectId}`);
const result = await response.json();
const trees = result.data; // TreeData[]
```

## 後續優化建議

### 1. 資料清理 (可選)
遷移完成並驗證無誤後,可以考慮刪除 `projects.tree_data` 欄位:

```sql
-- 先備份
CREATE TABLE projects_backup AS SELECT * FROM projects;

-- 刪除舊欄位
ALTER TABLE projects DROP COLUMN tree_data;
ALTER TABLE projects DROP COLUMN tree_config;
ALTER TABLE projects DROP COLUMN tree_version;
ALTER TABLE projects DROP COLUMN tree_updated_at;
```

### 2. 多樹狀圖支援
目前每個專案只有一個主要樹狀圖 (`main_tree_id`),未來可以擴展支援多個樹狀圖:

- UI 佈局樹
- PSD 結構樹
- 遊戲邏輯樹
- 資源組織樹

### 3. 版本歷史
可以新增 `tree_versions` 表記錄每次變更:

```sql
CREATE TABLE tree_versions (
  id SERIAL PRIMARY KEY,
  tree_id INTEGER REFERENCES trees(id),
  version INTEGER,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER
);
```

### 4. 協作功能
- 鎖定機制: 防止多人同時編輯
- 變更追蹤: 記錄誰修改了什麼
- 權限控制: 讀取/編輯權限

### 5. 樹狀圖模板
可以創建預設的樹狀圖範本,方便快速創建新專案:

```typescript
// 獲取所有範本
const templates = await fetch('/api/trees/templates/list');

// 從範本創建
const newTree = await fetch(`/api/trees/${templateId}/clone`, {
  method: 'POST',
  body: JSON.stringify({ name: '我的新樹狀圖' })
});
```

## 故障排除

### 問題 1: 遷移後資料不顯示
**檢查**:
- 確認 `main_tree_id` 已正確設定
- 檢查 trees 表是否有對應記錄
- 查看瀏覽器 Console 是否有錯誤

### 問題 2: 儲存失敗
**檢查**:
- 確認 `treeId` 不為 null
- 檢查 API 端點是否正確 (`/api/trees/:id`)
- 查看伺服器 Console 錯誤訊息

### 問題 3: 統計資訊不正確
**解決**:
```typescript
// 手動重新計算
await fetch(`/api/trees/${treeId}`, {
  method: 'PUT',
  body: JSON.stringify({
    data: currentTreeData // 重新儲存會自動重算
  })
});
```

## 文檔連結

- [樹狀圖操作模組使用指南](./tree-operations-guide.md)
- [API 端點文檔](./tree-operations-guide.md#api-整合範例)
- [資料表結構說明](./tree-operations-guide.md#資料表結構)

## 總結

✅ 資料庫結構更新完成  
✅ 樹狀圖操作模組創建完成  
✅ API 路由實作完成  
✅ 資料遷移腳本準備完成  
✅ 前端代碼更新完成  
✅ 文檔撰寫完成  

**下一步**: 執行資料遷移腳本並測試所有功能!
