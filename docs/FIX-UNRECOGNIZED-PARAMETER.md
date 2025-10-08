# 修復 "unrecognized configuration parameter" 錯誤

## 🔴 錯誤訊息

```
error: unrecognized configuration parameter "lc_collate"
```

## 📋 問題原因

這個錯誤通常發生在以下情況：

1. **PostgreSQL 版本不相容** - 某些參數在特定版本中不被支援
2. **連線字串包含不必要的參數** - 傳遞了資料庫不認識的配置參數
3. **pg 驅動版本問題** - Node.js pg 驅動與 PostgreSQL 版本不匹配

---

## ✅ 已修復的問題

### 修改內容

**檔案**：`server/config/database.config.ts`

**變更前**：
```typescript
ssl: process.env.DB_SSL === 'true' ? {
  rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
} : undefined,
```

**變更後**：
```typescript
// SSL 配置 (生產環境建議開啟)
if (process.env.DB_SSL === 'true') {
  config.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };
}
```

### 修復說明

1. ✅ 移除了可能導致問題的 `undefined` 值
2. ✅ 使用條件式賦值避免傳遞不必要的參數
3. ✅ 確保只傳遞 pg 驅動認識的參數

---

## 🔧 其他可能的解決方案

### 方案 1：檢查 .env 文件中的配置

確保 `.env` 文件不包含不必要的參數：

```bash
# 檢查當前配置
cat .env | grep "^DB_"

# 應該只包含這些參數：
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=1234
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
DB_SSL=false
```

⚠️ **移除任何其他 DB_ 開頭的參數**，例如：
- ❌ `DB_LC_COLLATE`
- ❌ `DB_LC_CTYPE`
- ❌ `DB_TEMPLATE`
- ❌ `DB_ENCODING`

### 方案 2：更新 pg 驅動

```bash
# 更新到最新版本
npm install pg@latest

# 或指定版本
npm install pg@8.11.3
```

### 方案 3：檢查 PostgreSQL 版本

```bash
# 檢查 PostgreSQL 版本
psql --version

# 或連線後查詢
psql postgres
SELECT version();
\q
```

**支援的版本**：
- ✅ PostgreSQL 12+
- ✅ PostgreSQL 13+
- ✅ PostgreSQL 14+ (推薦)
- ✅ PostgreSQL 15+

### 方案 4：簡化資料庫配置

如果問題持續，使用最簡單的配置：

```typescript
// server/config/database.config.ts
export function loadDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
  };
}
```

---

## 🧪 測試連線

### 測試 1：使用 psql 直接連線

```bash
psql -h localhost -p 5432 -U postgres -d postgres

# 如果成功，輸入：
\conninfo
\q
```

### 測試 2：使用 Node.js 測試腳本

建立 `test-db.js`：

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '1234',
});

async function test() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log('✅ 連線成功！');
    console.log('PostgreSQL 版本:', result.rows[0].version);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ 連線失敗:', error.message);
    process.exit(1);
  }
}

test();
```

執行測試：

```bash
node test-db.js
```

---

## 🔍 進階診斷

### 檢查 PostgreSQL 配置文件

```bash
# 找到 postgresql.conf 位置
psql postgres -c "SHOW config_file;"

# 查看配置
cat /path/to/postgresql.conf | grep -E "lc_|encoding"
```

### 檢查資料庫編碼設定

```sql
-- 連線到 PostgreSQL
psql postgres

-- 查看資料庫編碼
\l

-- 查看當前連線設定
SHOW ALL;

-- 查看特定參數
SHOW lc_collate;
SHOW lc_ctype;
```

---

## 📊 常見錯誤與解決方案

### 錯誤 1：lc_collate

```
error: unrecognized configuration parameter "lc_collate"
```

**解決**：不要在連線配置中設定 `lc_collate`，這是建立資料庫時的參數。

### 錯誤 2：encoding

```
error: unrecognized configuration parameter "encoding"
```

**解決**：使用 `client_encoding` 而不是 `encoding`。

### 錯誤 3：template

```
error: unrecognized configuration parameter "template"
```

**解決**：`template` 只能在 CREATE DATABASE 時使用，不能在連線字串中使用。

---

## ✅ 驗證修復

修復後，重新啟動應用程式：

```bash
# 停止當前伺服器（Ctrl+C）

# 重新啟動
npm run dev
```

**成功標誌**：

終端輸出：
```
✅ 資料庫連線成功
📊 資料庫: postgres@localhost:5432
✅ 資料表 projects 建立成功
✅ 資料庫初始化完成
```

瀏覽器 Console：
```
✅ 資料庫初始化成功
📊 載入 0 個專案
```

---

## 📚 相關文件

- `server/config/database.config.ts` - 資料庫配置（已修復）
- `docs/database-config-guide.md` - 資料庫配置完整指南
- `docs/POSTGRESQL-PASSWORD-FIX.md` - 密碼問題修復指南

---

## 🎯 總結

**問題**：PostgreSQL 不認識某些配置參數

**原因**：
1. 傳遞了資料庫建立時的參數（如 lc_collate）
2. 使用了不正確的參數名稱
3. SSL 配置包含 undefined 值

**解決**：
1. ✅ 移除不必要的配置參數
2. ✅ 簡化 SSL 配置邏輯
3. ✅ 只傳遞 pg 驅動認識的參數

**配置來源**：
```
.env 文件
    ↓
server/config/database.config.ts (loadDatabaseConfig)
    ↓
server/database/db.ts (new Pool)
    ↓
PostgreSQL
```

**正確的配置參數**：
- ✅ host, port, database, user, password
- ✅ max, min, idleTimeoutMillis, connectionTimeoutMillis
- ✅ ssl (可選)
- ❌ lc_collate, lc_ctype, encoding, template

修復後應該可以正常連線！🚀
