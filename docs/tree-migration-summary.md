# 🎯 樹狀圖資料遷移 - 執行摘要

## 📋 已完成項目

### ✅ 1. 資料庫結構設計
- **檔案**: `server/config/table.config.ts`
- **變更**: 
  - projects 表新增 `main_tree_id` 欄位
  - trees 表擴充 15+ 欄位 (統計、版本、配置等)

### ✅ 2. 資料庫操作模組
- **檔案**: `server/operations/tree.operations.ts` (598 行)
- **功能**: 
  - 完整的 CRUD 操作
  - 自動統計 (node_count, max_depth)
  - 版本管理 (自動遞增)
  - 軟刪除和復原
  - 複製和範本

### ✅ 3. API 路由
- **檔案**: `server/routes/trees.ts` (365 行)
- **端點**: 10 個 REST API 端點
- **整合**: 已註冊到 `server/index.ts`

### ✅ 4. 遷移腳本
- **檔案**: `server/database/migrate-trees.ts`
- **功能**: 
  - 自動遷移 projects.tree_data → trees 表
  - 更新 projects.main_tree_id 關聯
  - 詳細的日誌和統計

### ✅ 5. 前端更新
- **檔案**: `client/components/Project/ProjectMainWindow.tsx`
- **變更**:
  - 新增 treeId state
  - 優先使用 main_tree_id 載入樹狀圖
  - 更新為使用 `/api/trees` 端點
  - 自動創建預設樹狀圖

### ✅ 6. 執行工具
- **PowerShell 腳本**: `migrate-trees.ps1`
- **SQL 腳本**: `scripts/prepare-migration.sql`

### ✅ 7. 文檔
- `docs/tree-operations-guide.md` - 操作模組使用指南 (700+ 行)
- `docs/tree-migration-complete.md` - 遷移完成報告 (500+ 行)
- `docs/tree-migration-execution-guide.md` - 執行指南 (400+ 行)

## 🚀 快速執行 (3 步驟)

### 步驟 1: 準備資料庫

```powershell
# 方式 A: 使用 SQL 腳本 (推薦)
$env:PGPASSWORD = "your_password"
psql -h 192.168.10.6 -U your_user -d your_database -f scripts/prepare-migration.sql

# 方式 B: 手動執行 SQL
psql -h 192.168.10.6 -U your_user -d your_database
```

```sql
-- 添加 main_tree_id 欄位
ALTER TABLE projects ADD COLUMN IF NOT EXISTS main_tree_id INTEGER;

-- 添加外鍵
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_main_tree 
FOREIGN KEY (main_tree_id) REFERENCES trees(id) ON DELETE SET NULL;

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_projects_main_tree_id ON projects(main_tree_id);
```

### 步驟 2: 執行遷移

```powershell
# 方式 A: 使用 PowerShell 腳本 (推薦)
.\migrate-trees.ps1

# 方式 B: 直接執行
npx tsx server/database/migrate-trees.ts
```

### 步驟 3: 驗證結果

```sql
-- 檢查遷移結果
SELECT 
    p.id, p.name, p.main_tree_id,
    t.id AS tree_id, t.name AS tree_name,
    t.node_count, t.max_depth, t.version
FROM projects p
LEFT JOIN trees t ON p.main_tree_id = t.id
WHERE p.deleted_at IS NULL;
```

## 📊 資料結構對比

### 遷移前 (專案表內嵌)
```
projects
├── id
├── name
├── tree_data (JSONB)        ← 直接儲存
├── tree_config (JSONB)
└── tree_version (INTEGER)
```

### 遷移後 (關聯式管理)
```
projects                        trees (獨立表)
├── id                          ├── id
├── name                        ├── uuid (搜尋鍵)
├── main_tree_id ─────────────→ ├── name
└── tree_data (備份)            ├── project_id
                                ├── data (JSONB)
                                ├── node_count (自動)
                                ├── max_depth (自動)
                                ├── version (自動)
                                └── ...
```

## 🔑 關鍵特性

### 1. Search Key (搜尋鍵)
每個樹狀圖都有 **UUID** 作為唯一識別碼:

```typescript
// 根據 UUID 查詢
GET /api/trees/uuid/550e8400-e29b-41d4-a716-446655440000

// 專案頁面連結
const treeLink = `/trees/${tree.uuid}`;
```

### 2. 自動統計
```typescript
// 創建或更新時自動計算
{
  node_count: 15,    // 自動計算節點數
  max_depth: 4,      // 自動計算最大深度
  version: 3         // 自動遞增版本號
}
```

### 3. 專案關聯
```typescript
// 專案 → 主要樹狀圖
projects.main_tree_id → trees.id

// 樹狀圖 → 專案 (反向)
trees.project_id → projects.id

// 一個專案可以有多個樹狀圖
GET /api/trees?projectId=123
```

