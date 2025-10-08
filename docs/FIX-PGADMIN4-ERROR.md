# 修復 pgAdmin4 "unrecognized configuration parameter" 錯誤

## 🔴 問題描述

在 pgAdmin4 中開啟資料庫內容時出現錯誤：

```
unrecognized configuration parameter "lc_collate"
```

---

## 📋 問題原因

這個錯誤通常由以下原因引起：

1. **pgAdmin4 版本與 PostgreSQL 版本不相容**
2. **pgAdmin4 使用了錯誤的連線參數**
3. **資料庫 URL 或連線字串包含不支援的參數**
4. **PostgreSQL 配置問題**

---

## ✅ 解決方案

### 方案 1：更新 pgAdmin4（推薦）

#### macOS

```bash
# 使用 Homebrew 更新
brew upgrade --cask pgadmin4

# 或重新安裝
brew uninstall --cask pgadmin4
brew install --cask pgadmin4
```

#### Windows

1. 下載最新版本：https://www.pgadmin.org/download/
2. 解除安裝舊版本
3. 安裝新版本

#### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt upgrade pgadmin4

# 或使用官方 apt repository
curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo apt-key add
sudo sh -c 'echo "deb https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'
sudo apt update
sudo apt install pgadmin4
```

---

### 方案 2：修改 pgAdmin4 連線設定

#### 步驟 1：開啟 pgAdmin4

1. 啟動 pgAdmin4
2. 右鍵點擊您的伺服器連線
3. 選擇「Properties」（屬性）

#### 步驟 2：修改連線參數

在「Connection」（連線）標籤中：

- **Host**: `localhost`
- **Port**: `5432`
- **Maintenance database**: `postgres`
- **Username**: `postgres`
- **Password**: 您的密碼

#### 步驟 3：檢查進階設定

切換到「Advanced」（進階）標籤：

1. 清空「DB restriction」欄位
2. 清空「Connection parameters」欄位
3. 確保沒有設定 `lc_collate` 或類似參數

#### 步驟 4：儲存並重新連線

1. 點擊「Save」（儲存）
2. 右鍵點擊伺服器
3. 選擇「Disconnect」（斷線）
4. 再次右鍵點擊
5. 選擇「Connect Server」（連線伺服器）

---

### 方案 3：檢查 PostgreSQL 版本相容性

#### 檢查版本

```bash
# 檢查 PostgreSQL 版本
psql --version

# 或連線後查詢
psql postgres
SELECT version();
\q
```

#### 版本相容性

| pgAdmin4 版本 | PostgreSQL 版本 |
|--------------|----------------|
| 6.x | 10, 11, 12, 13, 14, 15 |
| 7.x | 11, 12, 13, 14, 15, 16 |
| 8.x | 12, 13, 14, 15, 16 |

如果版本不相容，請更新 pgAdmin4 或 PostgreSQL。

---

### 方案 4：重新建立伺服器連線

#### 步驟 1：移除現有連線

1. 在 pgAdmin4 左側樹狀結構中
2. 右鍵點擊有問題的伺服器
3. 選擇「Remove Server」（移除伺服器）

#### 步驟 2：新增伺服器連線

1. 右鍵點擊「Servers」
2. 選擇「Create」→「Server」（建立 → 伺服器）

#### 步驟 3：設定連線資訊

**General 標籤**：
- **Name**: `Local PostgreSQL`（或任何名稱）

**Connection 標籤**：
- **Host name/address**: `localhost`
- **Port**: `5432`
- **Maintenance database**: `postgres`
- **Username**: `postgres`
- **Password**: 您的密碼
- ✅ 勾選「Save password」（儲存密碼）

**Advanced 標籤**：
- 留空所有欄位（不要設定任何參數）

#### 步驟 4：測試連線

點擊「Save」，pgAdmin4 會自動嘗試連線。

---

### 方案 5：修改 pgAdmin4 配置文件

#### macOS

```bash
# 編輯配置文件
nano ~/Library/Application\ Support/pgAdmin\ 4/pgadmin4.db

# 或刪除配置並重新設定
rm -rf ~/Library/Application\ Support/pgAdmin\ 4/
```

#### Windows

```cmd
# 配置文件位置
%APPDATA%\pgAdmin\pgadmin4.db

# 刪除配置並重新設定
del %APPDATA%\pgAdmin\pgadmin4.db
```

#### Linux

```bash
# 編輯配置文件
nano ~/.pgadmin/pgadmin4.db

# 或刪除配置並重新設定
rm -rf ~/.pgadmin/
```

⚠️ **注意**：刪除配置會移除所有已儲存的伺服器連線，需要重新設定。

---

### 方案 6：使用替代工具

如果 pgAdmin4 問題持續，可以使用替代的資料庫管理工具：

#### DBeaver（推薦）

```bash
# macOS
brew install --cask dbeaver-community

# Linux
sudo snap install dbeaver-ce

# Windows
# 下載：https://dbeaver.io/download/
```

#### TablePlus

```bash
# macOS
brew install --cask tableplus

# Windows/Linux
# 下載：https://tableplus.com/
```

#### psql（命令列）

```bash
# 直接使用 psql 連線
psql -U postgres -h localhost -d postgres

