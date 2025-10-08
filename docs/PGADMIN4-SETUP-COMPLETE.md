# pgAdmin4 安裝與設定完成指南

## ✅ 安裝完成

pgAdmin4 9.8 已成功安裝！

**安裝位置**：`/Applications/pgAdmin 4.app`

---

## 🚀 首次設定步驟

### 步驟 1：啟動 pgAdmin4

```bash
# 方法 A：從應用程式資料夾開啟
open -a "pgAdmin 4"

# 方法 B：使用 Spotlight
# 按 Cmd+Space，輸入 "pgAdmin 4"，按 Enter
```

### 步驟 2：設定主密碼

首次啟動時，pgAdmin4 會要求您設定主密碼（Master Password）：

1. 輸入一個安全的密碼（用於保護儲存的資料庫密碼）
2. 再次輸入確認
3. 點擊「OK」

⚠️ **重要**：請記住這個密碼，之後每次啟動 pgAdmin4 都需要輸入。

### 步驟 3：建立伺服器連線

#### 3.1 新增伺服器

1. 在左側樹狀結構中，右鍵點擊「Servers」
2. 選擇「Register」→「Server」

#### 3.2 設定連線資訊

**General 標籤**：
- **Name**: `Local PostgreSQL`（或任何您喜歡的名稱）

**Connection 標籤**：
- **Host name/address**: `localhost`
- **Port**: `5432`
- **Maintenance database**: `postgres`
- **Username**: `postgres`
- **Password**: `1234`（或您的實際密碼）
- ✅ 勾選「Save password?」

**Advanced 標籤**：
- ⚠️ **留空所有欄位**（避免 "unrecognized configuration parameter" 錯誤）

#### 3.3 儲存並連線

1. 點擊「Save」
2. pgAdmin4 會自動嘗試連線
3. 如果成功，您會在左側看到伺服器圖示變成綠色

---

## 🔍 驗證連線

連線成功後，展開伺服器節點：

```
Servers
  └─ Local PostgreSQL
      ├─ Databases
      │   └─ postgres
      │       ├─ Schemas
      │       │   └─ public
      │       │       ├─ Tables
      │       │       │   └─ projects (如果已建立)
      │       │       └─ ...
      │       └─ ...
      └─ ...
```

---

## 💡 常用操作

### 查看資料表

1. 展開：`Servers` → `Local PostgreSQL` → `Databases` → `postgres` → `Schemas` → `public` → `Tables`
2. 右鍵點擊資料表（如 `projects`）
3. 選擇「View/Edit Data」→「All Rows」

### 執行 SQL 查詢

1. 右鍵點擊資料庫（如 `postgres`）
2. 選擇「Query Tool」
3. 輸入 SQL 語句：
   ```sql
   SELECT * FROM projects;
   ```
4. 點擊「執行」按鈕（或按 F5）

### 建立新資料庫

1. 右鍵點擊「Databases」
2. 選擇「Create」→「Database」
3. 輸入資料庫名稱：`spec_driven_dev`
4. 點擊「Save」

---

## ⚠️ 常見問題解決

### 問題 1：無法連線

**錯誤訊息**：
```
could not connect to server: Connection refused
```

**解決方案**：
```bash
# 確認 PostgreSQL 是否正在運行
brew services list | grep postgresql

# 如果沒有運行，啟動它
brew services start postgresql@14

# 測試連線
psql -U postgres -h localhost -c "SELECT 1;"
```

### 問題 2：密碼認證失敗

**錯誤訊息**：
```
password authentication failed for user "postgres"
```

**解決方案**：
```bash
# 重設密碼
psql postgres
ALTER USER postgres WITH PASSWORD '1234';
\q

# 在 pgAdmin4 中更新密碼
# 右鍵點擊伺服器 → Properties → Connection → 輸入新密碼
```

### 問題 3：unrecognized configuration parameter

**錯誤訊息**：
```
unrecognized configuration parameter "lc_collate"
```

