# PostgreSQL 17 安裝完成 ✅

## 📦 安裝資訊

**安裝日期**：2025年10月8日  
**安裝方式**：Homebrew  
**版本**：PostgreSQL 17.6 (Homebrew)  
**狀態**：✅ 已安裝並運行

---

## ✅ 安裝驗證

### 1. 版本檢查
```bash
$ psql --version
psql (PostgreSQL) 17.6 (Homebrew)
```

### 2. 服務狀態
```bash
$ brew services list | grep postgres
postgresql@17 started alpha ~/Library/LaunchAgents/homebrew.mxcl.postgresql@17.plist
```

### 3. 進程檢查
```bash
$ ps aux | grep "postgres -D" | grep -v grep
alpha  36002  /usr/local/opt/postgresql@17/bin/postgres -D /usr/local/var/postgresql@17
```

### 4. 連線測試
```bash
$ psql -U postgres -h localhost -d postgres -c "SELECT version();"
PostgreSQL 17.6 (Homebrew) on x86_64-apple-darwin23.6.0
```

---

## 📊 安裝詳情

### 安裝位置

| 項目 | 路徑 |
|------|------|
| **執行檔** | `/usr/local/opt/postgresql@17/bin/` |
| **資料目錄** | `/usr/local/var/postgresql@17` |
| **配置檔** | `/usr/local/var/postgresql@17/postgresql.conf` |
| **日誌** | `/usr/local/var/postgresql@17/log/` |
| **Cellar** | `/usr/local/Cellar/postgresql@17/17.6/` |

### 依賴套件

已安裝的依賴：
- ✅ icu4c@77 (77.1) - Unicode 支援
- ✅ ca-certificates (2025-09-09) - SSL 憑證
- ✅ openssl@3 (3.6.0) - SSL/TLS 加密
- ✅ krb5 (1.22.1) - Kerberos 認證
- ✅ lz4 (1.10.0) - 壓縮函式庫
- ✅ readline (8.3.1) - 命令列編輯
- ✅ xz (5.8.1) - LZMA 壓縮
- ✅ zstd (1.5.7) - Zstandard 壓縮
- ✅ libunistring (1.4.1) - Unicode 字串處理
- ✅ gettext (0.26) - 國際化支援

總安裝大小：**約 200+ MB**

---

## 🔧 配置資訊

### 環境變數

已配置在 `~/.zshrc`：
```bash
export PATH="/usr/local/opt/postgresql@17/bin:$PATH"
```

⚠️ **重要**：新的終端 session 會自動載入此設定。

### 資料庫使用者

| 使用者 | 角色 | 密碼 |
|--------|------|------|
| **alpha** | Superuser | 1234 |
| **postgres** | Superuser | 1234 |

### .env 配置（相容）

您的專案 `.env` 檔案配置：
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=1234
```

✅ **完全相容**：密碼已設定為 `1234`，可直接使用。

---

## 🚀 服務管理

### 啟動服務

```bash
# 啟動並設定開機自動啟動
brew services start postgresql@17

# 或手動啟動（不開機自動啟動）
pg_ctl -D /usr/local/var/postgresql@17 start
```

### 停止服務

```bash
# 停止服務
brew services stop postgresql@17

# 或手動停止
pg_ctl -D /usr/local/var/postgresql@17 stop
```

### 重新啟動服務

```bash
# 重新啟動
brew services restart postgresql@17

# 或手動重新啟動
pg_ctl -D /usr/local/var/postgresql@17 restart
```

### 查看狀態

```bash
# Homebrew 服務狀態
brew services list

# PostgreSQL 狀態
pg_ctl -D /usr/local/var/postgresql@17 status
```

---

## 📝 常用命令

### 連線資料庫

```bash
# 使用當前使用者連線
psql postgres

# 使用 postgres 使用者連線
psql -U postgres -h localhost -d postgres

# 指定密碼連線（會提示輸入密碼）
psql -U postgres -h localhost -d postgres -W
```

### 資料庫管理

```bash
# 列出所有資料庫
psql postgres -c "\l"

# 列出所有使用者
psql postgres -c "\du"

