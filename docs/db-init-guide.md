# 首頁資料庫自動初始化功能

## 📋 功能概述

在首頁（規格驅動開發平台頁面）開啟時，系統會自動執行以下流程：

1. ✅ **檢查 projects 資料表是否存在**
2. ✅ **如果不存在，自動建立 projects 資料表**
3. ✅ **載入 projects 資料**
4. ✅ **在首頁顯示專案資訊**

---

## 🏗️ 架構設計

### 後端模組

#### 1. 資料庫初始化模組 (`server/database/db-init.ts`)

**核心函數**：

```typescript
// 檢查資料表是否存在
checkTableExists(db: Database, tableName: string): Promise<boolean>

// 建立單一資料表
createTable(db: Database, tableName: string): Promise<void>

// 初始化資料庫（檢查並建立資料表）
initializeDatabase(db: Database, tablesToCheck: string[]): Promise<void>

// 查詢資料表資料
loadTableData<T>(db: Database, tableName: string, options): Promise<T[]>

// 簡化的初始化函數 - 只檢查 projects 表
initializeProjectsTable(db: Database): Promise<any[]>
```

**資料表配置來源**：
- 📋 **從 `table.config.ts` 動態讀取** - 所有資料表結構由 `server/config/table.config.ts` 定義
- 🔄 **自動同步** - 修改 `table.config.ts` 後，初始化會使用最新配置
- 🎯 **統一管理** - 單一配置文件管理所有資料表定義
- 🔧 **SQL 自動生成** - 使用 `sql-generator.ts` 從配置自動生成 CREATE TABLE 和索引語句

**功能特色**：
- ✅ 自動檢查資料表是否存在
- ✅ 不存在時自動建立（含索引和觸發器）
- ✅ 從 `table.config.ts` 動態讀取資料表結構
- ✅ 詳細的日誌輸出
- ✅ 錯誤處理和恢復機制
- ✅ 視覺化的初始化摘要

#### 2. API 端點 (`server/index.ts`)

**新增端點**：

```typescript
// 資料庫初始化（檢查並建立 projects 表，返回所有專案）
GET /api/db/init

// 查詢 projects 資料
GET /api/projects
```

**響應格式**：

```json
{
  "success": true,
  "message": "資料庫初始化成功",
  "data": {
    "projects": [...],
    "count": 0
  }
}
```

---

### 前端模組

#### 1. 資料庫初始化 Hook (`client/hooks/useDbInit.ts`)

**核心 Hook**：

```typescript
useDbInit(autoInit: boolean = true): UseDbInitResult
```

**返回值**：

```typescript
{
  projects: Project[],      // 專案列表
  loading: boolean,          // 載入狀態
  error: string | null,      // 錯誤訊息
  initialized: boolean,      // 是否已初始化
  refetch: () => Promise<void>  // 重新載入函數
}
```

**使用範例**：

```tsx
import { useDbInit } from '../../hooks/useDbInit';

function MyComponent() {
  const { projects, loading, error, initialized } = useDbInit(true);
  
  useEffect(() => {
    if (initialized && !loading) {
      console.log('資料庫初始化完成');
      console.log(`載入 ${projects.length} 個專案`);
    }
  }, [initialized, loading, projects]);
  
  return <div>...</div>;
}
```

#### 2. 首頁整合 (`client/components/Navigation/HomePage.tsx`)

**整合方式**：

```tsx
const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenMindMap }) => {
  // 資料庫初始化
  const { projects, loading: dbLoading, error: dbError, initialized } = useDbInit(true);

  // 初始化完成後的處理
  useEffect(() => {
    if (initialized && !dbLoading) {
      console.log('✅ 資料庫初始化完成');
      console.log(`📊 載入 ${projects.length} 個專案`);
    }
  }, [initialized, dbLoading, projects]);
  
  // ... 其他程式碼
};
```

---

## 🚀 執行流程

### 1. 首頁開啟時

```
用戶訪問首頁
    ↓
HomePage 組件掛載
    ↓
useDbInit Hook 執行
    ↓
呼叫 /api/db/init
    ↓
後端檢查 projects 表是否存在
```

### 2. projects 表不存在時

```
檢查表不存在
    ↓
從 table.config.ts 讀取 projects 表定義
    ↓
使用 sql-generator.ts 生成 CREATE TABLE SQL
    ↓
執行 CREATE TABLE（根據 table.config.ts 配置）
    ↓
建立索引（根據 table.config.ts 的 indexes 配置）
    ↓
建立觸發器（根據 table.config.ts 的 triggers 配置）
    ↓
查詢並返回 projects 資料（空陣列）
    ↓
前端接收並顯示
```

