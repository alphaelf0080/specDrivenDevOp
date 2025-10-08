# PostgreSQL (Postgres.app) 解除安裝指南

## 🔍 檢測結果

您的系統上安裝了：
- ✅ **PostgreSQL 13** (Postgres.app) - `/Applications/PostgreSQL 13`
- ✅ **PostgreSQL 17** (Postgres.app) - `/Applications/PostgreSQL 17`
- ✅ **PostgreSQL 17 正在運行** - PID 301

---

## ⚠️ 重要警告

解除安裝 PostgreSQL 會：
- ❌ **刪除所有資料庫和資料**（無法復原）
- ❌ 刪除所有配置文件和日誌
- ❌ 您的應用程式將無法連線資料庫
- ❌ pgAdmin4 將無法連線到 PostgreSQL

**建議在解除安裝前先備份資料！**

---

## 📦 備份資料（強烈建議）

### 步驟 1：找到 psql 位置

```bash
# PostgreSQL 17 的 psql
/Library/PostgreSQL/17/bin/psql --version

# 或設定環境變數（臨時）
export PATH="/Library/PostgreSQL/17/bin:$PATH"
```

### 步驟 2：備份所有資料庫

```bash
# 使用 PostgreSQL 17 的工具備份
/Library/PostgreSQL/17/bin/pg_dumpall -U postgres -h localhost > ~/postgres_backup_$(date +%Y%m%d_%H%M%S).sql

# 或使用 pg_dump 備份單一資料庫
/Library/PostgreSQL/17/bin/pg_dump -U postgres -h localhost -d postgres > ~/postgres_db_backup.sql
```

### 步驟 3：驗證備份

```bash
# 查看備份檔案
ls -lh ~/postgres_backup_*.sql

# 查看備份內容（前幾行）
head -20 ~/postgres_backup_*.sql
```

---

## 🗑️ 完整解除安裝步驟

### 方法 1：手動解除安裝（推薦，可控制）

#### 步驟 1：停止 PostgreSQL 服務

```bash
# 找到 PostgreSQL 主進程
ps aux | grep -i postgres | grep -v grep

# 停止 PostgreSQL 17
/Library/PostgreSQL/17/bin/pg_ctl stop -D /Library/PostgreSQL/17/data

# 或使用 kill（溫和停止）
sudo pkill -TERM postgres

# 或強制停止（如果上面不行）
sudo pkill -9 postgres
```

#### 步驟 2：刪除應用程式

```bash
# 刪除 PostgreSQL 應用程式
sudo rm -rf "/Applications/PostgreSQL 13"
sudo rm -rf "/Applications/PostgreSQL 17"
```

#### 步驟 3：刪除資料目錄

```bash
# PostgreSQL 17 資料目錄
sudo rm -rf /Library/PostgreSQL/17

# PostgreSQL 13 資料目錄（如果有）
sudo rm -rf /Library/PostgreSQL/13

# 使用者資料目錄
rm -rf ~/Library/Application\ Support/Postgres
rm -rf ~/Library/Preferences/com.edb.launchd.*.plist
```

#### 步驟 4：刪除配置文件

```bash
# 刪除使用者配置
rm -rf ~/.psqlrc
rm -rf ~/.psql_history
rm -rf ~/.pgpass

# 刪除日誌檔案
rm -rf ~/Library/Logs/Postgres
```

#### 步驟 5：移除啟動項目（如果有）

```bash
# 檢查啟動代理
ls ~/Library/LaunchAgents | grep -i postgres

# 刪除啟動代理（如果存在）
rm -f ~/Library/LaunchAgents/com.edb.launchd.*.plist
sudo rm -f /Library/LaunchDaemons/com.edb.launchd.*.plist

# 重新載入啟動服務
launchctl list | grep postgres
# 如果有顯示，使用以下命令卸載
launchctl unload ~/Library/LaunchAgents/com.edb.launchd.*.plist
```

---

### 方法 2：使用自動化腳本（快速但需確認）

建立並執行此腳本：