# 建立新資料庫
createdb mydatabase

# 刪除資料庫
dropdb mydatabase

# 備份資料庫
pg_dump -U postgres mydatabase > backup.sql

# 還原資料庫
psql -U postgres mydatabase < backup.sql
```

### psql 內部命令

```sql
-- 列出所有資料庫
\l

-- 連線到資料庫
\c database_name

-- 列出所有資料表
\dt

-- 描述資料表結構
\d table_name

-- 列出所有使用者
\du

-- 查看當前連線資訊
\conninfo

-- 執行 SQL 檔案
\i /path/to/file.sql

-- 離開 psql
\q
```

---

## 🔐 密碼管理

### 修改密碼

```bash
# 方法 1：使用 psql
psql postgres -c "ALTER USER postgres WITH PASSWORD 'new_password';"

# 方法 2：進入 psql 互動模式
psql postgres
ALTER USER postgres WITH PASSWORD 'new_password';
\q
```

### .pgpass 檔案（免密碼登入）

建立 `~/.pgpass` 檔案：
```
localhost:5432:*:postgres:1234
```

設定權限：
```bash
chmod 600 ~/.pgpass
```

之後連線時不需要輸入密碼：
```bash
psql -U postgres -h localhost -d postgres
```

---

## 🧪 測試應用程式連線

### 步驟 1：啟動應用程式

```bash
npm run dev
```

### 步驟 2：檢查資料庫初始化

應用程式會自動：
1. ✅ 檢查 `projects` 表是否存在
2. ✅ 如果不存在，自動建立
3. ✅ 載入初始資料

### 步驟 3：驗證資料表

```bash
# 連線到資料庫
psql -U postgres -h localhost -d postgres

# 列出所有資料表
\dt

# 查看 projects 表結構
\d projects

# 查看資料
SELECT * FROM projects LIMIT 5;

# 離開
\q
```

---

## 🔄 與 pgAdmin4 整合

### 建立伺服器連線

在 pgAdmin4 中：

1. **右鍵點擊「Servers」** → Register → Server

2. **General 標籤**：
   - Name: `Local PostgreSQL 17`

3. **Connection 標籤**：
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: `1234`
   - ✅ 勾選「Save password?」

4. **Advanced 標籤**：
   - ⚠️ **留空所有欄位**（重要！避免參數錯誤）

5. **點擊「Save」**

### 查看應用程式資料表

連線成功後，導航至：
```
Servers
  └─ Local PostgreSQL 17
      └─ Databases
          └─ postgres
              └─ Schemas
                  └─ public
                      └─ Tables
                          └─ projects
```

---

## 📚 配置檔案

### postgresql.conf

主要配置檔案位置：
```
/usr/local/var/postgresql@17/postgresql.conf
```

常用設定：
```conf
# 連線設定
max_connections = 100
listen_addresses = 'localhost'
port = 5432

# 記憶體設定
shared_buffers = 128MB
effective_cache_size = 4GB

# 日誌設定
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
```

修改後重新啟動：
```bash
brew services restart postgresql@17
```

### pg_hba.conf

認證配置檔案：
```
/usr/local/var/postgresql@17/pg_hba.conf
```

預設設定（本機信任）：
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```

如需密碼驗證，改為：
```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

---

## 🔧 升級與維護

### 升級 PostgreSQL

```bash
# 更新 Homebrew
brew update

# 升級 PostgreSQL 17
brew upgrade postgresql@17

# 重新啟動服務
brew services restart postgresql@17
```

### 備份資料

```bash
# 備份所有資料庫
pg_dumpall -U postgres > ~/postgres_backup_$(date +%Y%m%d).sql

# 備份單一資料庫
pg_dump -U postgres -d postgres > ~/postgres_db_backup.sql
```

### 清理日誌

```bash
# 查看日誌大小
du -sh /usr/local/var/postgresql@17/log

# 刪除舊日誌（保留最近 7 天）
find /usr/local/var/postgresql@17/log -name "*.log" -mtime +7 -delete
```

### 真空清理（VACUUM）

```bash
# 完整真空清理
psql postgres -c "VACUUM FULL;"

