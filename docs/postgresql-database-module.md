# PostgreSQL 資料庫模組實作完成

## 📦 已建立的檔案

### 1. 配置模組
- **`server/config/database.config.ts`**
  - 資料庫連線配置管理
  - 從環境變數載入配置
  - 配置驗證功能
  - 預設配置

### 2. 資料庫操作核心
- **`server/database/db.ts`**
  - 連線池管理
  - CRUD 操作（INSERT, UPDATE, DELETE, SELECT）
  - 交易處理
  - 批次操作
  - 資料表檢查
  - 連線池狀態監控

### 3. 型別定義
- **`server/database/types.ts`**
  - QueryOptions
  - PaginatedResult
  - BaseEntity
  - DbOperationResult
  - WhereCondition
  - JoinCondition
  - QueryBuilderOptions

### 4. 使用範例
- **`server/database/examples.ts`**
  - 基本查詢範例
  - INSERT/UPDATE/DELETE 範例
  - 交易處理範例
  - 批次插入範例
  - 資料表檢查範例

### 5. 資料庫初始化
- **`server/database/init.sql`**
  - 建立資料表結構
  - 建立索引
  - 建立觸發器（自動更新 updated_at）
  - 插入測試資料

### 6. 說明文件
- **`server/database/README.md`**
  - 完整使用說明
  - 快速開始指南
  - API 文件
  - 範例程式碼

### 7. 模組匯出
- **`server/database/index.ts`**
  - 統一匯出介面
  - 方便其他模組引用

### 8. 環境變數範例
- **`.env.example`** (已更新)
  - 新增 PostgreSQL 相關配置

## 🎯 主要特色

### ✨ 配置分離
- 配置檔案獨立於操作模組
- 支援環境變數
- 支援自訂配置
- 配置驗證機制

### 🔧 完整的 CRUD 操作
```typescript
// CREATE
await db.insert('users', { username: 'john', email: 'john@example.com' });

// READ
const user = await db.queryOne('SELECT * FROM users WHERE id = $1', [1]);
const users = await db.queryMany('SELECT * FROM users');

// UPDATE
await db.update('users', { email: 'new@example.com' }, { id: 1 });

// DELETE
await db.delete('users', { id: 1 });
```

### 🔄 交易支援
```typescript
await db.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
  return { success: true };
});
```

### 📊 連線池管理
- 自動管理連線資源
- 可配置連線池大小
- 連線狀態監控
- 錯誤自動處理

### 🛡️ 安全性
- 參數化查詢（防 SQL 注入）
- SSL 連線支援
- 配置驗證
- 完整錯誤處理

### 📝 詳細日誌
- 連線狀態日誌
- 查詢執行時間
- 交易追蹤
- 錯誤詳情

## 🚀 使用方式

### 1. 基本使用（單例模式）
```typescript
import { getDatabase } from './server/database/index.js';

const db = getDatabase();
await db.connect();

// 執行查詢
const users = await db.queryMany('SELECT * FROM users');

// 使用完畢後關閉
await db.disconnect();
```

### 2. 自訂配置使用
```typescript
import { Database } from './server/database/index.js';

const db = new Database({
  host: 'custom-host',
  port: 5432,
  database: 'my_database',
  user: 'my_user',
  password: 'my_password',
});

await db.connect();
```

### 3. 在 Express 路由中使用
```typescript
import express from 'express';
import { getDatabase } from './server/database/index.js';

const router = express.Router();
const db = getDatabase();

router.get('/users', async (req, res) => {
  try {
    const users = await db.queryMany('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
```

## 📋 設定步驟

### 1. 安裝相依套件
```bash
npm install pg @types/pg
```

### 2. 設定環境變數
在專案根目錄建立 `.env` 檔案：
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spec_driven_dev
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. 初始化資料庫
```bash
# 方式一：使用 psql
psql -U postgres -f server/database/init.sql

# 方式二：透過 psql 互動模式
psql -U postgres
\i server/database/init.sql
```

### 4. 測試連線
```bash
tsx server/database/examples.ts
```

## 🔍 API 文件

### Database 類別

#### `connect(): Promise<void>`
建立資料庫連線

#### `disconnect(): Promise<void>`
關閉資料庫連線

#### `query<T>(text: string, params?: any[]): Promise<QueryResult<T>>`
執行查詢

#### `queryOne<T>(text: string, params?: any[]): Promise<T | null>`
查詢單一結果

#### `queryMany<T>(text: string, params?: any[]): Promise<T[]>`
查詢多筆結果

#### `insert<T>(table: string, data: Record<string, any>): Promise<T>`
插入資料並返回結果

#### `update<T>(table: string, data: Record<string, any>, where: Record<string, any>): Promise<T[]>`
更新資料並返回結果

#### `delete(table: string, where: Record<string, any>): Promise<number>`
刪除資料並返回刪除筆數

#### `transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>`
執行交易

#### `batchInsert<T>(table: string, dataList: Record<string, any>[]): Promise<T[]>`
批次插入

#### `tableExists(tableName: string): Promise<boolean>`
檢查資料表是否存在

#### `getPoolStatus()`
取得連線池狀態

## 📊 資料表結構

預設建立以下資料表：
- `users` - 使用者
- `projects` - 專案
- `mindmaps` - 心智圖
- `trees` - 樹狀圖
- `activity_logs` - 操作日誌

所有資料表都包含：
- 自動遞增的 `id` 主鍵
- UUID 欄位
- 時間戳記（created_at, updated_at, deleted_at）
- 自動更新 updated_at 的觸發器

## 🎓 最佳實踐

1. **使用單例模式** - 透過 `getDatabase()` 取得共用實例
2. **參數化查詢** - 永遠使用 `$1`, `$2` 等參數佔位符
3. **錯誤處理** - 使用 try-catch 包裝資料庫操作
4. **交易處理** - 多個相關操作使用 `transaction()`
5. **連線池監控** - 定期檢查 `getPoolStatus()`
6. **適當關閉** - 應用程式關閉前呼叫 `disconnect()`

## ⚠️ 注意事項

1. 確保 PostgreSQL 服務已啟動
2. 資料庫使用者需要適當權限
3. 生產環境建議啟用 SSL
4. 注意連線池大小設定
5. 定期監控連線狀態

## 🔗 下一步

- [ ] 整合到現有的 Express 伺服器
- [ ] 建立資料存取層（Repository Pattern）
- [ ] 新增資料驗證（使用 Zod）
- [ ] 建立資料庫遷移系統
- [ ] 新增單元測試

## 📝 更新日誌

### 2025-10-08
- ✅ 建立資料庫配置模組
- ✅ 建立資料庫操作核心模組
- ✅ 新增型別定義
- ✅ 建立使用範例
- ✅ 建立資料庫初始化 SQL
- ✅ 完成說明文件
- ✅ 更新環境變數範例

---

**模組已完成並可立即使用！** 🎉
