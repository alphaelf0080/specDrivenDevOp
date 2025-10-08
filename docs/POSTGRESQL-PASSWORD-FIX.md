# ⚠️ PostgreSQL 密碼認證失敗 - 快速修復指南

## 🔴 錯誤訊息

```
password authentication failed for user "postgres"
```

## ✅ 已完成的操作

1. ✅ `.env` 文件已建立（預設密碼: `1234`）
2. ✅ 資料庫配置指南已建立：`docs/database-config-guide.md`
3. ✅ 設定腳本已建立：`scripts/setup-db-config.sh`

---

## 🔧 立即修復步驟

### 步驟 1：確認 PostgreSQL 是否安裝

```bash
# 檢查 PostgreSQL 是否安裝
which psql

# 如果顯示路徑，表示已安裝
# 如果顯示 "command not found"，需要安裝
```

### 步驟 2A：PostgreSQL 未安裝（需要安裝）

**macOS**：

```bash
# 使用 Homebrew 安裝
brew install postgresql@14

# 啟動 PostgreSQL
brew services start postgresql@14

# 設定密碼
psql postgres
ALTER USER postgres WITH PASSWORD '1234';
\q
```

**Linux (Ubuntu/Debian)**：

```bash
# 安裝 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 啟動服務
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 設定密碼
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD '1234';
\q
```

### 步驟 2B：PostgreSQL 已安裝（需要修改密碼）

#### 方法 A：修改 PostgreSQL 密碼為 1234

```bash
# 連線到 PostgreSQL
psql postgres

# 修改密碼
ALTER USER postgres WITH PASSWORD '1234';

# 退出
\q
```

如果無法連線，嘗試無密碼連線：

```bash
# macOS
psql -U postgres -h localhost -d postgres

# 如果成功，執行：
ALTER USER postgres WITH PASSWORD '1234';
\q
```

#### 方法 B：修改 .env 文件以匹配實際密碼

```bash
# 編輯 .env 文件
nano .env

# 修改這一行（使用您的實際密碼）：
DB_PASSWORD=您的實際密碼

# 儲存並退出（Ctrl+X，然後 Y，然後 Enter）
```

### 步驟 3：測試連線

```bash
# 使用 .env 中的配置測試連線
psql -U postgres -h localhost -d postgres

# 如果成功，您會看到 postgres=# 提示符
# 輸入 \q 退出
```

### 步驟 4：重新啟動應用程式

```bash
# 停止當前運行的伺服器（如果有）
# 按 Ctrl+C

# 重新啟動
npm run dev

# 檢查終端輸出，應該看到：
# ✅ 資料庫初始化完成
```

---

## 🔍 診斷問題

### 檢查 PostgreSQL 狀態

**macOS**：

```bash
# 檢查 PostgreSQL 服務狀態
brew services list | grep postgresql

# 應該顯示類似：
# postgresql@14 started ...
```

**Linux**：

```bash
# 檢查服務狀態
sudo systemctl status postgresql

# 應該顯示 "active (running)"
```

### 查看當前使用的密碼

```bash
# 查看 .env 文件中的配置
cat .env | grep DB_PASSWORD

# 應該顯示：
# DB_PASSWORD=1234
```

---

## 📊 常見情況與解決方案

### 情況 1：PostgreSQL 未安裝

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Linux
sudo apt install postgresql
sudo systemctl start postgresql
```

### 情況 2：PostgreSQL 未啟動

```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### 情況 3：密碼不匹配

**選項 A**：修改 PostgreSQL 密碼

```bash
psql postgres
ALTER USER postgres WITH PASSWORD '1234';
\q
```

**選項 B**：修改 .env 文件

```bash
# 編輯 .env，將 DB_PASSWORD 改為實際密碼
nano .env
```

### 情況 4：資料庫不存在

```bash
# 建立資料庫
psql -U postgres -h localhost
CREATE DATABASE spec_driven_dev;
\q

# 或使用 createdb 命令
createdb -U postgres spec_driven_dev
```

---

## 🎯 推薦的修復流程

### 最簡單的方法（推薦）

```bash
# 1. 確保 PostgreSQL 正在運行
brew services start postgresql@14

# 2. 重設 PostgreSQL 密碼為 1234
psql postgres -c "ALTER USER postgres WITH PASSWORD '1234';"

# 3. 測試連線
psql -U postgres -h localhost -d postgres -c "SELECT 1;"

# 4. 重新啟動應用程式
npm run dev
```

如果步驟 2 要求輸入密碼而您不知道：

```bash
# macOS - 使用本地連線（不需密碼）
psql postgres

# 在 psql 提示符中執行：
ALTER USER postgres WITH PASSWORD '1234';
\q
```

---

## 📚 相關文件

- `docs/database-config-guide.md` - 完整的資料庫配置指南
- `docs/db-init-guide.md` - 資料庫初始化指南
- `.env` - 環境變數配置文件（已建立）
- `scripts/setup-db-config.sh` - 互動式設定腳本

---

## 🆘 仍然無法解決？

### 選項 1：使用設定腳本

```bash
chmod +x scripts/setup-db-config.sh
./scripts/setup-db-config.sh
```

### 選項 2：手動建立資料庫並設定密碼

```bash
# 1. 以超級使用者身份連線（macOS 通常不需密碼）
psql postgres

# 2. 在 psql 中執行以下命令：
ALTER USER postgres WITH PASSWORD '1234';
CREATE DATABASE spec_driven_dev;
\q

# 3. 確認 .env 文件存在且配置正確
cat .env

# 4. 重新啟動應用程式
npm run dev
```

### 選項 3：使用替代的資料庫配置

如果您的 PostgreSQL 使用不同的配置，編輯 `.env` 文件：

```bash
# 編輯 .env
nano .env

# 修改為您的實際配置：
DB_HOST=您的主機
DB_PORT=您的連接埠
DB_NAME=您的資料庫名稱
DB_USER=您的使用者名稱
DB_PASSWORD=您的密碼
```

---

## ✅ 成功標誌

重新啟動應用程式後，您應該在終端看到：

```
✅ 資料庫連線成功
✅ 資料表 projects 建立成功
✅ 資料庫初始化完成
📊 載入 0 個專案
```

在瀏覽器 Console 中看到：

```
✅ 資料庫初始化成功
📊 載入 0 個專案
✅ 資料庫初始化完成
```

---

## 🎉 完成後

資料庫連線成功後，系統會：

1. ✅ 自動檢查 `projects` 表是否存在
2. ✅ 如果不存在，自動建立表（從 `table.config.ts` 讀取結構）
3. ✅ 建立索引和觸發器
4. ✅ 載入 projects 資料
5. ✅ 在首頁顯示專案列表

**祝您順利！** 🚀