```bash
#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║  PostgreSQL 完整解除安裝腳本           ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 警告訊息
echo "⚠️  警告：這將刪除所有 PostgreSQL 資料！"
echo ""
read -p "確定要繼續嗎？輸入 'YES' 確認: " -r
if [[ $REPLY != "YES" ]]; then
    echo "已取消"
    exit 1
fi

echo ""
echo "🔄 開始解除安裝..."
echo ""

# 1. 停止服務
echo "1️⃣ 停止 PostgreSQL 服務..."
sudo pkill -TERM postgres
sleep 2

# 2. 刪除應用程式
echo "2️⃣ 刪除應用程式..."
sudo rm -rf "/Applications/PostgreSQL 13"
sudo rm -rf "/Applications/PostgreSQL 17"

# 3. 刪除資料目錄
echo "3️⃣ 刪除資料目錄..."
sudo rm -rf /Library/PostgreSQL

# 4. 刪除使用者資料
echo "4️⃣ 刪除使用者資料..."
rm -rf ~/Library/Application\ Support/Postgres
rm -rf ~/Library/Preferences/com.edb.launchd.*.plist
rm -rf ~/.psqlrc
rm -rf ~/.psql_history
rm -rf ~/.pgpass
rm -rf ~/Library/Logs/Postgres

# 5. 移除啟動項目
echo "5️⃣ 移除啟動項目..."
rm -f ~/Library/LaunchAgents/com.edb.launchd.*.plist
sudo rm -f /Library/LaunchDaemons/com.edb.launchd.*.plist

echo ""
echo "✅ PostgreSQL 已完全移除！"
echo ""
echo "驗證移除..."
```

儲存為 `uninstall-postgres.sh`，然後執行：

```bash
chmod +x uninstall-postgres.sh
./uninstall-postgres.sh
```

---

## 🔍 驗證解除安裝

### 檢查是否已完全移除

```bash
# 1. 檢查進程
ps aux | grep -i postgres | grep -v grep
# 應該沒有任何輸出（或只有系統相關進程）

# 2. 檢查應用程式
ls /Applications | grep -i postgres
# 應該沒有任何輸出

# 3. 檢查資料目錄
ls /Library | grep -i postgres
# 應該沒有任何輸出

# 4. 檢查 psql 命令
which psql
# 應該顯示：psql not found

# 5. 檢查啟動項目
ls ~/Library/LaunchAgents | grep postgres
ls /Library/LaunchDaemons | grep postgres
# 應該沒有任何輸出
```

---

## 📊 當前狀態分析

### 正在運行的 PostgreSQL 服務

```
進程 ID：301
位置：/Library/PostgreSQL/17/bin/postgres
資料目錄：/Library/PostgreSQL/17/data
狀態：✅ 正在運行

相關進程：
├─ 402: logger           (日誌記錄器)
├─ 405: checkpointer     (檢查點處理)
├─ 406: background writer (背景寫入器)
├─ 410: walwriter        (WAL 寫入器)
├─ 411: autovacuum       (自動清理)
└─ 412: logical repl     (邏輯複製)
```

---

## 🆘 解除安裝問題排查

### 問題 1：無法停止 PostgreSQL

**錯誤訊息**：
```
pg_ctl: server does not shut down
```

**解決方案**：
```bash
# 強制終止
sudo pkill -9 postgres

# 或找到主進程並終止
ps aux | grep "postgres -D" | grep -v grep
sudo kill -9 <PID>  # 替換為實際的 PID
```

### 問題 2：權限被拒

**錯誤訊息**：
```
rm: cannot remove: Permission denied
```

**解決方案**：
```bash
# 使用 sudo
sudo rm -rf /Library/PostgreSQL/17

# 如果還是不行，檢查權限
ls -la /Library/PostgreSQL/17
```

### 問題 3：資料目錄在其他位置

**解決方案**：
```bash
# 搜尋所有 PostgreSQL 相關目錄
sudo find / -name "postgresql*" -type d 2>/dev/null
sudo find / -name "postgres*" -type d 2>/dev/null

# 查看進程使用的資料目錄
ps aux | grep postgres | grep -v grep
```

---

## 🔄 重新安裝選項

### 選項 1：重新安裝 Postgres.app

```bash
# 下載並安裝 Postgres.app
# 訪問：https://postgresapp.com/

# 或使用 Homebrew Cask
brew install --cask postgres-unofficial
```

### 選項 2：使用 Homebrew 安裝

```bash
# 安裝 PostgreSQL 14
brew install postgresql@14

# 啟動服務
brew services start postgresql@14

# 設定密碼
psql postgres
ALTER USER postgres WITH PASSWORD '1234';
\q
```

### 選項 3：使用 Docker

```bash
# 安裝 Docker
brew install --cask docker

# 執行 PostgreSQL 容器
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=1234 \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:17

# 連線測試
docker exec -it postgres psql -U postgres
```

---

## 💾 資料還原（重新安裝後）

如果您已備份資料且想要還原：

```bash
# 1. 重新安裝 PostgreSQL

# 2. 啟動服務

# 3. 還原資料
psql postgres < ~/postgres_backup_20251008.sql

# 或使用完整路徑
/Library/PostgreSQL/17/bin/psql postgres < ~/postgres_backup_20251008.sql

# 4. 驗證資料
psql postgres
\l      # 列出所有資料庫
\dt     # 列出資料表
SELECT * FROM projects LIMIT 10;
\q
```

---

## 📋 解除安裝影響清單

### 對您的專案的影響

