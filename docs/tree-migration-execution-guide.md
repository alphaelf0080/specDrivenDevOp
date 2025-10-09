# 樹狀圖資料遷移執行指南

## 快速執行

### 方式 1: 使用 npm script (推薦)

在 package.json 中添加:
```json
{
  "scripts": {
    "migrate:trees": "tsx server/database/migrate-trees.ts"
  }
}
```

然後執行:
```bash
npm run migrate:trees
```

### 方式 2: 直接使用 tsx

```bash
npx tsx server/database/migrate-trees.ts
```

### 方式 3: 編譯後執行

```bash
# 1. 編譯
npm run build

# 2. 執行
node dist/server/database/migrate-trees.js
```

## 執行前檢查清單

- [ ] 資料庫連接配置正確 (.env 檔案)
- [ ] trees 表已創建 (執行過 db-init)
- [ ] projects 表已有 main_tree_id 欄位
- [ ] 備份資料庫 (可選但建議)

## 資料庫準備

### 1. 確保 trees 表存在

```sql
-- 檢查 trees 表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'trees';
```

如果不存在,執行:
```bash
curl -X POST http://localhost:5010/api/db/init
```

### 2. 為 projects 表添加 main_tree_id 欄位

```sql
-- 連接資料庫
psql -h 192.168.10.6 -U your_user -d your_database

-- 執行 SQL
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS main_tree_id INTEGER;

ALTER TABLE projects 
ADD CONSTRAINT fk_projects_main_tree 
FOREIGN KEY (main_tree_id) 
REFERENCES trees(id) 
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_main_tree_id 
ON projects(main_tree_id);
```

或使用 PowerShell:
```powershell
$sql = @"
ALTER TABLE projects ADD COLUMN IF NOT EXISTS main_tree_id INTEGER;
ALTER TABLE projects ADD CONSTRAINT fk_projects_main_tree FOREIGN KEY (main_tree_id) REFERENCES trees(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_main_tree_id ON projects(main_tree_id);
"@

$env:PGPASSWORD = "your_password"
psql -h 192.168.10.6 -U your_user -d your_database -c $sql
```

### 3. 檢查現有資料

```sql
-- 檢查有多少專案需要遷移
SELECT COUNT(*) 
FROM projects 
WHERE tree_data IS NOT NULL 
AND deleted_at IS NULL;

-- 查看專案列表
SELECT id, name, name_zh, 
       CASE WHEN tree_data IS NOT NULL THEN '有' ELSE '無' END AS has_tree_data
FROM projects 
WHERE deleted_at IS NULL
ORDER BY id;
```

## 執行遷移

### PowerShell 腳本

創建 `migrate.ps1`:
```powershell
# 檢查環境
Write-Host "🔍 檢查環境..." -ForegroundColor Cyan

# 檢查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 找不到 Node.js" -ForegroundColor Red
    exit 1
}

# 檢查資料庫連接
Write-Host "🔍 檢查資料庫連接..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri "http://localhost:5010/api/health" -ErrorAction SilentlyContinue
if ($response.success -ne $true) {
    Write-Host "❌ 資料庫連接失敗,請先啟動伺服器" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 環境檢查通過" -ForegroundColor Green
Write-Host ""

# 執行遷移
Write-Host "🚀 開始執行遷移..." -ForegroundColor Cyan
npx tsx server/database/migrate-trees.ts

Write-Host ""
Write-Host "✅ 遷移完成" -ForegroundColor Green
```

執行:
```powershell
.\migrate.ps1
```

## 驗證結果

### 1. 檢查資料庫

```sql
-- 檢查遷移結果
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
WHERE p.deleted_at IS NULL
ORDER BY p.id;

-- 檢查 trees 表
SELECT id, name, project_id, tree_type, node_count, max_depth, version
FROM trees
ORDER BY id;
```

### 2. 測試 API

```bash
# 獲取樹狀圖清單
curl http://localhost:5010/api/trees

# 獲取單一樹狀圖
curl http://localhost:5010/api/trees/1

# 獲取專案的主要樹狀圖
curl http://localhost:5010/api/trees/project/1/main
```

### 3. 測試前端

1. 打開瀏覽器到 http://localhost:5030
2. 進入專案頁面
3. 檢查樹狀圖是否正確顯示
4. 測試編輯功能
5. 檢查 Console 輸出

## 回滾 (如果需要)

如果遷移出現問題,可以回滾:

```sql
-- 清除 main_tree_id
UPDATE projects SET main_tree_id = NULL;

-- 刪除 trees 表中的遷移資料
DELETE FROM trees WHERE tags LIKE '%遷移%';

-- 或完全清空 trees 表
TRUNCATE TABLE trees RESTART IDENTITY CASCADE;
```

## 常見問題

### Q1: 遷移腳本找不到資料庫配置
**A**: 確保 `.env` 檔案存在且配置正確:
```env
DB_HOST=192.168.10.6
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

### Q2: 外鍵約束錯誤
**A**: 確保 trees 表已存在:
```sql
CREATE TABLE IF NOT EXISTS trees (...);
```

### Q3: 遷移後專案頁面空白
**A**: 
1. 檢查瀏覽器 Console
2. 確認 API 端點正確 (`/api/trees`)
3. 檢查伺服器是否重啟
4. 清除瀏覽器快取

### Q4: 版本號沒有遞增
**A**: 每次更新 tree.data 時會自動遞增版本號。如果沒有,檢查:
1. 是否使用 `PUT /api/trees/:id` 端點
2. 是否有更新 data 欄位
3. 資料庫 trigger 是否正常

## 效能優化

### 批次遷移 (大量資料)

如果有很多專案需要遷移,可以修改腳本支援批次處理:

```typescript
// 批次大小
const BATCH_SIZE = 100;

// 分批遷移
for (let i = 0; i < projects.length; i += BATCH_SIZE) {
  const batch = projects.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(project => migrateProject(project)));
  console.log(`已完成 ${i + batch.length}/${projects.length}`);
}
```

## 監控和日誌

遷移過程會輸出詳細日誌:

```
🚀 開始遷移樹狀圖資料...

📊 找到 5 個專案需要遷移

📝 遷移專案: 專案A (ID: 1)
   ✅ 創建樹狀圖成功 (Tree ID: 1, UUID: 550e8400-...)
   📊 節點數: 5, 深度: 2
   ✅ 更新專案 main_tree_id 成功

...

============================================================
📊 遷移結果統計:
============================================================
✅ 成功: 5 個專案
❌ 失敗: 0 個專案
📊 總計: 5 個專案
============================================================
```

建議保存日誌:
```bash
npx tsx server/database/migrate-trees.ts > migration.log 2>&1
```

## 下一步

遷移完成後:

1. ✅ 測試所有樹狀圖功能
2. ✅ 確認資料正確性
3. ✅ 更新相關文檔
4. ⏳ (可選) 刪除 projects.tree_data 欄位
5. ⏳ 部署到生產環境

## 支援

如果遇到問題,請檢查:
- [樹狀圖操作模組使用指南](./tree-operations-guide.md)
- [樹狀圖資料遷移完成報告](./tree-migration-complete.md)
- 伺服器 Console 錯誤訊息
- 瀏覽器 Console 錯誤訊息
