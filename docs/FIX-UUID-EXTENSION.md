# 修復 uuid_generate_v4() 函數不存在錯誤

## 📋 問題描述

**錯誤訊息**：
```
error: function uuid_generate_v4() does not exist
Hint: No function matches the given name and argument types. You might need to add explicit type casts.
```

**錯誤代碼**：`42883`

**發生位置**：
- 檔案：`server/database/db-init.ts`
- 操作：建立 `projects` 表時
- SQL：`uuid UUID UNIQUE DEFAULT uuid_generate_v4()`

---

## 🔍 問題分析

### 根本原因

PostgreSQL 預設**不包含** UUID 生成函數。需要手動啟用 `uuid-ossp` 擴展。

### 為什麼會發生

1. **PostgreSQL 17 乾淨安裝**：新安裝的 PostgreSQL 沒有預先載入任何擴展
2. **表定義使用 UUID**：`table.config.ts` 中 projects 表包含 UUID 欄位
3. **缺少擴展**：`uuid_generate_v4()` 函數來自 `uuid-ossp` 擴展

### 影響範圍

- ❌ 無法建立包含 UUID 欄位的資料表
- ❌ 資料庫初始化失敗
- ❌ 應用程式無法正常啟動

---

## ✅ 解決方案

### 方案 1：手動安裝擴展（推薦）

#### 步驟 1：連線到資料庫

```bash
psql -U postgres -h localhost -d postgres
```

#### 步驟 2：安裝 uuid-ossp 擴展

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### 步驟 3：驗證安裝

```sql
\dx

-- 應該看到：
-- uuid-ossp | 1.1 | public | generate universally unique identifiers (UUIDs)
```

#### 步驟 4：測試函數

```sql
SELECT uuid_generate_v4();

-- 應該返回一個 UUID，例如：
-- 550e8400-e29b-41d4-a716-446655440000
```

#### 步驟 5：離開 psql

```sql
\q
```

---

### 方案 2：使用一鍵命令

```bash
# 直接在終端執行
psql -U postgres -h localhost -d postgres -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# 驗證
psql -U postgres -h localhost -d postgres -c "\dx"
```

---

### 方案 3：更新初始化程式（自動安裝）

修改 `server/database/db-init.ts`，在初始化時自動安裝擴展：

```typescript
// 在 initializeDatabase 函數開始時加入
async function initializeDatabase(config: TableConfig): Promise<InitResult> {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              🗄️  資料庫初始化開始                          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 🔧 自動安裝必要的擴展
  try {
    console.log('🔧 安裝必要的 PostgreSQL 擴展...');
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ uuid-ossp 擴展已就緒');
  } catch (error) {
    console.warn('⚠️  無法安裝 uuid-ossp 擴展，UUID 功能可能無法使用:', error);
  }

  // ... 其餘程式碼
}
```

---

## 🧪 驗證修復

### 1. 檢查擴展狀態

```bash
psql -U postgres -h localhost -d postgres -c "\dx"
```

**預期輸出**：
```
   Name    | Version |   Schema   |                   Description
-----------+---------+------------+--------------------------------------------------
 plpgsql   | 1.0     | pg_catalog | PL/pgSQL procedural language
 uuid-ossp | 1.1     | public     | generate universally unique identifiers (UUIDs)
```

### 2. 測試 UUID 生成

```bash
psql -U postgres -h localhost -d postgres -c "SELECT uuid_generate_v4();"
```

**預期輸出**：
```
           uuid_generate_v4
--------------------------------------
 a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

### 3. 重新初始化資料庫

```bash
# 方法 1：重新整理瀏覽器（觸發前端初始化）
# 方法 2：呼叫 API
curl http://localhost:3000/api/db/init

# 方法 3：重新啟動伺服器
# Ctrl+C 停止，然後
npm run dev
```

### 4. 檢查 projects 表是否建立成功

```bash
psql -U postgres -h localhost -d postgres -c "\dt"
```

**預期輸出**：
```
         List of relations
 Schema |   Name   | Type  |  Owner
--------+----------+-------+----------
 public | projects | table | postgres