| 項目 | 影響 | 解決方案 |
|------|------|---------|
| 應用程式 | ❌ 無法連線資料庫 | 重新安裝 PostgreSQL |
| pgAdmin4 | ❌ 無法連線 | 重新安裝 PostgreSQL |
| .env 檔案 | ✅ 不受影響 | 配置保留 |
| 程式碼 | ✅ 不受影響 | 所有程式碼保留 |
| 文件 | ✅ 不受影響 | 所有文件保留 |
| projects 表 | ❌ 資料遺失 | 從備份還原或重新初始化 |

### 相關檔案狀態

```
✅ 保留（不受影響）：
├─ .env                              ← 環境變數配置
├─ server/config/database.config.ts ← 資料庫配置
├─ server/config/table.config.ts    ← 資料表定義
├─ server/database/db-init.ts       ← 初始化程式
├─ docs/*.md                         ← 所有文件
└─ client/                           ← 前端程式碼

❌ 刪除（隨 PostgreSQL 移除）：
├─ /Library/PostgreSQL/17/          ← 所有資料庫資料
├─ /Applications/PostgreSQL 17      ← 應用程式
├─ ~/.psqlrc                         ← psql 配置
└─ ~/Library/Application Support/Postgres ← 應用資料
```

---

## 🎯 快速解除安裝命令（一鍵執行）

**警告：這會立即刪除所有 PostgreSQL 資料！**

```bash
# 停止服務
sudo pkill -TERM postgres

# 等待 2 秒
sleep 2

# 刪除所有 PostgreSQL 相關檔案
sudo rm -rf "/Applications/PostgreSQL 13" \
            "/Applications/PostgreSQL 17" \
            /Library/PostgreSQL \
            ~/Library/Application\ Support/Postgres \
            ~/Library/Preferences/com.edb.launchd.*.plist \
            ~/.psqlrc \
            ~/.psql_history \
            ~/.pgpass \
            ~/Library/Logs/Postgres \
            ~/Library/LaunchAgents/com.edb.launchd.*.plist

sudo rm -f /Library/LaunchDaemons/com.edb.launchd.*.plist

echo "✅ PostgreSQL 已完全移除"
```

---

## 🔧 替代方案（不解除安裝）

### 選項 1：只停止服務

如果只是暫時不需要：

```bash
# 停止服務
/Library/PostgreSQL/17/bin/pg_ctl stop -D /Library/PostgreSQL/17/data

# 稍後重新啟動
/Library/PostgreSQL/17/bin/pg_ctl start -D /Library/PostgreSQL/17/data
```

### 選項 2：保留但移除啟動項目

防止開機自動啟動：

```bash
# 查看啟動項目
launchctl list | grep postgres

# 移除啟動項目
launchctl unload ~/Library/LaunchAgents/com.edb.launchd.*.plist
rm -f ~/Library/LaunchAgents/com.edb.launchd.*.plist
```

---

## ⚠️ 最終確認清單

在執行解除安裝前，請確認：

- [ ] 已備份所有重要資料（使用 pg_dumpall）
- [ ] 已停止 PostgreSQL 服務（檢查進程）
- [ ] 已停止所有使用資料庫的應用程式
- [ ] 已關閉 pgAdmin4 或其他資料庫工具
- [ ] 已記錄當前的資料庫設定（.env 檔案）
- [ ] 確定真的要刪除所有資料（無法復原！）
- [ ] 已閱讀並理解影響範圍

---

## 📞 需要協助？

解除安裝相關問題：

1. **備份失敗**：檢查 PostgreSQL 是否正在運行
2. **權限錯誤**：使用 `sudo` 執行刪除命令
3. **進程無法停止**：使用 `sudo pkill -9 postgres`
4. **不確定資料位置**：使用 `find` 命令搜尋

查看相關文件：
- 資料庫配置：`docs/database-config-guide.md`
- pgAdmin4 設定：`docs/PGADMIN4-SETUP-COMPLETE.md`
- 一般解除安裝：`docs/UNINSTALL-POSTGRESQL.md`

---

## 🎉 總結

**Postgres.app 完整解除安裝流程**：

1. ✅ **備份資料**：`pg_dumpall -U postgres > backup.sql`
2. ✅ **停止服務**：`sudo pkill -TERM postgres`
3. ✅ **刪除應用**：`sudo rm -rf "/Applications/PostgreSQL 17"`
4. ✅ **刪除資料**：`sudo rm -rf /Library/PostgreSQL`
5. ✅ **清理配置**：`rm -rf ~/.psqlrc ~/Library/Application\ Support/Postgres`
6. ✅ **驗證移除**：`ps aux | grep postgres`（應無輸出）

**記住**：
- 解除安裝是**永久性**的，資料無法復原！
- 請**務必備份**重要資料！
- 您的應用程式需要**重新安裝** PostgreSQL 才能使用！