**table.config.ts 配置項目**：
- 📋 **欄位定義** (`columns`) - 9 個欄位（id, uuid, name, description, status, owner_id, created_at, updated_at, deleted_at）
- 🔍 **索引定義** (`indexes`) - 3 個索引（owner_id, status, name）
- ⚡ **觸發器** (`triggers`) - 1 個觸發器（update_projects_updated_at）
- 🔗 **外鍵關聯** - owner_id → users.id（SET NULL）

### 3. projects 表已存在時

```
檢查表已存在
    ↓
直接查詢 projects 資料
    ↓
返回現有專案列表
    ↓
前端接收並顯示
```

---

## 📊 日誌輸出

### 後端日誌範例

```
╔═══════════════════════════════════════════════════════════╗
║              🗄️  資料庫初始化開始                          ║
╚═══════════════════════════════════════════════════════════╝

📋 需要檢查的資料表: projects

⚠️  資料表 projects 不存在，開始建立...
📊 建立資料表: projects
✅ 資料表 projects 建立成功
✅ 資料表 projects 索引建立成功（8 個）
✅ 觸發器 update_projects_updated_at 建立成功

╔═══════════════════════════════════════════════════════════╗
║              📊 資料庫初始化完成                            ║
╚═══════════════════════════════════════════════════════════╝

✅ 已存在: 0 個資料表

🆕 新建立: 1 個資料表
   projects

🔍 載入 projects 資料...
✅ 載入 0 筆資料
```

### 前端日誌範例

```
🗄️ 開始資料庫初始化...
✅ 資料庫初始化成功
📊 載入 0 個專案
✅ 資料庫初始化完成
📊 載入 0 個專案
```

---

## 🎯 資料表結構

### projects 資料表（來自 table.config.ts）

**配置來源**：`server/config/table.config.ts` → `tableConfigs.projects`

| 欄位 | 類型 | 說明 | 約束 |
|------|------|------|------|
| `id` | SERIAL | 主鍵 | PRIMARY KEY |
| `uuid` | UUID | UUID | UNIQUE, DEFAULT uuid_generate_v4() |
| `name` | VARCHAR(255) | 專案名稱 | NOT NULL |
| `description` | TEXT | 專案描述 | - |
| `status` | VARCHAR(50) | 專案狀態 | DEFAULT 'active' |
| `owner_id` | INTEGER | 擁有者 ID | FK → users.id |
| `created_at` | TIMESTAMP | 建立時間 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | 更新時間 | DEFAULT CURRENT_TIMESTAMP |
| `deleted_at` | TIMESTAMP | 刪除時間（軟刪除）| - |

### 索引（來自 table.config.ts）

```typescript
indexes: [
  { name: 'idx_projects_owner_id', columns: ['owner_id'] },
  { name: 'idx_projects_status', columns: ['status'] },
  { name: 'idx_projects_name', columns: ['name'] },
]
```

- `idx_projects_owner_id` - owner_id（外鍵索引，快速查詢使用者的專案）
- `idx_projects_status` - status（狀態篩選，快速找出 active/inactive 專案）
- `idx_projects_name` - name（名稱搜尋，支援模糊查詢）

### 觸發器（來自 table.config.ts）

```typescript
triggers: ['update_projects_updated_at']
```

- `update_projects_updated_at` - 自動更新 updated_at 欄位（BEFORE UPDATE 觸發）

### 如何修改 projects 表結構

如需修改 projects 表的結構，請編輯 `server/config/table.config.ts`：

```typescript
// server/config/table.config.ts
export const tableConfigs: TableConfig = {
  projects: {
    name: 'projects',
    comment: '專案資料表',
    columns: [
      // 在這裡新增或修改欄位
      {
        name: 'new_field',
        type: ColumnType.VARCHAR,
        length: 100,
        comment: '新欄位',
      },
      // ... 其他欄位
    ],
    indexes: [
      // 在這裡新增或修改索引
      { name: 'idx_projects_new_field', columns: ['new_field'] },
      // ... 其他索引
    ],
    triggers: ['update_projects_updated_at'],
  },
  // ... 其他資料表
};
```

修改後：
1. 刪除現有的 projects 表：`DROP TABLE IF EXISTS projects CASCADE;`
2. 重新啟動應用程式，系統會自動使用新配置建立資料表

---

## 🔍 使用範例

### 1. 自動初始化（首頁）

```tsx
import { useDbInit } from '../../hooks/useDbInit';

function HomePage() {
  const { projects, loading, error, initialized } = useDbInit(true);
  
  if (loading) return <div>初始化中...</div>;
  if (error) return <div>錯誤: {error}</div>;
  
  return (
    <div>
      <h1>專案列表</h1>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### 2. 手動查詢（其他頁面）

```tsx
import { useProjects } from '../../hooks/useDbInit';