# 列出所有資料庫
\l

# 連線到特定資料庫
\c your_database

# 列出資料表
\dt

# 查詢資料
SELECT * FROM your_table;

# 退出
\q
```

---

## 🔍 診斷步驟

### 步驟 1：檢查 PostgreSQL 是否正常運行

```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# 測試連線
psql -U postgres -h localhost -d postgres -c "SELECT 1;"
```

### 步驟 2：檢查 pgAdmin4 日誌

#### macOS

```bash
# 查看日誌
tail -f ~/Library/Application\ Support/pgAdmin\ 4/pgadmin4.log
```

#### Windows

```cmd
# 日誌位置
%APPDATA%\pgAdmin\pgadmin4.log
```

#### Linux

```bash
# 查看日誌
tail -f ~/.pgadmin/pgadmin4.log
```

### 步驟 3：測試直接連線

```bash
# 使用 psql 測試
psql -U postgres -h localhost -d postgres

# 如果成功，問題出在 pgAdmin4
# 如果失敗，問題出在 PostgreSQL 配置
```

---

## 🛠️ 進階修復

### 修復 1：重設 PostgreSQL 配置

```bash
# 找到 postgresql.conf
psql postgres -c "SHOW config_file;"

# 備份配置文件
sudo cp /path/to/postgresql.conf /path/to/postgresql.conf.backup

# 編輯配置（移除可能有問題的設定）
sudo nano /path/to/postgresql.conf

# 重新啟動 PostgreSQL
# macOS
brew services restart postgresql@14

# Linux
sudo systemctl restart postgresql
```

### 修復 2：重新初始化 PostgreSQL（⚠️ 會清空所有資料）

```bash
# macOS
brew services stop postgresql@14
rm -rf /opt/homebrew/var/postgresql@14
initdb /opt/homebrew/var/postgresql@14
brew services start postgresql@14

# 重設密碼
psql postgres
ALTER USER postgres WITH PASSWORD '1234';
\q
```

---

## 📊 常見錯誤對照表

| 錯誤訊息 | 原因 | 解決方案 |
|---------|------|---------|
| `unrecognized configuration parameter "lc_collate"` | pgAdmin4 版本過舊 | 更新 pgAdmin4 |
| `unrecognized configuration parameter "lc_ctype"` | 連線參數錯誤 | 清空進階設定 |
| `unrecognized configuration parameter "encoding"` | 使用錯誤的參數名 | 使用 `client_encoding` |
| `connection refused` | PostgreSQL 未啟動 | 啟動 PostgreSQL 服務 |
| `authentication failed` | 密碼錯誤 | 重設密碼 |

---

## ✅ 驗證修復

修復後，在 pgAdmin4 中：

1. ✅ 可以成功連線到 PostgreSQL 伺服器
2. ✅ 可以展開資料庫列表
3. ✅ 可以查看資料表內容
4. ✅ 可以執行 SQL 查詢
5. ✅ 沒有錯誤訊息

---

## 🎯 推薦的修復順序

```
1. 更新 pgAdmin4 到最新版本
   ↓
2. 如果仍有問題，重新建立伺服器連線
   ↓
3. 如果還是不行，檢查 PostgreSQL 版本相容性
   ↓
4. 如果都不行，使用替代工具（DBeaver, TablePlus）
   ↓
5. 最後手段：重新安裝 pgAdmin4 和 PostgreSQL
```

---

## 📚 相關資源

- **pgAdmin4 官方文件**: https://www.pgadmin.org/docs/
- **PostgreSQL 官方文件**: https://www.postgresql.org/docs/
- **常見問題**: https://www.pgadmin.org/faq/

---

## 🆘 仍然無法解決？

### 快速診斷

```bash
# 1. 檢查 pgAdmin4 版本
# 在 pgAdmin4: Help → About

# 2. 檢查 PostgreSQL 版本
psql --version

# 3. 測試直接連線
psql -U postgres -h localhost -d postgres -c "SELECT version();"

# 4. 查看 pgAdmin4 日誌
tail -f ~/Library/Application\ Support/pgAdmin\ 4/pgadmin4.log
```

### 使用 psql 作為替代方案

```bash
# 連線到資料庫
psql -U postgres -h localhost -d postgres

# 常用命令
\l              # 列出所有資料庫
\c dbname       # 切換資料庫
\dt             # 列出資料表
\d tablename    # 查看資料表結構
\du             # 列出使用者
\q              # 退出
```

---

## 🎉 總結

**問題**：pgAdmin4 開啟資料庫時出現 "unrecognized configuration parameter" 錯誤

**最常見原因**：
1. pgAdmin4 版本過舊
2. 連線設定包含不支援的參數

**最有效的解決方案**：
1. ✅ 更新 pgAdmin4 到最新版本
2. ✅ 重新建立伺服器連線（不設定進階參數）
3. ✅ 確保 PostgreSQL 和 pgAdmin4 版本相容

**替代方案**：
- 使用 DBeaver、TablePlus 或 psql 命令列工具

修復後就可以正常使用 pgAdmin4 管理資料庫了！🚀
