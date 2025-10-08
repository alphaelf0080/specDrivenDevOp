# 資料庫初始化架構說明更新

**更新日期**：2025-10-08  
**更新內容**：補充說明 table.config.ts 在資料庫初始化中的核心角色

---

## 📋 更新摘要

### 主要更新

1. ✅ **補充 db-init-guide.md**
   - 明確說明 projects 表配置來自 `table.config.ts`
   - 更新架構設計章節，強調配置文件的角色
   - 補充如何修改表結構的說明

2. ✅ **新建 table-config-architecture.md**
   - 完整的 `table.config.ts` 架構說明文件
   - 包含設計理念、資料結構、使用方式
   - 提供範例和最佳實踐

---

## 🎯 核心概念

### table.config.ts 是唯一的資料表定義來源

```
table.config.ts (配置定義)
    ↓
sql-generator.ts (生成 SQL)
    ↓
db-init.ts (執行初始化)
    ↓
PostgreSQL (資料庫)
```

### 單一真相來源（Single Source of Truth）

所有資料表的結構定義都集中在 `server/config/table.config.ts`：

```typescript
export const tableConfigs: TableConfig = {
  projects: {
    name: 'projects',
    columns: [...],
    indexes: [...],
    triggers: [...],
  },
  project_index: { /* ... */ },
  users: { /* ... */ },
  // ... 其他資料表
};
```

---

## 📚 新增文件

### docs/table-config-architecture.md

完整的架構說明文件，包含：

- 📋 **設計理念** - 為什麼使用配置文件
- 🏗️ **架構圖** - 視覺化的系統架構
- 📦 **資料結構** - 介面定義和說明
- 🔧 **使用方式** - 如何定義和使用配置
- 🔄 **工作流程** - 初始化和 SQL 生成流程
- 📊 **已定義的資料表** - 目前所有資料表概覽
- 🎯 **範例** - projects 表的完整範例
- 🔍 **輔助函數** - getTableConfig 等函數說明
- ✅ **優勢** - 使用配置文件的好處
- 🚀 **最佳實踐** - 命名規範、索引策略等

---

## 🔄 更新的文件

### docs/db-init-guide.md

更新內容：

1. **架構設計章節**
   - 新增「資料表配置來源」說明
   - 強調從 `table.config.ts` 動態讀取
   - 列出配置文件的優勢

2. **執行流程章節**
   - 明確標示從 table.config.ts 讀取配置的步驟
   - 補充 table.config.ts 的配置項目說明

3. **資料表結構章節**
   - 標明配置來源：`table.config.ts` → `tableConfigs.projects`
   - 新增「如何修改 projects 表結構」章節
   - 提供修改配置的範例程式碼

4. **相關檔案章節**
   - 將配置檔案獨立成一個區塊
   - 強調 `table.config.ts` 的重要性
   - 新增連結到 `table-config-architecture.md`

5. **新增重要提示章節**
   - 說明 table.config.ts 是唯一的資料表定義來源
   - 列出使用配置文件的優勢
   - 提供完整的初始化流程圖

---

## 📊 文件結構

```
docs/
├── db-init-guide.md                 ← 更新：補充 table.config 說明
├── table-config-architecture.md     ← 新增：完整架構說明
├── project-index-guide.md           ← 現有：project_index 表指南
├── project-index-quickref.md        ← 現有：快速參考
├── project-index-complete.md        ← 現有：完成報告
├── UPDATE-2025-10-08-project-index.md  ← 現有：更新記錄
└── UPDATE-SUMMARY.md                ← 現有：更新摘要
```

---

## 🎯 關鍵要點

### 1. 配置驅動（Configuration-Driven）

```typescript
// 1. 定義配置（table.config.ts）
projects: {
  columns: [
    { name: 'id', type: ColumnType.SERIAL, primaryKey: true },
    { name: 'name', type: ColumnType.VARCHAR, length: 255 },
  ],
  indexes: [
    { name: 'idx_projects_name', columns: ['name'] },
  ],
}

// 2. 自動生成 SQL（sql-generator.ts）
const sql = generateCreateTableSQL('projects');

// 3. 自動執行（db-init.ts）
await db.query(sql);
```

### 2. 類型安全

```typescript
// TypeScript 介面確保配置正確
interface ColumnDefinition {
  name: string;
  type: ColumnType | string;
  length?: number;
  // ... 其他屬性
}

// 編譯時檢查
const column: ColumnDefinition = {
  name: 'test',
  type: ColumnType.VARCHAR,
  length: 255,  // ✅ 正確
  // length: '255',  // ❌ 編譯錯誤
};
```

### 3. 集中管理

```typescript
// 所有資料表定義在一個文件
export const tableConfigs: TableConfig = {
  projects: { /* ... */ },
  project_index: { /* ... */ },
  users: { /* ... */ },
  mindmaps: { /* ... */ },
  trees: { /* ... */ },
  test: { /* ... */ },
};
```

---

## ✅ 驗證

### 檢查配置是否正確

```typescript
import { getTableConfig } from '../config/table.config.js';

// 1. 檢查資料表配置是否存在
const config = getTableConfig('projects');
console.log('配置存在:', !!config); // true

// 2. 檢查欄位數量
console.log('欄位數量:', config.columns.length); // 9

// 3. 檢查索引數量
console.log('索引數量:', config.indexes.length); // 3

// 4. 檢查觸發器
console.log('觸發器:', config.triggers); // ['update_projects_updated_at']
```

### 檢查 SQL 生成是否正確

```typescript
import { generateCreateTableSQL } from '../database/sql-generator.js';

const sql = generateCreateTableSQL('projects');
console.log(sql);

// 輸出應該包含：
// CREATE TABLE projects (
//   id SERIAL PRIMARY KEY,
//   uuid UUID UNIQUE DEFAULT uuid_generate_v4(),
//   ...
// )
```

---

## 🚀 使用建議

### 1. 修改資料表結構時

```
步驟 1: 修改 table.config.ts 中的配置
步驟 2: 刪除舊資料表（如果需要）
步驟 3: 重新啟動應用程式或呼叫初始化
步驟 4: 驗證資料表結構
```

### 2. 新增資料表時

```
步驟 1: 在 table.config.ts 中新增配置
步驟 2: 呼叫 initializeDatabase(db, ['new_table'])
步驟 3: 驗證資料表已建立
步驟 4: 更新相關文件
```

### 3. 查詢資料表資訊時

```typescript
// 使用輔助函數
import {
  getTableConfig,
  getAllTableNames,
  getTableColumns,
  getPrimaryKeyColumn,
} from '../config/table.config.js';

// 而不是直接查詢資料庫
```

---

## 📚 相關文件

- ✅ **table-config-architecture.md** - table.config.ts 完整架構說明（新建）
- ✅ **db-init-guide.md** - 資料庫初始化使用指南（更新）
- ✅ **project-index-guide.md** - project_index 表完整指南
- ✅ **project-index-quickref.md** - 快速參考
- ✅ **UPDATE-2025-10-08-project-index.md** - 更新記錄

---

## 🎉 總結

本次更新明確說明了 `table.config.ts` 在整個資料庫系統中的核心角色：

✅ **單一真相來源** - 所有表定義的唯一來源  
✅ **配置驅動** - 配置即程式碼，自動化程度高  
✅ **類型安全** - TypeScript 保證配置正確  
✅ **易於維護** - 集中管理，修改方便  
✅ **文件完善** - 配置即文件，清楚易懂  

**記住**：初始化時，projects 表的格式和索引可由 `table.config.ts` 中取得！
