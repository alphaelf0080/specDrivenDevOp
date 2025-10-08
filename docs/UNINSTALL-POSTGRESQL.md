# PostgreSQL 完整解除安裝指南

## ⚠️ 重要提醒

解除安裝 PostgreSQL 會：
- ❌ **刪除所有資料庫和資料**（無法復原）
- ❌ 刪除所有配置文件
- ❌ 刪除所有 PostgreSQL 相關程式

**建議在解除安裝前先備份資料！**

---

## 📦 備份資料（可選但強烈建議）

### 備份所有資料庫

```bash
# 備份單一資料庫
pg_dump -U postgres -h localhost postgres > postgres_backup.sql
pg_dump -U postgres -h localhost spec_driven_dev > spec_driven_dev_backup.sql

# 或備份所有資料庫
pg_dumpall -U postgres -h localhost > all_databases_backup.sql
```

---

## 🗑️ 解除安裝步驟

### 方法 1：使用 Homebrew 解除安裝（推薦）

#### 步驟 1：停止 PostgreSQL 服務

```bash
# 停止服務
brew services stop postgresql@14

# 或停止所有 PostgreSQL 版本
brew services stop postgresql
brew services stop postgresql@12
brew services stop postgresql@13
brew services stop postgresql@14
brew services stop postgresql@15
brew services stop postgresql@16
```

#### 步驟 2：解除安裝 PostgreSQL

```bash
# 解除安裝 PostgreSQL 14
brew uninstall postgresql@14

# 如果有其他版本
brew uninstall postgresql
brew uninstall postgresql@12
brew uninstall postgresql@13
brew uninstall postgresql@15
brew uninstall postgresql@16

# 強制移除（包含依賴）
brew uninstall --force postgresql@14
```

#### 步驟 3：刪除資料目錄

```bash
# PostgreSQL 14 資料目錄（Homebrew）
rm -rf /opt/homebrew/var/postgresql@14
rm -rf /opt/homebrew/var/postgres

# 舊版 Intel Mac 路徑
rm -rf /usr/local/var/postgresql@14
rm -rf /usr/local/var/postgres

# 使用者資料目錄
rm -rf ~/Library/Application\ Support/Postgres
```

#### 步驟 4：刪除配置文件

```bash
# 刪除 PostgreSQL 相關配置
rm -rf ~/.psqlrc
rm -rf ~/.psql_history
```

#### 步驟 5：清理 Homebrew 快取

```bash
# 清理 Homebrew 快取
brew cleanup postgresql
brew cleanup postgresql@14
```

---

### 方法 2：完整清除（包含所有相關文件）

```bash
# 停止所有 PostgreSQL 服務
brew services stop postgresql@14
brew services stop postgresql

# 解除安裝
brew uninstall --force postgresql@14
brew uninstall --force postgresql

# 刪除所有 PostgreSQL 相關目錄
sudo rm -rf /opt/homebrew/var/postgresql*
sudo rm -rf /opt/homebrew/var/postgres*
sudo rm -rf /usr/local/var/postgresql*
sudo rm -rf /usr/local/var/postgres*

# 刪除配置文件
rm -rf ~/Library/Application\ Support/Postgres*
rm -rf ~/.psqlrc
rm -rf ~/.psql_history
rm -rf ~/.pgpass

# 刪除日誌文件
rm -rf ~/Library/Logs/Postgres*

# 清理 Homebrew
brew cleanup
```

---

## 🔍 驗證解除安裝

### 檢查 PostgreSQL 是否已移除

```bash
# 檢查 psql 命令
which psql
# 應該顯示：command not found

# 檢查 PostgreSQL 服務
brew services list | grep postgresql
# 應該沒有任何輸出

# 檢查安裝的套件
brew list | grep postgresql
# 應該沒有任何輸出

# 檢查資料目錄
ls /opt/homebrew/var/ | grep postgres
# 應該沒有任何輸出
```

---

## 🔄 重新安裝 PostgreSQL（如果需要）

### 安裝最新版本

```bash
# 安裝 PostgreSQL 14
brew install postgresql@14

# 啟動服務
brew services start postgresql@14

# 初始化（如果需要）
initdb /opt/homebrew/var/postgresql@14

# 設定密碼
psql postgres
ALTER USER postgres WITH PASSWORD '1234';
\q
```

---

## 🆘 解除安裝問題排查

### 問題 1：無法停止服務

**錯誤訊息**：
```
Error: Service postgresql@14 is not started
```

**解決方案**：
```bash
# 強制終止 PostgreSQL 進程
pkill -9 postgres

# 或找到並終止特定進程
ps aux | grep postgres
kill -9 <PID>
```

### 問題 2：刪除檔案時權限被拒

**錯誤訊息**：
```
rm: cannot remove: Permission denied
```

**解決方案**：
```bash
# 使用 sudo（需要管理員權限）
sudo rm -rf /opt/homebrew/var/postgresql@14
```

### 問題 3：資料目錄不存在