### 4. 資料持久化
```typescript
// 前端每次修改都會自動儲存到資料庫
const saveTreeData = async (updatedTree: TreeNode) => {
  await fetch(`/api/trees/${treeId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: updatedTree })
  });
};
```

## 📡 API 端點總覽

```
樹狀圖管理
├── GET    /api/trees                    獲取清單 (支持篩選)
├── POST   /api/trees                    創建樹狀圖
├── GET    /api/trees/:id                獲取單一樹狀圖 (ID)
├── GET    /api/trees/uuid/:uuid         獲取單一樹狀圖 (UUID) ⭐
├── PUT    /api/trees/:id                更新樹狀圖
├── DELETE /api/trees/:id                刪除樹狀圖
├── POST   /api/trees/:id/restore        復原樹狀圖
├── POST   /api/trees/:id/clone          複製樹狀圖
├── GET    /api/trees/project/:id/main   獲取專案主要樹狀圖 ⭐
└── GET    /api/trees/templates/list     獲取範本清單
```

## 🔍 專案頁面使用流程

### 1. 載入專案
```typescript
loadProject() {
  // 1. 載入專案資料
  const project = await fetch(`/api/projects/${projectId}`);
  
  // 2. 優先使用 main_tree_id
  if (project.main_tree_id) {
    await loadTreeFromDatabase(project.main_tree_id);
  }
  // 3. 回退到舊的 tree_data
  else if (project.tree_data) {
    setTreeData(project.tree_data);
  }
  // 4. 創建新的樹狀圖
  else {
    await createDefaultTree(project);
  }
}
```

### 2. 保存變更
```typescript
saveTreeData(updatedTree) {
  // 使用新的 API 端點
  await fetch(`/api/trees/${treeId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: updatedTree })
  });
  // 版本號自動遞增: v1 → v2 → v3
}
```

### 3. Search Key 使用
```typescript
// UUID 作為搜尋鍵
const tree = await fetch(`/api/trees/uuid/${uuid}`);

// 可以在 URL 中使用
const shareLink = `/view/tree/${tree.uuid}`;

// 或在專案中直接連結
<Link to={`/trees/${tree.uuid}`}>查看樹狀圖</Link>
```

## ✅ 驗證清單

遷移完成後請確認:

- [ ] **資料庫**
  - [ ] projects 表有 main_tree_id 欄位
  - [ ] 所有專案的 main_tree_id 已設定
  - [ ] trees 表有對應的記錄
  - [ ] 統計資訊 (node_count, max_depth) 正確

- [ ] **API**
  - [ ] GET /api/trees 返回樹狀圖清單
  - [ ] GET /api/trees/project/:id/main 返回專案主要樹狀圖
  - [ ] PUT /api/trees/:id 可以更新樹狀圖
  - [ ] 版本號每次更新會遞增

- [ ] **前端**
  - [ ] 專案頁面可以載入樹狀圖
  - [ ] 編輯節點後自動儲存
  - [ ] Console 顯示正確的 API 調用
  - [ ] 重新載入後資料保持

- [ ] **功能測試**
  - [ ] 創建新專案 → 自動創建樹狀圖
  - [ ] 編輯節點標籤 → 儲存成功
  - [ ] 新增子節點 → 節點數遞增
  - [ ] 刪除節點 → 節點數遞減
  - [ ] 重新載入專案 → 資料正確

## 📈 效能提升

### 查詢優化
```sql
-- 使用 UUID 索引
CREATE UNIQUE INDEX idx_trees_uuid ON trees(uuid);

-- 使用 GIN 索引搜尋 JSONB
CREATE INDEX idx_trees_data ON trees USING GIN (data);

-- 專案關聯索引
CREATE INDEX idx_trees_project_id ON trees(project_id);
```

### 統計快取
```typescript
// 不需要每次計算,直接讀取欄位
const stats = {
  nodeCount: tree.node_count,  // 已計算
  maxDepth: tree.max_depth,    // 已計算
  version: tree.version         // 已記錄
};
```

## 🔧 故障排除

### 問題 1: 遷移後前端空白
**解決**:
```bash
# 1. 清除瀏覽器快取
Ctrl + Shift + Delete

# 2. 重啟伺服器
npm run server

# 3. 檢查 Console
F12 → Console → 查看錯誤
```

### 問題 2: UUID 找不到
**解決**:
```sql
-- 檢查 UUID 是否存在
SELECT id, uuid, name FROM trees;

-- 手動設定 UUID (如果為 NULL)
UPDATE trees SET uuid = uuid_generate_v4() WHERE uuid IS NULL;
```

### 問題 3: 統計資訊不正確
**解決**:
```typescript
// 重新儲存會自動重算
await fetch(`/api/trees/${treeId}`, {
  method: 'PUT',
  body: JSON.stringify({ data: currentTreeData })
});
```

## 📚 延伸閱讀

- [樹狀圖操作模組使用指南](./tree-operations-guide.md) - 完整的 API 文檔
- [遷移完成報告](./tree-migration-complete.md) - 詳細的技術說明
- [執行指南](./tree-migration-execution-guide.md) - 步驟說明

## 🎉 完成!

遷移完成後,您的系統將擁有:
- ✅ 獨立的樹狀圖管理
- ✅ UUID 搜尋鍵支援
- ✅ 自動統計和版本管理
- ✅ 完整的 REST API
- ✅ 軟刪除和復原功能
- ✅ 範本系統
- ✅ 專案關聯

所有樹狀圖資料都安全地儲存在資料庫中,並通過 UUID 提供快速查詢! 🚀
