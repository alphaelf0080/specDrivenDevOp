# PostgreSQL 資料庫配置指南

## 📋 概述

PostgreSQL 登入資訊（IP、使用者、密碼、連接埠等）由 `server/config/database.config.ts` 檔案管理。

---

## 🔧 配置來源

### 配置文件位置

```
server/config/database.config.ts
```

### 配置讀取流程

```
1. 讀取 .env 文件（環境變數）
   ↓
2. database.config.ts 載入環境變數
   ↓
3. 如果環境變數不存在，使用預設值
   ↓
4. 建立資料庫連線
```

---

## 📝 配置參數

### 必要參數

| 參數 | 環境變數 | 預設值 | 說明 |
|------|---------|--------|------|
| **host** | `DB_HOST` | `localhost` | PostgreSQL 伺服器 IP 或主機名稱 |
| **port** | `DB_PORT` | `5432` | PostgreSQL 連接埠 |
| **database** | `DB_NAME` | `postgres` | 資料庫名稱 |
| **user** | `DB_USER` | `postgres` | 資料庫使用者名稱 |
| **password** | `DB_PASSWORD` | `1234` | 資料庫密碼 |

### 連線池參數

| 參數 | 環境變數 | 預設值 | 說明 |
|------|---------|--------|------|
| **max** | `DB_POOL_MAX` | `20` | 最大連線數 |
| **min** | `DB_POOL_MIN` | `2` | 最小連線數 |
| **idleTimeoutMillis** | `DB_IDLE_TIMEOUT` | `30000` | 閒置超時（毫秒）|
| **connectionTimeoutMillis** | `DB_CONNECTION_TIMEOUT` | `2000` | 連線超時（毫秒）|

### SSL 參數

| 參數 | 環境變數 | 預設值 | 說明 |
|------|---------|--------|------|
| **ssl** | `DB_SSL` | `false` | 是否啟用 SSL |
| **rejectUnauthorized** | `DB_SSL_REJECT_UNAUTHORIZED` | `true` | 是否拒絕未授權的連線 |

---

## 🚀 使用方式

### 方法 1：使用 .env 文件（推薦）

#### 步驟 1：建立 .env 文件

在專案根目錄建立 `.env` 文件：

```bash
# 在專案根目錄執行
cp .env.example .env
```

#### 步驟 2：修改資料庫配置

編輯 `.env` 文件：

```bash
# PostgreSQL 資料庫配置
DB_HOST=localhost          # 修改為您的 PostgreSQL IP
DB_PORT=5432              # 修改為您的 PostgreSQL 連接埠
DB_NAME=postgres          # 修改為您的資料庫名稱
DB_USER=postgres          # 修改為您的資料庫使用者
DB_PASSWORD=1234          # ⚠️ 修改為您的實際密碼
```

#### 步驟 3：重新啟動伺服器

```bash
# 停止當前伺服器（Ctrl+C）
# 重新啟動
npm run dev
```

---

### 方法 2：修改預設值（不推薦）

直接修改 `server/config/database.config.ts` 中的 `defaultDatabaseConfig`：

```typescript
export const defaultDatabaseConfig: DatabaseConfig = {
  host: 'localhost',        // 修改這裡
  port: 5432,              // 修改這裡
  database: 'postgres',    // 修改這裡
  user: 'postgres',        // 修改這裡
  password: '1234',        // 修改這裡
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

⚠️ **不推薦**：因為會將密碼寫入程式碼，不安全且不便於版本控制。

---

## 🔍 配置檔案說明

### server/config/database.config.ts

```typescript
/**
 * 從環境變數載入資料庫配置
 */
export function loadDatabaseConfig(): DatabaseConfig {
  return {
    // 從環境變數讀取，如果不存在則使用預設值
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    
    // 連線池配置
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
    
    // SSL 配置
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : undefined,
  };
}
```

**讀取順序**：
1. 先讀取環境變數（.env 文件）
2. 如果環境變數不存在，使用 `||` 後面的預設值
3. 例如：`process.env.DB_HOST || 'localhost'`
   - 如果 `.env` 有設定 `DB_HOST`，使用該值
   - 如果沒有設定，使用 `localhost`

---

## 🔐 常見密碼錯誤解決方式

### 錯誤訊息

```
password authentication failed for user "postgres"
```

### 解決步驟

#### 1. 檢查 PostgreSQL 密碼

```bash
# 連線到 PostgreSQL（會要求輸入密碼）
psql -U postgres -h localhost

# 如果成功，記住這個密碼
# 如果失敗，需要重設密碼
```

#### 2. 重設 PostgreSQL 密碼（如果需要）

**macOS（使用 Homebrew）**：

```bash
# 方法 A：使用 psql
psql postgres
ALTER USER postgres WITH PASSWORD '1234';
\q

# 方法 B：重新初始化（會清空資料！）
rm -rf /opt/homebrew/var/postgresql@14
initdb /opt/homebrew/var/postgresql@14
```

**Linux**：

```bash
# 切換到 postgres 使用者
sudo -u postgres psql

# 重設密碼
ALTER USER postgres WITH PASSWORD '1234';
\q
```

**Windows**：

```cmd
# 以管理員身份開啟 psql
psql -U postgres

# 重設密碼
ALTER USER postgres WITH PASSWORD '1234';
\q
```

#### 3. 更新 .env 文件

```bash
# 編輯 .env 文件
DB_PASSWORD=你的實際密碼
```

#### 4. 重新啟動伺服器

```bash
npm run dev
```

---

## 🧪 測試資料庫連線

### 測試指令

```bash
# 測試 PostgreSQL 是否正在運行
psql -U postgres -h localhost -c "SELECT version();"

