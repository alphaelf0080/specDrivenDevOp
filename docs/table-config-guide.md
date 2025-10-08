# Table Config 系統說明文件

## 📋 概述

Table Config 系統提供一個集中化的資料表結構定義方式，用於：
- 定義資料表結構（表名、欄位、型別、約束）
- 自動生成 CREATE TABLE SQL
- 自動生成 CRUD SQL 查詢
- 資料驗證
- 資料表自動建立

## 📁 檔案結構

```
server/
├── config/
│   └── table.config.ts           # 資料表配置定義
├── database/
│   ├── sql-generator.ts          # SQL 生成器
│   ├── auto-create-tables.ts    # 自動建立資料表
│   └── table-config-examples.ts # 使用範例
```

## 🎯 核心功能

### 1. Table Config (`table.config.ts`)

定義資料表結構的配置檔案，包含：

#### 資料型別 (ColumnType)
```typescript
enum ColumnType {
  SERIAL, INTEGER, BIGINT, DECIMAL, NUMERIC,
  VARCHAR, CHAR, TEXT,
  BOOLEAN,
  DATE, TIME, TIMESTAMP, TIMESTAMP_WITH_TIMEZONE,
  JSON, JSONB,
  UUID, INET, ARRAY
}
```

#### 欄位定義 (ColumnDefinition)
```typescript
interface ColumnDefinition {
  name: string;              // 欄位名稱
  type: ColumnType;          // 資料型別
  length?: number;           // 長度
  primaryKey?: boolean;      // 主鍵
  unique?: boolean;          // 唯一
  notNull?: boolean;         // 不可為空
  default?: any;             // 預設值
  references?: {...};        // 外鍵參考
  comment?: string;          // 註解
}
```

#### 資料表定義 (TableDefinition)
```typescript
interface TableDefinition {
  name: string;              // 資料表名稱
  columns: ColumnDefinition[]; // 欄位定義
  indexes?: IndexDefinition[]; // 索引定義
  triggers?: string[];       // 觸發器
  comment?: string;          // 註解
}
```

### 2. SQL Generator (`sql-generator.ts`)

自動生成各種 SQL 語句的工具。

#### 主要功能

##### 生成 CREATE TABLE
```typescript
const sql = generateCreateTableSQL('users');
// 輸出完整的 CREATE TABLE 語句，包含欄位定義和註解
```

##### 生成 SELECT
```typescript
const { sql, params } = generateSelectSQL('users', {
  columns: ['id', 'username', 'email'],
  where: { active: true },
  orderBy: 'created_at DESC',
  limit: 10
});
// 輸出: SELECT id, username, email FROM users WHERE active = $1 ORDER BY created_at DESC LIMIT 10
```

##### 生成 INSERT
```typescript
const { sql, params } = generateInsertSQL('users', {
  username: 'john',
  email: 'john@example.com'
});
// 輸出: INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *
```

##### 生成 UPDATE
```typescript
const { sql, params } = generateUpdateSQL(
  'users',
  { email: 'new@example.com' },
  { id: 1 }
);
// 輸出: UPDATE users SET email = $1 WHERE id = $2 RETURNING *
```

##### 生成 DELETE
```typescript
const { sql, params } = generateDeleteSQL('users', { id: 1 });
// 輸出: DELETE FROM users WHERE id = $1
```

### 3. 自動建立資料表 (`auto-create-tables.ts`)

根據 table config 自動建立資料表。

## 🚀 使用方式

### 1. 定義資料表配置

在 `server/config/table.config.ts` 中定義資料表：

```typescript
export const tableConfigs: TableConfig = {
  users: {
    name: 'users',
    comment: '使用者資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
      },
      {
        name: 'username',
        type: ColumnType.VARCHAR,
        length: 50,
        unique: true,
        notNull: true,
      },
      // ... 更多欄位
    ],
    indexes: [
      { name: 'idx_users_username', columns: ['username'] }
    ]
  }
};
```

### 2. 自動建立所有資料表

```bash
npm run db:create-tables
```

這會：
- ✅ 啟用 UUID 擴展
- ✅ 建立觸發器函數
- ✅ 建立所有資料表
- ✅ 建立索引
- ✅ 建立觸發器
- ✅ 驗證結果

### 3. 輸出 SQL 到終端

```bash
npm run db:export-sql
```

查看完整的 CREATE TABLE SQL 語句。

### 4. 在程式中使用

#### 使用 SQL Generator

```typescript
import { generateSelectSQL, generateInsertSQL } from './server/database/sql-generator.js';
import { getDatabase } from './server/database/db.js';

const db = getDatabase();
await db.connect();

// INSERT
const insertQuery = generateInsertSQL('users', {
  username: 'john',
  email: 'john@example.com'
});
const result = await db.query(insertQuery.sql, insertQuery.params);

// SELECT
const selectQuery = generateSelectSQL('users', {
  where: { username: 'john' }
});
const users = await db.query(selectQuery.sql, selectQuery.params);

await db.disconnect();
```

#### 使用 Table Config API

```typescript
import {
  getTableConfig,
  getAllTableNames,
  getTableColumns,
  getPrimaryKeyColumn
} from './server/config/table.config.js';

// 取得所有資料表名稱
const tables = getAllTableNames();
// ['users', 'projects', 'mindmaps', 'trees', 'test']

// 取得資料表配置
const usersConfig = getTableConfig('users');

// 取得欄位列表
const columns = getTableColumns('users');
// ['id', 'uuid', 'username', 'email', ...]

// 取得主鍵欄位
const pk = getPrimaryKeyColumn('users');
// 'id'
```

