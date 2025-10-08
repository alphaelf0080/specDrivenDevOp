# Table Config 架構說明

## 📋 概述

`server/config/table.config.ts` 是整個資料庫系統的**核心配置文件**，所有資料表的結構定義都來自這個文件。

---

## 🎯 設計理念

### 單一真相來源（Single Source of Truth）

所有資料表定義集中在一個配置文件中，避免資訊分散和不一致：

```
table.config.ts
    ↓
    ├─→ SQL Generator（自動生成 CREATE TABLE）
    ├─→ Database Init（自動建立資料表）
    ├─→ API Routes（自動驗證欄位）
    └─→ TypeScript Types（類型推斷）
```

---

## 🏗️ 架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                  table.config.ts                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  export const tableConfigs: TableConfig = {         │   │
│  │    projects: { ... },                               │   │
│  │    project_index: { ... },                          │   │
│  │    users: { ... },                                  │   │
│  │    mindmaps: { ... },                               │   │
│  │    trees: { ... },                                  │   │
│  │  }                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  sql-generator   │ │   db-init    │ │  validators  │
│                  │ │              │ │              │
│ • CREATE TABLE   │ │ • 檢查表存在 │ │ • 欄位驗證   │
│ • CREATE INDEX   │ │ • 自動建表   │ │ • 類型檢查   │
│ • ALTER TABLE    │ │ • 建立索引   │ │ • 約束驗證   │
└──────────────────┘ └──────────────┘ └──────────────┘
```

---

## 📦 資料結構

### TableDefinition 介面

```typescript
interface TableDefinition {
  name: string;                    // 資料表名稱
  schema?: string;                 // Schema（預設 public）
  columns: ColumnDefinition[];     // 欄位定義
  indexes?: IndexDefinition[];     // 索引定義
  triggers?: string[];             // 觸發器
  comment?: string;                // 資料表註解
}
```

### ColumnDefinition 介面

```typescript
interface ColumnDefinition {
  name: string;                    // 欄位名稱
  type: ColumnType | string;       // 資料型別
  length?: number;                 // 長度
  precision?: number;              // 精度
  scale?: number;                  // 小數位數
  primaryKey?: boolean;            // 主鍵
  unique?: boolean;                // 唯一
  notNull?: boolean;               // 不可為 NULL
  default?: string | number | boolean;  // 預設值
  references?: {                   // 外鍵參考
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
  comment?: string;                // 欄位註解
}
```

### IndexDefinition 介面

```typescript
interface IndexDefinition {
  name: string;                    // 索引名稱
  columns: string[];               // 索引欄位
  unique?: boolean;                // 唯一索引
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';  // 索引類型
  where?: string;                  // 部分索引條件
}
```

---

## 🔧 使用方式

### 1. 定義新的資料表

```typescript
// server/config/table.config.ts

export const tableConfigs: TableConfig = {
  // ... 現有的資料表
  
  // 新增一個資料表
  my_new_table: {
    name: 'my_new_table',
    comment: '我的新資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '主鍵',
      },
      {
        name: 'name',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '名稱',
      },
      {
        name: 'data',
        type: ColumnType.JSONB,
        comment: '額外資料',
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
        comment: '建立時間',
      },
    ],
    indexes: [
      { name: 'idx_my_new_table_name', columns: ['name'] },
      { name: 'idx_my_new_table_data', columns: ['data'], type: 'GIN' },
    ],
    triggers: ['update_my_new_table_updated_at'],
  },
};
```

### 2. 自動建立資料表

修改 `table.config.ts` 後，有兩種方式建立資料表：

#### 方式 A：透過 API（推薦）

```typescript
// 在應用程式啟動時自動初始化
await initializeDatabase(db, ['my_new_table']);
```

#### 方式 B：手動執行腳本

```bash
# 建立一個初始化腳本
node scripts/init-tables.js my_new_table
```

### 3. 讀取資料表配置

```typescript
import { getTableConfig } from '../config/table.config.js';

// 取得資料表配置
const tableConfig = getTableConfig('projects');

// 取得欄位列表
const columns = tableConfig.columns.map(col => col.name);
// ['id', 'uuid', 'name', 'description', ...]

// 取得索引列表
const indexes = tableConfig.indexes;
// [{ name: 'idx_projects_owner_id', columns: ['owner_id'] }, ...]
```

---

## 🔄 工作流程

### 初始化流程

```
1. 應用程式啟動
      ↓
2. 呼叫 initializeDatabase()
      ↓
3. 檢查資料表是否存在
      ↓
4. 如果不存在：
   a. 從 table.config.ts 讀取配置
   b. 使用 sql-generator 生成 SQL
   c. 執行 CREATE TABLE
   d. 建立索引
   e. 建立觸發器
      ↓
