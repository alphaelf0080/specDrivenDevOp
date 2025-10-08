# Table Config 系統 - 快速開始

## 🎯 什麼是 Table Config？

Table Config 是一個集中化的資料表定義系統，讓你可以：
- 在一個檔案中定義所有資料表結構
- 自動生成 SQL 語句
- 自動建立資料表
- 保持資料庫結構的一致性

## 📦 已建立的檔案

```
server/
├── config/
│   └── table.config.ts           ✅ 資料表配置（含 5 個預設表）
├── database/
│   ├── sql-generator.ts          ✅ SQL 自動生成器
│   ├── auto-create-tables.ts    ✅ 自動建表工具
│   └── table-config-examples.ts ✅ 使用範例
```

## 🚀 5 分鐘快速開始

### 第 1 步：查看預設的資料表配置

已預先定義了 5 個資料表：
- ✅ `users` - 使用者資料表
- ✅ `projects` - 專案資料表
- ✅ `mindmaps` - 心智圖資料表
- ✅ `trees` - 樹狀圖資料表
- ✅ `test` - 測試資料表

### 第 2 步：自動建立所有資料表

```bash
npm run db:create-tables
```

這會自動：
1. 啟用 UUID 擴展
2. 建立觸發器函數
3. 建立所有資料表
4. 建立索引
5. 設定觸發器
6. 驗證結果

### 第 3 步：查看範例

```bash
npm run db:table-config-examples
```

查看如何使用 Table Config 和 SQL Generator。

## 💡 基本使用

### 1. 查看資料表配置

```typescript
import { getTableConfig, getAllTableNames } from './server/config/table.config.js';

// 取得所有資料表
const tables = getAllTableNames();
console.log(tables); // ['users', 'projects', 'mindmaps', 'trees', 'test']

// 取得特定資料表配置
const usersConfig = getTableConfig('users');
console.log(usersConfig.columns); // 所有欄位定義
```

### 2. 自動生成 SQL

```typescript
import { generateSelectSQL, generateInsertSQL } from './server/database/sql-generator.js';

// 生成 SELECT
const query = generateSelectSQL('users', {
  columns: ['id', 'username', 'email'],
  where: { active: true },
  limit: 10
});
console.log(query.sql);
// SELECT id, username, email FROM users WHERE active = $1 LIMIT 10

// 生成 INSERT
const insertQuery = generateInsertSQL('users', {
  username: 'john',
  email: 'john@example.com'
});
console.log(insertQuery.sql);
// INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *
```

### 3. 在程式中使用

```typescript
import { getDatabase } from './server/database/db.js';
import { generateInsertSQL, generateSelectSQL } from './server/database/sql-generator.js';

const db = getDatabase();
await db.connect();

// 插入資料
const insertQuery = generateInsertSQL('test', {
  name: '測試項目',
  status: 'active'
});
const result = await db.query(insertQuery.sql, insertQuery.params);
console.log('插入成功:', result.rows[0]);

// 查詢資料
const selectQuery = generateSelectSQL('test', {
  where: { status: 'active' }
});
const tests = await db.query(selectQuery.sql, selectQuery.params);
console.log('查詢結果:', tests.rows);

await db.disconnect();
```

## 🔧 進階使用

### 新增自己的資料表

編輯 `server/config/table.config.ts`：

```typescript
export const tableConfigs: TableConfig = {
  // ... 其他資料表
  
  // 新增你的資料表
  products: {
    name: 'products',
    comment: '產品資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
      },
      {
        name: 'name',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
      },
      {
        name: 'price',
        type: ColumnType.DECIMAL,
        precision: 10,
        scale: 2,
        notNull: true,
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
      },
    ],
    indexes: [
      { name: 'idx_products_name', columns: ['name'] }
    ],
  },
};
```

然後執行：
```bash
npm run db:create-tables
```

### 只輸出 SQL（不建立資料表）

```bash
npm run db:export-sql
```

這會輸出完整的 SQL 到終端，你可以複製並手動執行。

### 刪除所有資料表（危險！）

```bash
npm run db:drop-tables
```

⚠️ **警告**: 這會刪除所有資料！

## 📊 完整的 CRUD 範例