function ProjectList() {
  const { projects, loading, error, refetch } = useProjects();
  
  return (
    <div>
      <button onClick={refetch}>重新載入</button>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### 3. 直接 API 呼叫

```typescript
// 初始化資料庫
const response = await fetch('/api/db/init');
const data = await response.json();
console.log(data.data.projects);

// 查詢專案
const response = await fetch('/api/projects');
const data = await response.json();
console.log(data.data);
```

---

## ⚠️ 注意事項

### 1. 資料庫連線

確保 `.env` 檔案包含正確的資料庫配置：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

### 2. PostgreSQL 擴展

需要啟用 `uuid-ossp` 擴展（用於 UUID 生成）：

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3. 權限

資料庫使用者需要有建立資料表的權限：

```sql
GRANT CREATE ON DATABASE your_database TO your_user;
```

### 4. 錯誤處理

如果初始化失敗，檢查：
- ✅ 資料庫連線是否正常
- ✅ 使用者權限是否足夠
- ✅ table.config.ts 配置是否正確
- ✅ PostgreSQL 版本是否支援（建議 12+）

---

## 🧪 測試方式

### 1. 首次載入測試

```bash
# 1. 刪除 projects 表（如果存在）
psql -d your_database -c "DROP TABLE IF EXISTS projects;"

# 2. 啟動開發伺服器
npm run dev

# 3. 開啟瀏覽器訪問首頁
# http://localhost:5030

# 4. 檢查瀏覽器 Console 和 Terminal 日誌
```

**預期結果**：
- ✅ 終端顯示「建立資料表: projects」
- ✅ 瀏覽器 Console 顯示「資料庫初始化完成」
- ✅ 無錯誤訊息

### 2. 重複載入測試

```bash
# 1. 重新整理頁面
# 2. 檢查日誌
```

**預期結果**：
- ✅ 終端顯示「資料表 projects 已存在」
- ✅ 瀏覽器 Console 顯示「載入 0 個專案」

### 3. 資料載入測試

```sql
-- 插入測試資料
INSERT INTO projects (name, description, status) 
VALUES 
  ('測試專案 1', '這是測試專案 1', 'active'),
  ('測試專案 2', '這是測試專案 2', 'active');
```

**預期結果**：
- ✅ 重新整理後顯示「載入 2 個專案」
- ✅ Console 中可以看到專案資料

---

## 📚 相關檔案

### 配置檔案

- `server/config/table.config.ts` - **資料表配置定義**（所有表結構的來源）
- `server/config/database.config.ts` - 資料庫連線配置

### 後端

- `server/database/db-init.ts` - 資料庫初始化模組
- `server/database/db.ts` - 資料庫連線模組
- `server/database/sql-generator.ts` - SQL 生成器（從 table.config 生成 SQL）
- `server/index.ts` - API 端點

### 前端

- `client/hooks/useDbInit.ts` - 資料庫初始化 Hook
- `client/components/Navigation/HomePage.tsx` - 首頁組件

### 文件

- `docs/db-init-guide.md` - 本文件（資料庫初始化指南）
- `docs/table-config-architecture.md` - **table.config.ts 架構說明**（必讀）
- `docs/project-index-guide.md` - project_index 表完整指南
- `docs/project-index-quickref.md` - 快速參考

---

## 💡 重要提示

### table.config.ts 是唯一的資料表定義來源

所有資料表結構都在 `server/config/table.config.ts` 中定義：

```typescript
export const tableConfigs: TableConfig = {
  projects: { /* projects 表配置 */ },
  project_index: { /* 遊戲專案索引表配置 */ },
  users: { /* 使用者表配置 */ },
  mindmaps: { /* 心智圖表配置 */ },
  trees: { /* 樹狀圖表配置 */ },
  test: { /* 測試表配置 */ },
};
```

**優勢**：
- ✅ **單一真相來源** - 所有表定義集中管理
- ✅ **類型安全** - TypeScript 介面確保配置正確
- ✅ **自動生成** - SQL 語句自動從配置生成
- ✅ **易於維護** - 修改配置即可更新資料表結構
- ✅ **可擴展** - 輕鬆新增新的資料表定義

### 初始化流程

```
首頁開啟
    ↓
useDbInit Hook
    ↓
/api/db/init
    ↓
initializeProjectsTable()
    ↓
initializeDatabase(['projects'])
    ↓
getTableConfig('projects') ← 從 table.config.ts 讀取
    ↓
generateCreateTableSQL() ← 使用 sql-generator
    ↓
執行 CREATE TABLE + 索引 + 觸發器
    ↓
載入資料並返回
```

---

## 🎉 總結

這個自動初始化功能提供了：

✅ **自動化** - 無需手動建立資料表  
✅ **智能檢查** - 避免重複建立  
✅ **類型安全** - TypeScript 完整支援  
✅ **錯誤處理** - 完善的錯誤處理機制  
✅ **詳細日誌** - 清楚的執行過程記錄  
✅ **易於使用** - 簡單的 Hook 介面

**首頁開啟即自動完成資料庫初始化，無需任何手動操作！** 🚀