# 如果成功，會顯示 PostgreSQL 版本
# 如果失敗，檢查：
# 1. PostgreSQL 是否已啟動
# 2. 密碼是否正確
# 3. 使用者是否存在
```

### PostgreSQL 啟動狀態檢查

**macOS（Homebrew）**：

```bash
# 檢查狀態
brew services list | grep postgresql

# 啟動 PostgreSQL
brew services start postgresql@14

# 停止 PostgreSQL
brew services stop postgresql@14

# 重新啟動
brew services restart postgresql@14
```

**Linux**：

```bash
# 檢查狀態
sudo systemctl status postgresql

# 啟動
sudo systemctl start postgresql

# 停止
sudo systemctl stop postgresql

# 重新啟動
sudo systemctl restart postgresql
```

**Windows**：

```cmd
# 檢查服務
services.msc

# 尋找 "PostgreSQL" 服務
# 確認狀態為 "執行中"
```

---

## 📊 配置範例

### 開發環境（本機）

```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spec_driven_dev
DB_USER=postgres
DB_PASSWORD=1234
DB_POOL_MAX=10
DB_SSL=false
```

### 測試環境

```bash
# .env.test
DB_HOST=test-db.example.com
DB_PORT=5432
DB_NAME=spec_driven_dev_test
DB_USER=test_user
DB_PASSWORD=test_password
DB_POOL_MAX=5
DB_SSL=true
```

### 生產環境

```bash
# .env.production
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_NAME=spec_driven_dev_prod
DB_USER=prod_user
DB_PASSWORD=強密碼請使用密碼管理工具
DB_POOL_MAX=50
DB_POOL_MIN=5
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

---

## 🔒 安全建議

### 1. 不要提交 .env 文件到 Git

`.gitignore` 應該包含：

```gitignore
# 環境變數
.env
.env.local
.env.*.local
```

### 2. 使用強密碼

```bash
# 生成隨機密碼
openssl rand -base64 32

# 範例輸出：
# 8xK3jD9mL2pQ7vR1wS5yT6uA4bC0eF8gH
```

### 3. 定期更換密碼

```sql
-- 每 3-6 個月更換一次
ALTER USER postgres WITH PASSWORD '新密碼';
```

### 4. 使用環境變數管理工具

```bash
# 安裝 dotenv-cli
npm install -g dotenv-cli

# 使用特定環境變數文件啟動
dotenv -e .env.production npm start
```

---

## 🐛 常見問題排查

### 問題 1：連線超時

```
Error: timeout
```

**解決方式**：
1. 檢查 PostgreSQL 是否在運行
2. 檢查防火牆設定
3. 增加 `DB_CONNECTION_TIMEOUT`

```bash
# .env
DB_CONNECTION_TIMEOUT=10000  # 增加到 10 秒
```

### 問題 2：連線數不足

```
Error: too many clients
```

**解決方式**：
1. 減少 `DB_POOL_MAX`
2. 或增加 PostgreSQL 的 `max_connections`

```sql
-- 檢查當前最大連線數
SHOW max_connections;

-- 修改最大連線數（需要重啟）
ALTER SYSTEM SET max_connections = 200;
```

### 問題 3：資料庫不存在

```
Error: database "spec_driven_dev" does not exist
```

**解決方式**：

```bash
# 建立資料庫
psql -U postgres -h localhost
CREATE DATABASE spec_driven_dev;
\q
```

### 問題 4：使用者不存在

```
Error: role "myuser" does not exist
```

**解決方式**：

```sql
-- 建立使用者
CREATE USER myuser WITH PASSWORD 'mypassword';

-- 授予權限
GRANT ALL PRIVILEGES ON DATABASE spec_driven_dev TO myuser;
```

---

## 📚 相關檔案

- `server/config/database.config.ts` - **資料庫配置管理**（本文件說明的主角）
- `.env` - 環境變數配置文件（需手動建立）
- `.env.example` - 環境變數範例文件
- `server/database/db.ts` - 資料庫連線管理
- `server/database/db-init.ts` - 資料庫初始化

---

## 🎯 快速設定步驟

### 完整步驟

```bash
# 1. 複製環境變數範例
cp .env.example .env

# 2. 編輯 .env 文件，修改資料庫密碼
# DB_PASSWORD=你的實際密碼

# 3. 確認 PostgreSQL 正在運行
brew services list | grep postgresql
# 或
sudo systemctl status postgresql

# 4. 測試連線
psql -U postgres -h localhost -c "SELECT 1;"

# 5. 建立資料庫（如果不存在）
psql -U postgres -h localhost
CREATE DATABASE spec_driven_dev;
\q

# 6. 啟動應用程式
npm run dev

# 7. 檢查瀏覽器 Console，應該看到：
# ✅ 資料庫初始化完成
```

---

## 🎉 總結

**PostgreSQL 登入資訊由以下方式管理**：

```
.env 文件（環境變數）
    ↓
server/config/database.config.ts（配置管理）
    ↓
loadDatabaseConfig()（讀取配置）
    ↓
server/database/db.ts（建立連線）
    ↓
PostgreSQL 資料庫
```

**關鍵配置參數**：
- ✅ **IP/Host**: `DB_HOST` (預設: `localhost`)
- ✅ **Port**: `DB_PORT` (預設: `5432`)
- ✅ **Database**: `DB_NAME` (預設: `postgres`)
- ✅ **User**: `DB_USER` (預設: `postgres`)
- ✅ **Password**: `DB_PASSWORD` (預設: `1234`)

**⚠️ 重要**：請確保 `.env` 文件中的 `DB_PASSWORD` 與您的 PostgreSQL 密碼一致！