# 分析統計資料
psql postgres -c "ANALYZE;"
```

---

## 🆘 問題排查

### 問題 1：無法連線

**錯誤訊息**：
```
psql: could not connect to server
```

**解決方案**：
```bash
# 檢查服務是否運行
brew services list | grep postgres

# 如果沒有運行，啟動服務
brew services start postgresql@17

# 檢查進程
ps aux | grep postgres
```

### 問題 2：密碼錯誤

**錯誤訊息**：
```
password authentication failed for user "postgres"
```

**解決方案**：
```bash
# 重設密碼
psql postgres -c "ALTER USER postgres WITH PASSWORD '1234';"

# 或檢查 .env 檔案密碼是否正確
cat .env | grep DB_PASSWORD
```

### 問題 3：port 被占用

**錯誤訊息**：
```
could not bind IPv4 address "127.0.0.1": Address already in use
```

**解決方案**：
```bash
# 查看哪個進程占用 5432 port
lsof -i :5432

# 終止該進程
kill -9 <PID>

# 重新啟動 PostgreSQL
brew services restart postgresql@17
```

### 問題 4：資料目錄損壞

**解決方案**：
```bash
# 停止服務
brew services stop postgresql@17

# 備份資料（如果可以）
cp -r /usr/local/var/postgresql@17 /usr/local/var/postgresql@17.backup

# 重新初始化
rm -rf /usr/local/var/postgresql@17
initdb -D /usr/local/var/postgresql@17

# 啟動服務
brew services start postgresql@17

# 還原資料（如果有備份）
psql postgres < backup.sql
```

---

## 📋 與專案整合清單

### ✅ 已完成項目

- [x] PostgreSQL 17.6 安裝完成
- [x] 服務已啟動並設定開機自動啟動
- [x] PATH 環境變數已配置
- [x] postgres 使用者已建立，密碼設為 1234
- [x] 與 .env 配置完全相容
- [x] 資料庫連線測試成功

### 📝 待執行項目

- [ ] 啟動應用程式（`npm run dev`）
- [ ] 驗證 projects 表自動建立
- [ ] 在 pgAdmin4 中建立連線
- [ ] 測試應用程式的資料庫操作
- [ ] 檢視資料是否正確載入

---

## 🎯 下一步行動

### 1. 測試應用程式

```bash
# 啟動開發伺服器
npm run dev

# 開啟瀏覽器
# http://localhost:5173 (或您的 Vite 配置的 port)
```

### 2. 驗證資料庫

```bash
# 連線到資料庫
psql -U postgres -h localhost -d postgres

# 檢查 projects 表
\dt
\d projects
SELECT COUNT(*) FROM projects;
\q
```

### 3. 配置 pgAdmin4

按照上述「與 pgAdmin4 整合」章節的步驟配置。

### 4. 開始開發

您的資料庫現在已完全就緒！可以開始：
- ✅ 建立新的資料表
- ✅ 執行 SQL 查詢
- ✅ 測試應用程式功能
- ✅ 開發新功能

---

## 📚 相關文件

- **資料庫配置指南**：`docs/database-config-guide.md`
- **Table Config 架構**：`docs/table-config-architecture.md`
- **pgAdmin4 設定指南**：`docs/PGADMIN4-SETUP-COMPLETE.md`
- **解除安裝指南**：`docs/UNINSTALL-POSTGRESQL.md`
- **PostgreSQL 官方文件**：https://www.postgresql.org/docs/17/

---

## 🎉 總結

**PostgreSQL 17 安裝完成！**

✅ **版本**：PostgreSQL 17.6 (Homebrew)  
✅ **狀態**：已啟動並運行  
✅ **連線**：localhost:5432  
✅ **使用者**：postgres (密碼: 1234)  
✅ **整合**：與專案 .env 完全相容  

您現在可以：
1. 啟動應用程式進行測試
2. 使用 pgAdmin4 視覺化管理資料庫
3. 開始開發新功能

**祝開發順利！** 🚀

---

*安裝日期：2025年10月8日*  
*安裝方式：Homebrew*  
*文件版本：1.0*
