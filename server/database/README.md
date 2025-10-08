# PostgreSQL 資料庫操作模組

這是一個完整的 PostgreSQL 資料庫操作模組，提供連線池管理、CRUD 操作、交易處理等功能。

## 📁 檔案結構

```
server/
├── config/
│   └── database.config.ts    # 資料庫配置模組
├── database/
│   ├── db.ts                  # 資料庫操作核心模組
│   ├── types.ts               # 型別定義
│   ├── examples.ts            # 使用範例
│   ├── init.sql               # 資料庫初始化 SQL
│   └── README.md              # 說明文件
```

## 🚀 快速開始

### 1. 安裝相依套件

```bash
npm install pg @types/pg
```

### 2. 設定環境變數

複製 `.env.example` 到 `.env` 並修改配置：

```bash
# PostgreSQL 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spec_driven_dev
DB_USER=postgres
DB_PASSWORD=postgres

# 連線池配置
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

### 3. 初始化資料庫

```bash
# 連接到 PostgreSQL
psql -U postgres

# 執行初始化腳本
\i server/database/init.sql
```

或使用命令列：

```bash
psql -U postgres -f server/database/init.sql
```

## 📖 使用方法

### 基本連線

```typescript
import { getDatabase } from './server/database/db.js';

const db = getDatabase();
await db.connect();

// 使用完畢後關閉連線
await db.disconnect();
```

### 查詢操作

```typescript
// 執行查詢
const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);

// 查詢單一結果
const user = await db.queryOne('SELECT * FROM users WHERE id = $1', [1]);

// 查詢多筆結果
const users = await db.queryMany('SELECT * FROM users WHERE active = $1', [true]);
```

### INSERT 操作

```typescript
const newUser = await db.insert('users', {
  username: 'john_doe',
  email: 'john@example.com',
  created_at: new Date(),
});

console.log('新增使用者:', newUser);
```

### UPDATE 操作

```typescript
const updatedUsers = await db.update(
  'users',
  { email: 'newemail@example.com' },  // 要更新的欄位
  { username: 'john_doe' }             // WHERE 條件
);
```

### DELETE 操作

```typescript
const deletedCount = await db.delete('users', { id: 1 });
console.log('刪除的記錄數:', deletedCount);
```

### 交易處理

```typescript
const result = await db.transaction(async (client) => {
  // 在交易中執行多個操作
  await client.query('INSERT INTO accounts (user_id, balance) VALUES ($1, $2)', [1, 1000]);
  await client.query('INSERT INTO transactions (account_id, amount) VALUES ($1, $2)', [1, 1000]);
  
  return { success: true };
});
```

### 批次插入

```typescript
const users = [
  { username: 'user1', email: 'user1@example.com' },
  { username: 'user2', email: 'user2@example.com' },
  { username: 'user3', email: 'user3@example.com' },
];

const insertedUsers = await db.batchInsert('users', users);
```

## 🔧 進階功能

### 檢查資料表是否存在

```typescript
const exists = await db.tableExists('users');
console.log('users 資料表存在:', exists);
```

### 取得連線池狀態

```typescript
const status = db.getPoolStatus();
console.log('連線池狀態:', {
  總連線數: status.totalCount,
  閒置連線: status.idleCount,
  等待連線: status.waitingCount,
});
```

### 自訂配置

```typescript
import { Database } from './server/database/db.js';

const customDb = new Database({
  host: 'custom-host',
  port: 5432,
  database: 'custom_db',
  user: 'custom_user',
  password: 'custom_password',
  max: 10,
  min: 1,
});

await customDb.connect();
```

## 🏗️ 資料表結構

模組提供以下預設資料表：

- **users**: 使用者資料
- **projects**: 專案資料
- **mindmaps**: 心智圖資料
- **trees**: 樹狀圖資料
- **activity_logs**: 操作日誌

詳細結構請參考 `init.sql`。

## 🔒 安全性

1. **參數化查詢**: 所有查詢都使用參數化防止 SQL 注入
2. **連線池管理**: 自動管理連線資源
3. **錯誤處理**: 完整的錯誤捕捉和日誌記錄
4. **SSL 支援**: 生產環境可啟用 SSL 加密連線

## 📊 監控與除錯

模組會自動記錄以下資訊：

- ✅ 連線成功/失敗
- 🔍 查詢執行時間
- 🔄 交易開始/提交/回滾
- ❌ 錯誤詳情（包含 SQL 和參數）

## 🧪 執行範例

```bash
# 執行範例程式
tsx server/database/examples.ts
```

## 📝 注意事項

1. 確保 PostgreSQL 服務已啟動
2. 資料庫和使用者權限設定正確
3. 生產環境建議開啟 SSL 連線
4. 定期監控連線池狀態
5. 適當設定連線池大小

## 🔗 相關資源

- [node-postgres 官方文件](https://node-postgres.com/)
- [PostgreSQL 官方文件](https://www.postgresql.org/docs/)
- [連線池最佳實踐](https://node-postgres.com/features/pooling)

## 📄 授權

MIT License