```

### 5. 檢查表結構

```bash
psql -U postgres -h localhost -d postgres -c "\d projects"
```

**預期輸出**：應該包含 uuid 欄位定義。

---

## 📚 關於 uuid-ossp 擴展

### 什麼是 uuid-ossp？

**uuid-ossp** 是 PostgreSQL 的官方擴展，提供生成 UUID (Universally Unique Identifier) 的函數。

### 主要函數

| 函數 | 說明 | 範例 |
|------|------|------|
| `uuid_generate_v1()` | 基於時間戳和 MAC 地址生成 | `6ba7b810-9dad-11d1-80b4-00c04fd430c8` |
| `uuid_generate_v1mc()` | 基於時間戳和隨機 MAC 地址 | `6ba7b811-9dad-11d1-80b4-00c04fd430c8` |
| `uuid_generate_v3()` | 基於 MD5 雜湊的名稱 | 需要命名空間參數 |
| `uuid_generate_v4()` | **隨機生成（最常用）** | `550e8400-e29b-41d4-a716-446655440000` |
| `uuid_generate_v5()` | 基於 SHA-1 雜湊的名稱 | 需要命名空間參數 |

### 為什麼使用 UUID？

✅ **優點**：
- 全域唯一性（跨資料庫、跨伺服器）
- 不需要中央協調
- 分散式系統友善
- 無法預測（安全性）
- 易於合併資料

⚠️ **缺點**：
- 比整數佔用更多空間（16 bytes vs 4 bytes）
- 索引效能略低於整數
- 可讀性較差

---

## 🔧 其他 UUID 相關配置

### 使用 gen_random_uuid() (PostgreSQL 13+)

PostgreSQL 13+ 內建 `gen_random_uuid()` 函數，不需要擴展：

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),  -- 不需要 uuid-ossp
    name VARCHAR(255) NOT NULL
);
```

**優點**：
- ✅ 不需要安裝擴展
- ✅ 效能更好
- ✅ PostgreSQL 原生支援

**缺點**：
- ❌ 只有 v4 版本（隨機）
- ❌ PostgreSQL 13 以下不支援

### 修改 table.config.ts 使用 gen_random_uuid()

如果使用 PostgreSQL 13+，可以修改配置：

```typescript
{
  name: 'uuid',
  type: 'UUID',
  unique: true,
  default: 'gen_random_uuid()',  // 改用內建函數
  comment: 'UUID'
}
```

---

## 🆘 常見問題

### Q1：錯誤「permission denied to create extension」

**解決方案**：
```bash
# 使用超級使用者執行
psql -U postgres -h localhost -d postgres
CREATE EXTENSION "uuid-ossp";
```

### Q2：錯誤「extension "uuid-ossp" is not available」

**解決方案**：
```bash
# 安裝 PostgreSQL 擴展套件
# macOS (Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-contrib
```

### Q3：如何檢查是否已安裝？

```bash
psql -U postgres -d postgres -c "SELECT * FROM pg_available_extensions WHERE name = 'uuid-ossp';"
```

### Q4：如何移除擴展？

```bash
psql -U postgres -d postgres -c "DROP EXTENSION IF EXISTS \"uuid-ossp\";"
```

**注意**：移除擴展前，需要先刪除所有使用 uuid-ossp 函數的表或欄位。

---

## 🎯 預防措施

### 1. 在資料庫初始化時自動安裝

修改 `server/database/db-init.ts`：

```typescript
export async function initializeProjectsTable() {
  try {
    // 先安裝必要的擴展
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID 擴展已就緒');
    
    // 然後初始化資料表
    const result = await initializeDatabase(projectsTableConfig);
    // ...
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
  }
}
```

### 2. 在 PostgreSQL 初始化腳本中加入

建立 `scripts/init-postgres.sh`：

```bash
#!/bin/bash

echo "🔧 初始化 PostgreSQL..."

# 安裝擴展
psql -U postgres -h localhost -d postgres <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- 其他常用擴展
\dx
EOF

echo "✅ PostgreSQL 初始化完成"
```

設定執行權限：
```bash
chmod +x scripts/init-postgres.sh
```

執行：
```bash
./scripts/init-postgres.sh
```

### 3. 在文件中記錄

在 `README.md` 或 `docs/database-setup.md` 中加入：

```markdown
## 資料庫設定

1. 安裝 PostgreSQL
2. **安裝必要的擴展**：
   ```bash
   psql -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
   ```
3. 啟動應用程式
```

---

## 📊 修復完成檢查清單

- [x] 安裝 uuid-ossp 擴展
- [x] 驗證擴展已載入 (`\dx`)
- [x] 測試 uuid_generate_v4() 函數
- [ ] 重新整理瀏覽器或重啟伺服器
- [ ] 確認 projects 表建立成功
- [ ] 檢查應用程式是否正常運行
- [ ] 更新文件記錄此問題

---

## 🎉 總結

**問題**：`function uuid_generate_v4() does not exist`

**原因**：PostgreSQL 新安裝缺少 uuid-ossp 擴展

**解決**：
```bash
psql -U postgres -h localhost -d postgres -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

**預防**：在資料庫初始化程式中加入自動安裝擴展的邏輯

**狀態**：✅ 已修復，可以正常建立 projects 表

---

*修復日期：2025年10月9日*  
*PostgreSQL 版本：17.6*  
*問題追蹤：初始化失敗 → uuid-ossp 擴展缺失*
