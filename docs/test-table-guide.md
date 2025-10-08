# Test Table 操作指南

## 📋 概述

Test Table 是一個用於測試資料庫操作的範例資料表，包含完整的 CRUD 功能示範。

## 🏗️ 資料表結構

```sql
CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 欄位說明

- **id**: 主鍵，自動遞增
- **name**: 名稱（必填）
- **description**: 描述
- **status**: 狀態（預設: 'active'）
- **data**: JSONB 格式的額外資料
- **created_at**: 建立時間
- **updated_at**: 更新時間（自動更新）

## 🚀 快速開始

### 1. 建立 test table

使用 npm 腳本：
```bash
npm run db:create-test-table
```

或直接執行：
```bash
tsx server/database/create-test-table.ts
```

這會：
- ✅ 建立 test 資料表
- ✅ 建立相關索引（name, status, data）
- ✅ 建立自動更新 updated_at 的觸發器
- ✅ 插入 3 筆測試資料

### 2. 測試 test table 操作

```bash
npm run db:test
```

這會執行完整的 CRUD 測試，包括：
1. 檢查資料表是否存在
2. 查詢所有資料
3. 插入新資料
4. 查詢單一資料
5. 更新資料
6. 使用 WHERE 條件查詢
7. 使用 JSONB 查詢
8. 統計資料
9. 交易範例
10. 批次插入
11. 最終統計
12. 連線池狀態

### 3. 刪除 test table

```bash
npm run db:drop-test-table
```

## 💻 程式範例

### 基本查詢

```typescript
import { getDatabase } from './server/database/db.js';

const db = getDatabase();
await db.connect();

// 查詢所有資料
const allTests = await db.queryMany('SELECT * FROM test ORDER BY id');

// 查詢單一資料
const test = await db.queryOne('SELECT * FROM test WHERE id = $1', [1]);

// 使用 WHERE 條件
const activeTests = await db.queryMany(
  'SELECT * FROM test WHERE status = $1',
  ['active']
);
```

### 插入資料

```typescript
const newTest = await db.insert('test', {
  name: '新測試項目',
  description: '這是一個測試項目',
  status: 'active',
  data: JSON.stringify({ priority: 'high', tags: ['test'] })
});

console.log('插入成功:', newTest.id);
```

### 更新資料

```typescript
const updated = await db.update(
  'test',
  { status: 'completed', description: '已完成' },
  { id: 1 }
);

console.log('更新筆數:', updated.length);
```

### 刪除資料

```typescript
const deletedCount = await db.delete('test', { id: 1 });
console.log('刪除筆數:', deletedCount);
```

### JSONB 查詢

```typescript
// 查詢 priority = 'high' 的項目
const highPriority = await db.queryMany(
  "SELECT * FROM test WHERE data->>'priority' = $1",
  ['high']
);

// 查詢包含特定 tag 的項目
const withTag = await db.queryMany(
  "SELECT * FROM test WHERE data @> $1",
  [JSON.stringify({ tags: ['test'] })]
);
```

### 交易處理

```typescript
const result = await db.transaction(async (client) => {
  // 在交易中執行多個操作
  await client.query(
    'INSERT INTO test (name, description) VALUES ($1, $2)',
    ['項目 1', '描述 1']
  );
  
  await client.query(
    'INSERT INTO test (name, description) VALUES ($1, $2)',
    ['項目 2', '描述 2']
  );
  
  return { success: true, count: 2 };
});
```

### 批次插入

```typescript
const testData = [
  { name: '項目 1', status: 'active' },
  { name: '項目 2', status: 'active' },
  { name: '項目 3', status: 'inactive' },
];

const results = await db.batchInsert('test', testData);
console.log('批次插入成功:', results.length);
```

## 📊 使用統計查詢

```typescript
// 統計各狀態的數量
const stats = await db.queryOne(`
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_count
  FROM test
`);

console.log('總計:', stats.total);
console.log('Active:', stats.active_count);
console.log('Inactive:', stats.inactive_count);
```

## 🔍 索引說明

Test table 建立了以下索引以提升查詢效能：

- `idx_test_name`: 在 `name` 欄位上的 B-tree 索引
- `idx_test_status`: 在 `status` 欄位上的 B-tree 索引
- `idx_test_data`: 在 `data` 欄位上的 GIN 索引（用於 JSONB 查詢）

## ⚙️ 觸發器

Test table 有自動更新 `updated_at` 的觸發器：
- 每次執行 UPDATE 時，`updated_at` 會自動更新為當前時間

## 🛠️ 維護操作

### 查看資料表資訊

```sql
-- 查看欄位資訊
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'test';

-- 查看索引
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'test';

-- 查看觸發器
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'test';
```

### 清空資料表

```sql
TRUNCATE TABLE test RESTART IDENTITY;
```

### 重建索引

```sql
REINDEX TABLE test;
```

## 📝 注意事項

1. Test table 主要用於開發和測試
2. 生產環境建議建立專用的資料表
3. JSONB 查詢需要適當的索引支援
4. 批次操作時注意交易處理
5. 定期監控連線池狀態

## 🔗 相關檔案

- `server/database/create-test-table.ts` - 建立/刪除 test table
- `server/database/test-table-operations.ts` - 測試操作範例
- `server/database/init.sql` - 資料庫初始化 SQL（包含 test table）
- `server/database/db.ts` - 資料庫操作核心模組

## 📚 延伸閱讀

- [PostgreSQL JSONB 文件](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostgreSQL 索引類型](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL 觸發器](https://www.postgresql.org/docs/current/trigger-definition.html)