```typescript
import { getDatabase } from './server/database/db.js';
import {
  generateInsertSQL,
  generateSelectSQL,
  generateUpdateSQL,
  generateDeleteSQL,
} from './server/database/sql-generator.js';

const db = getDatabase();
await db.connect();

// CREATE
const insertQuery = generateInsertSQL('test', {
  name: '新項目',
  description: '描述',
  status: 'active',
});
const newItem = await db.query(insertQuery.sql, insertQuery.params);
const newId = newItem.rows[0].id;

// READ
const selectQuery = generateSelectSQL('test', {
  where: { id: newId },
});
const item = await db.query(selectQuery.sql, selectQuery.params);
console.log('查詢結果:', item.rows[0]);

// UPDATE
const updateQuery = generateUpdateSQL(
  'test',
  { status: 'completed' },
  { id: newId }
);
const updated = await db.query(updateQuery.sql, updateQuery.params);
console.log('更新結果:', updated.rows[0]);

// DELETE
const deleteQuery = generateDeleteSQL('test', { id: newId });
await db.query(deleteQuery.sql, deleteQuery.params);
console.log('刪除成功');

await db.disconnect();
```

## 🎓 資料型別參考

### 常用型別

```typescript
ColumnType.SERIAL          // 自動遞增整數（主鍵常用）
ColumnType.INTEGER         // 整數
ColumnType.BIGINT          // 大整數
ColumnType.DECIMAL         // 精確小數（需指定 precision 和 scale）
ColumnType.VARCHAR         // 變長字串（需指定 length）
ColumnType.TEXT            // 長文字
ColumnType.BOOLEAN         // 布林值
ColumnType.TIMESTAMP_WITH_TIMEZONE  // 帶時區的時間戳
ColumnType.JSONB           // JSON 資料（建議用 JSONB，效能較好）
ColumnType.UUID            // UUID
```

### 欄位選項

```typescript
{
  name: 'email',
  type: ColumnType.VARCHAR,
  length: 255,               // VARCHAR 長度
  primaryKey: true,          // 主鍵
  unique: true,              // 唯一約束
  notNull: true,             // 不可為空
  default: 'default_value',  // 預設值
  references: {              // 外鍵
    table: 'users',
    column: 'id',
    onDelete: 'CASCADE'
  },
  comment: '電子郵件',       // 欄位註解
}
```

## 📋 npm 腳本清單

```bash
# Table Config 相關
npm run db:create-tables          # 自動建立所有資料表
npm run db:export-sql             # 輸出 SQL 到終端
npm run db:drop-tables            # 刪除所有資料表（危險！）
npm run db:table-config-examples  # 執行範例程式

# 其他資料庫腳本
npm run db:create-test-table      # 建立測試表
npm run db:test                   # 執行資料庫測試
```

## 🆚 與 init.sql 的差異

### init.sql（傳統方式）
- ✅ 直接執行 SQL
- ❌ 手動維護
- ❌ 難以重複使用
- ❌ 容易出錯

### Table Config（新方式）
- ✅ TypeScript 定義
- ✅ 自動生成 SQL
- ✅ 類型安全
- ✅ 易於維護
- ✅ 可程式化使用

## 🎯 典型工作流程

### 開發新功能

1. **定義資料表** 
   ```typescript
   // 在 table.config.ts 中定義
   ```

2. **自動建表**
   ```bash
   npm run db:create-tables
   ```

3. **使用 SQL Generator**
   ```typescript
   // 在程式中使用自動生成的 SQL
   ```

4. **測試**
   ```bash
   npm run db:test
   ```

## 💪 優勢

1. **集中管理** - 所有資料表定義在一個地方
2. **類型安全** - TypeScript 確保定義正確
3. **自動生成** - SQL 自動生成，減少錯誤
4. **易於維護** - 修改配置即可更新結構
5. **可程式化** - 可在程式中動態使用

## 🔗 更多資訊

- 詳細文件：`docs/table-config-guide.md`
- 範例程式：`server/database/table-config-examples.ts`
- 配置檔案：`server/config/table.config.ts`

---

**開始使用 Table Config 系統！** 🚀

```bash
# 立即開始
npm run db:create-tables
```