5. 完成初始化
```

### SQL 生成流程

```typescript
// 1. 從配置讀取
const tableConfig = getTableConfig('projects');

// 2. 生成 CREATE TABLE SQL
const createTableSQL = generateCreateTableSQL('projects');
// CREATE TABLE projects (
//   id SERIAL PRIMARY KEY,
//   uuid UUID UNIQUE DEFAULT uuid_generate_v4(),
//   ...
// )

// 3. 生成索引 SQL
const indexesSQL = generateAllIndexesSQL('projects');
// [
//   'CREATE INDEX idx_projects_owner_id ON projects (owner_id)',
//   'CREATE INDEX idx_projects_status ON projects (status)',
//   ...
// ]

// 4. 執行 SQL
await db.query(createTableSQL);
for (const indexSQL of indexesSQL) {
  await db.query(indexSQL);
}
```

---

## 📊 目前已定義的資料表

### 1. users - 使用者資料表
- **欄位數**: 9 個
- **索引數**: 3 個
- **特色**: UUID、軟刪除、自動更新時間戳記

### 2. projects - 專案資料表
- **欄位數**: 9 個
- **索引數**: 3 個
- **外鍵**: owner_id → users.id
- **特色**: UUID、狀態管理、軟刪除

### 3. project_index - 遊戲專案索引表
- **欄位數**: 48 個
- **索引數**: 13 個
- **JSONB 欄位**: 5 個
- **特色**: 完整的 Slot Game 屬性、多語言支援、資產管理

### 4. mindmaps - 心智圖資料表
- **欄位數**: 10 個
- **索引數**: 3 個
- **外鍵**: project_id → projects.id
- **特色**: JSONB 資料儲存、GIN 索引

### 5. trees - 樹狀圖資料表
- **欄位數**: 10 個
- **索引數**: 3 個
- **外鍵**: project_id → projects.id
- **特色**: JSONB 資料儲存、類型分類

### 6. test - 測試資料表
- **欄位數**: 7 個
- **索引數**: 3 個
- **特色**: 用於開發測試

---

## 🎯 範例：projects 表配置

```typescript
projects: {
  name: 'projects',
  comment: '專案資料表',
  columns: [
    {
      name: 'id',
      type: ColumnType.SERIAL,
      primaryKey: true,
      notNull: true,
      comment: '專案 ID',
    },
    {
      name: 'uuid',
      type: ColumnType.UUID,
      unique: true,
      default: 'uuid_generate_v4()',
      comment: 'UUID',
    },
    {
      name: 'name',
      type: ColumnType.VARCHAR,
      length: 255,
      notNull: true,
      comment: '專案名稱',
    },
    {
      name: 'description',
      type: ColumnType.TEXT,
      comment: '專案描述',
    },
    {
      name: 'status',
      type: ColumnType.VARCHAR,
      length: 50,
      default: "'active'",
      comment: '專案狀態',
    },
    {
      name: 'owner_id',
      type: ColumnType.INTEGER,
      references: {
        table: 'users',
        column: 'id',
        onDelete: 'SET NULL',
      },
      comment: '擁有者 ID',
    },
    {
      name: 'created_at',
      type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
      default: 'CURRENT_TIMESTAMP',
      notNull: true,
      comment: '建立時間',
    },
    {
      name: 'updated_at',
      type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
      default: 'CURRENT_TIMESTAMP',
      comment: '更新時間',
    },
    {
      name: 'deleted_at',
      type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
      comment: '刪除時間',
    },
  ],
  indexes: [
    { name: 'idx_projects_owner_id', columns: ['owner_id'] },
    { name: 'idx_projects_status', columns: ['status'] },
    { name: 'idx_projects_name', columns: ['name'] },
  ],
  triggers: ['update_projects_updated_at'],
}
```

生成的 SQL：

```sql
-- CREATE TABLE
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- CREATE INDEXES
CREATE INDEX idx_projects_owner_id ON projects (owner_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_name ON projects (name);

-- CREATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_updated_at();
```

---

## 🔍 輔助函數

### getTableConfig(tableName: string)

取得指定資料表的配置：

```typescript
const config = getTableConfig('projects');
// 返回 TableDefinition 物件
```

### getAllTableNames()

取得所有已定義的資料表名稱：

```typescript
const tables = getAllTableNames();
// ['users', 'projects', 'project_index', 'mindmaps', 'trees', 'test']
```

### getTableColumns(tableName: string)

取得資料表的所有欄位名稱：

```typescript
const columns = getTableColumns('projects');
// ['id', 'uuid', 'name', 'description', 'status', 'owner_id', ...]
```

### getPrimaryKeyColumn(tableName: string)

取得資料表的主鍵欄位：

```typescript
const pk = getPrimaryKeyColumn('projects');
// 'id'
```

### hasColumn(tableName: string, columnName: string)

檢查欄位是否存在：

```typescript
const exists = hasColumn('projects', 'name');
// true
```

### getColumnDefinition(tableName: string, columnName: string)

取得欄位的詳細定義：

```typescript
const column = getColumnDefinition('projects', 'name');
// {
//   name: 'name',
//   type: ColumnType.VARCHAR,
//   length: 255,
//   notNull: true,
//   comment: '專案名稱'
// }
```

---

## ✅ 優勢

### 1. 集中管理
- 所有資料表定義在一個文件
- 易於查找和維護
- 減少重複定義

### 2. 類型安全
- TypeScript 介面確保配置正確
- 編譯時檢查錯誤
- IDE 自動完成支援

### 3. 自動化
- SQL 語句自動生成
- 減少手寫 SQL 錯誤
- 一致的命名規範

### 4. 可維護性
- 修改配置即可更新結構
- 版本控制友善
- 易於 Code Review

### 5. 可擴展性
- 輕鬆新增新資料表
- 支援複雜的資料型別
- 靈活的索引策略

### 6. 文件化
- 配置即文件
- 清楚的註解說明
- 易於理解資料庫結構

---

## 🚀 最佳實踐

### 1. 命名規範

```typescript
// 資料表名稱：小寫 + 底線
name: 'project_index'

// 索引名稱：idx_表名_欄位名
name: 'idx_projects_owner_id'

// 觸發器名稱：動作_表名_用途
name: 'update_projects_updated_at'
```

### 2. 欄位註解

```typescript
{
  name: 'game_id',
  type: ColumnType.VARCHAR,
  length: 100,
  unique: true,
  notNull: true,
  comment: '遊戲唯一識別碼（例如：BFG_001）', // 清楚的註解，包含範例
}
```

### 3. 索引策略

```typescript
// 外鍵一定要有索引
{ name: 'idx_projects_owner_id', columns: ['owner_id'] }

// 常用的查詢條件要有索引
{ name: 'idx_projects_status', columns: ['status'] }

// JSONB 欄位使用 GIN 索引
{ name: 'idx_project_index_tags', columns: ['tags'], type: 'GIN' }
```

### 4. 預設值設定

```typescript
// 布林值預設 false
{ name: 'is_active', type: ColumnType.BOOLEAN, default: false }

// 狀態預設值使用字串
{ name: 'status', type: ColumnType.VARCHAR, default: "'active'" }

// 時間戳記使用 CURRENT_TIMESTAMP
{ name: 'created_at', default: 'CURRENT_TIMESTAMP' }
```

### 5. 軟刪除

```typescript
// 所有重要資料表都應該有 deleted_at
{
  name: 'deleted_at',
  type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
  comment: '刪除時間（軟刪除）',
}
```

---

## 🔧 維護指南

### 新增資料表

1. 在 `tableConfigs` 中新增配置
2. 執行初始化：`await initializeDatabase(db, ['new_table'])`
3. 驗證資料表已建立：`\d new_table` (PostgreSQL CLI)

### 修改現有資料表

1. 更新 `table.config.ts` 中的配置
2. 刪除舊資料表：`DROP TABLE IF EXISTS table_name CASCADE;`
3. 重新初始化：`await initializeDatabase(db, ['table_name'])`

⚠️ **注意**：刪除資料表會遺失所有資料，請先備份！

### 新增索引

1. 在 `indexes` 陣列中新增索引定義
2. 重新初始化或手動執行：
   ```sql
   CREATE INDEX idx_name ON table_name (column_name);
   ```

---

## 📚 相關文件

- `server/config/table.config.ts` - 資料表配置定義（本文件說明的主角）
- `server/database/sql-generator.ts` - SQL 生成器實作
- `server/database/db-init.ts` - 資料庫初始化實作
- `docs/db-init-guide.md` - 資料庫初始化使用指南
- `docs/project-index-guide.md` - project_index 表完整指南

---

## 🎉 總結

`table.config.ts` 是整個資料庫系統的核心：

✅ **單一真相來源** - 所有表定義集中管理  
✅ **類型安全** - TypeScript 確保配置正確  
✅ **自動化** - SQL 自動生成，減少錯誤  
✅ **易於維護** - 修改配置即可更新結構  
✅ **文件化** - 配置即文件，清楚易懂  
✅ **可擴展** - 輕鬆新增新的資料表

**記住**：修改資料庫結構時，永遠從 `table.config.ts` 開始！