**解決方案**：
1. 右鍵點擊伺服器 → Properties
2. 切換到「Advanced」標籤
3. 清空所有欄位
4. 點擊「Save」
5. 重新連線

---

## 🎯 最佳實踐

### 1. 使用查詢歷史

pgAdmin4 會自動儲存您的查詢歷史：
- 在 Query Tool 中點擊「History」按鈕
- 可以查看和重新執行之前的查詢

### 2. 備份資料庫

```bash
# 方法 A：使用 pgAdmin4
右鍵點擊資料庫 → Backup...

# 方法 B：使用命令列
pg_dump -U postgres -h localhost postgres > backup.sql
```

### 3. 匯入資料

```bash
# 使用 pgAdmin4
右鍵點擊資料庫 → Restore...

# 使用命令列
psql -U postgres -h localhost postgres < backup.sql
```

---

## 🔧 pgAdmin4 設定優化

### 調整查詢輸出限制

1. 點擊「File」→「Preferences」
2. 展開「Query Tool」
3. 調整「Max rows to retrieve」（預設 1000）

### 啟用自動完成

1. 點擊「File」→「Preferences」
2. 展開「Query Tool」→「Options」
3. 勾選「Auto completion」

### 調整字體大小

1. 點擊「File」→「Preferences」
2. 展開「Query Tool」→「Display」
3. 調整「Font size」

---

## 📊 與應用程式的關係

### 配置對比

| 項目 | pgAdmin4 連線 | 應用程式連線 |
|------|--------------|-------------|
| Host | localhost | localhost |
| Port | 5432 | 5432 |
| Database | postgres | postgres |
| Username | postgres | postgres |
| Password | 1234 | 1234 |
| 配置來源 | pgAdmin4 設定 | `.env` 文件 |

### 同步資料

- pgAdmin4 和應用程式連接到**同一個資料庫**
- 在 pgAdmin4 中的修改會立即反映在應用程式中
- 應用程式建立的資料表可以在 pgAdmin4 中看到

---

## 🚀 快速開始

### 檢查應用程式建立的資料表

```bash
# 1. 啟動應用程式（會自動建立 projects 表）
npm run dev

# 2. 在 pgAdmin4 中查看
Servers → Local PostgreSQL → Databases → postgres → Schemas → public → Tables → projects

# 3. 查看資料
右鍵點擊 projects → View/Edit Data → All Rows
```

---

## 📚 相關文件

- **pgAdmin4 官方文件**: https://www.pgadmin.org/docs/
- **PostgreSQL 官方文件**: https://www.postgresql.org/docs/
- **本專案資料庫配置**: `docs/database-config-guide.md`
- **pgAdmin4 錯誤修復**: `docs/FIX-PGADMIN4-ERROR.md`

---

## 🎉 完成！

pgAdmin4 已安裝並準備就緒。您現在可以：

✅ 視覺化管理 PostgreSQL 資料庫  
✅ 執行 SQL 查詢  
✅ 查看應用程式建立的資料表  
✅ 管理使用者和權限  
✅ 備份和還原資料庫  

**下一步**：啟動您的應用程式，讓它自動建立 `projects` 表，然後在 pgAdmin4 中查看！🚀

---

## 💡 提示

### Homebrew 使用注意事項

❌ **錯誤**：`sudo brew upgrade --cask pgadmin4`  
✅ **正確**：`brew upgrade --cask pgadmin4`

⚠️ **永遠不要使用 sudo 執行 Homebrew 命令**！

### 更新 pgAdmin4

```bash
# 檢查更新
brew outdated pgadmin4

# 更新到最新版本（不使用 sudo）
brew upgrade --cask pgadmin4
```

### 解除安裝

```bash
# 完全移除 pgAdmin4
brew uninstall --cask pgadmin4

# 清理設定檔（可選）
rm -rf ~/Library/Application\ Support/pgAdmin\ 4/
```