**解決方案**：
```bash
# 搜尋所有可能的 PostgreSQL 目錄
find / -name "postgresql*" 2>/dev/null
find / -name "postgres*" 2>/dev/null

# 手動刪除找到的目錄
```

---

## 📊 解除安裝影響分析

### 對您的專案的影響

| 項目 | 影響 | 解決方案 |
|------|------|---------|
| 應用程式 | ❌ 無法連線資料庫 | 重新安裝 PostgreSQL |
| pgAdmin4 | ⚠️ 可連線但無資料 | 重新安裝 PostgreSQL |
| 資料表 | ❌ 所有資料遺失 | 從備份還原 |
| 配置文件 | ✅ 不受影響 | `.env` 和 `database.config.ts` 仍存在 |

### 相關檔案狀態

```
✅ 保留（不受影響）：
├─ .env                              ← 環境變數配置
├─ server/config/database.config.ts ← 資料庫配置
├─ server/config/table.config.ts    ← 資料表定義
└─ docs/*.md                         ← 所有文件

❌ 刪除（隨 PostgreSQL 移除）：
├─ /opt/homebrew/var/postgresql@14  ← 資料庫資料
├─ ~/.psqlrc                         ← psql 配置
└─ ~/Library/Application Support/Postgres ← 應用資料
```

---

## 💾 備份與還原

### 完整備份流程

```bash
# 1. 備份所有資料庫
pg_dumpall -U postgres -h localhost > full_backup_$(date +%Y%m%d).sql

# 2. 驗證備份檔案
ls -lh full_backup_*.sql

# 3. 解除安裝 PostgreSQL
brew services stop postgresql@14
brew uninstall postgresql@14
rm -rf /opt/homebrew/var/postgresql@14

# 4. 重新安裝（如果需要）
brew install postgresql@14
brew services start postgresql@14

# 5. 還原資料
psql postgres < full_backup_20251008.sql
```

---

## 🔧 替代方案

### 選項 1：保留但停止服務

如果只是暫時不需要 PostgreSQL：

```bash
# 停止服務
brew services stop postgresql@14

# 稍後重新啟動
brew services start postgresql@14
```

### 選項 2：使用 Docker PostgreSQL

不安裝在本機，改用 Docker：

```bash
# 安裝 Docker
brew install --cask docker

# 執行 PostgreSQL 容器
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=1234 \
  -p 5432:5432 \
  postgres:14

# 停止容器
docker stop postgres

# 刪除容器
docker rm postgres
```

---

## 📚 相關命令參考

### PostgreSQL 服務管理

```bash
# 檢查狀態
brew services list

# 啟動服務
brew services start postgresql@14

# 停止服務
brew services stop postgresql@14

# 重新啟動
brew services restart postgresql@14
```

### Homebrew 管理

```bash
# 列出已安裝的套件
brew list

# 搜尋 PostgreSQL
brew search postgresql

# 查看套件資訊
brew info postgresql@14

# 清理舊版本
brew cleanup
```

---

## ⚠️ 最終確認清單

在執行解除安裝前，請確認：

- [ ] 已備份所有重要資料
- [ ] 已停止 PostgreSQL 服務
- [ ] 已停止所有使用資料庫的應用程式
- [ ] 已關閉 pgAdmin4
- [ ] 確定真的要刪除所有資料

---

## 🎯 快速解除安裝（不保留資料）

如果確定要完全移除且不需要資料：

```bash
#!/bin/bash

echo "⚠️  警告：這將刪除所有 PostgreSQL 資料！"
read -p "確定要繼續嗎？(yes/no) " -r
if [[ $REPLY != "yes" ]]; then
    echo "已取消"
    exit 1
fi

# 停止服務
brew services stop postgresql@14

# 解除安裝
brew uninstall --force postgresql@14

# 刪除資料
rm -rf /opt/homebrew/var/postgresql@14
rm -rf ~/.psqlrc
rm -rf ~/.psql_history

# 清理
brew cleanup

echo "✅ PostgreSQL 已完全移除"
```

---

## 📞 需要協助？

如果遇到問題：

1. 查看錯誤訊息
2. 檢查 Homebrew 日誌：`brew doctor`
3. 搜尋類似問題：Google "brew uninstall postgresql [錯誤訊息]"
4. 查看官方文件：https://www.postgresql.org/docs/

---

## 🎉 總結

**解除安裝 PostgreSQL 的完整流程**：

1. ✅ 備份資料（如果需要）
2. ✅ 停止服務：`brew services stop postgresql@14`
3. ✅ 解除安裝：`brew uninstall postgresql@14`
4. ✅ 刪除資料目錄：`rm -rf /opt/homebrew/var/postgresql@14`
5. ✅ 清理配置：`rm -rf ~/.psqlrc ~/.psql_history`
6. ✅ 驗證移除：`which psql`（應該顯示 not found）

**記住**：解除安裝後，您的應用程式將無法連線資料庫，直到重新安裝 PostgreSQL！