## 📖 完整範例

### 新增一個資料表配置

```typescript
// 在 table.config.ts 中新增
export const tableConfigs: TableConfig = {
  // ... 其他資料表
  
  products: {
    name: 'products',
    comment: '產品資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '產品 ID',
      },
      {
        name: 'name',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '產品名稱',
      },
      {
        name: 'price',
        type: ColumnType.DECIMAL,
        precision: 10,
        scale: 2,
        notNull: true,
        comment: '價格',
      },
      {
        name: 'stock',
        type: ColumnType.INTEGER,
        default: 0,
        comment: '庫存',
      },
      {
        name: 'category',
        type: ColumnType.VARCHAR,
        length: 50,
        comment: '分類',
      },
      {
        name: 'metadata',
        type: ColumnType.JSONB,
        comment: '額外資訊',
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
      },
    ],
    indexes: [
      { name: 'idx_products_name', columns: ['name'] },
      { name: 'idx_products_category', columns: ['category'] },
      { name: 'idx_products_metadata', columns: ['metadata'], type: 'GIN' },
    ],
  },
};
```

### 使用新資料表

```typescript
import { generateInsertSQL, generateSelectSQL } from './server/database/sql-generator.js';
import { getDatabase } from './server/database/db.js';

const db = getDatabase();
await db.connect();

// 插入產品
const insertQuery = generateInsertSQL('products', {
  name: 'iPhone 15',
  price: 29900,
  stock: 100,
  category: 'electronics',
  metadata: JSON.stringify({
    brand: 'Apple',
    color: 'black',
    specs: { ram: '8GB', storage: '256GB' }
  })
});

const newProduct = await db.query(insertQuery.sql, insertQuery.params);
console.log('新產品:', newProduct.rows[0]);

// 查詢產品
const selectQuery = generateSelectSQL('products', {
  where: { category: 'electronics' },
  orderBy: 'price DESC',
  limit: 10
});

const products = await db.query(selectQuery.sql, selectQuery.params);
console.log('電子產品:', products.rows);

await db.disconnect();
```

## 🔧 API 文件

### Table Config API

#### `getTableConfig(tableName: string)`
取得資料表配置

#### `getAllTableNames()`
取得所有資料表名稱

#### `getTableColumns(tableName: string)`
取得資料表的所有欄位名稱

#### `getPrimaryKeyColumn(tableName: string)`
取得資料表的主鍵欄位

#### `hasColumn(tableName: string, columnName: string)`
檢查欄位是否存在

#### `getColumnDefinition(tableName: string, columnName: string)`
取得欄位定義

### SQL Generator API

#### `generateCreateTableSQL(tableName: string)`
生成 CREATE TABLE 語句

#### `generateAllIndexesSQL(tableName: string)`
生成所有索引的 SQL

#### `generateFullTableSQL(tableName: string)`
生成完整的資料表 SQL（包含索引）

#### `generateAllTablesSQL()`
生成所有資料表的 SQL

#### `generateSelectSQL(tableName, options)`
生成 SELECT 語句
- `options.columns`: 要查詢的欄位
- `options.where`: WHERE 條件
- `options.orderBy`: 排序
- `options.limit`: 限制筆數
- `options.offset`: 偏移量

#### `generateInsertSQL(tableName, data, returning)`
生成 INSERT 語句

#### `generateUpdateSQL(tableName, data, where)`
生成 UPDATE 語句

#### `generateDeleteSQL(tableName, where)`
生成 DELETE 語句

#### `validateData(tableName, data)`
驗證資料是否符合資料表定義

## 🎓 最佳實踐

1. **集中管理資料表定義**
   - 所有資料表定義都在 `table.config.ts` 中
   - 便於維護和查看完整結構

2. **使用 SQL Generator**
   - 避免手寫 SQL 字串
   - 自動參數化防止 SQL 注入
   - 保持一致的查詢格式

3. **資料驗證**
   - 使用 `validateData()` 在插入前驗證
   - 檢查必填欄位和欄位定義

4. **註解完整**
   - 為資料表和欄位添加註解
   - 方便其他開發者理解

5. **索引優化**
   - 為常用查詢欄位建立索引
   - JSONB 欄位使用 GIN 索引

## ⚠️ 注意事項

1. 修改 `table.config.ts` 後需要重新執行 `db:create-tables`
2. 外鍵參考的資料表必須先存在
3. `db:drop-tables` 會刪除所有資料（危險操作）
4. 生產環境建議使用資料庫遷移工具

## 📝 npm 腳本

```bash
# 建立所有資料表
npm run db:create-tables

# 輸出 SQL 到終端
npm run db:export-sql

# 刪除所有資料表（危險！）
npm run db:drop-tables

# 執行範例
npm run db:table-config-examples
```

## 🔗 相關檔案

- `server/config/table.config.ts` - 資料表配置定義
- `server/database/sql-generator.ts` - SQL 生成器
- `server/database/auto-create-tables.ts` - 自動建表工具
- `server/database/table-config-examples.ts` - 使用範例
- `server/database/db.ts` - 資料庫操作核心

---

**Table Config 系統已完成並可立即使用！** 🎉
