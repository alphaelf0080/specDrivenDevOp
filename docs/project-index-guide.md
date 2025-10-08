# 專案索引資料表 (project_index) 使用指南

## 📋 目錄

- [概述](#概述)
- [資料表結構](#資料表結構)
- [欄位說明](#欄位說明)
- [使用範例](#使用範例)
- [最佳實踐](#最佳實踐)
- [常見查詢](#常見查詢)

---

## 概述

`project_index` 是一個專為 Slot 遊戲專案設計的索引資料表，用於管理所有遊戲專案的基本資訊、技術規格、開發狀態等。

### 主要功能

✅ **遊戲基本資訊管理** - 遊戲 ID、英文名、中文名、描述
✅ **Slot 遊戲特性** - 轉軸數、支付線、RTP、波動性等
✅ **功能特性追蹤** - Wild、Scatter、Free Spin、Bonus 等
✅ **開發狀態管理** - 開發進度、狀態、版本、發布日期
✅ **技術規格** - 支援平台、螢幕方向、語言、技術堆疊
✅ **資產管理** - 縮圖、Banner、影片、PSD 檔案路徑
✅ **彈性擴展** - JSONB 欄位儲存額外配置和元資料
✅ **搜尋與分類** - 關鍵字搜尋、標籤、分類

---

## 資料表結構

### 資料表概覽

| 類別 | 欄位數量 | 說明 |
|------|---------|------|
| **基本資訊** | 6 | 遊戲 ID、名稱、描述、搜尋關鍵字 |
| **Slot 特性** | 14 | 轉軸、支付線、RTP、功能特性 |
| **資產路徑** | 5 | 圖片、影片、PSD 檔案路徑 |
| **開發管理** | 5 | 狀態、進度、版本、發布日期 |
| **技術規格** | 4 | 平台、方向、語言、技術堆疊 |
| **額外資料** | 5 | Features、Symbols、Paytable 等 JSONB |
| **分類標籤** | 3 | 標籤、分類、負責人 |
| **系統欄位** | 6 | 時間戳記、排序、啟用狀態 |
| **總計** | **48** | - |

### 索引策略

```typescript
indexes: [
  // 唯一索引
  { name: 'idx_project_index_game_id', columns: ['game_id'], unique: true },
  
  // 一般索引（查詢優化）
  { name: 'idx_project_index_game_name_en', columns: ['game_name_en'] },
  { name: 'idx_project_index_game_name_cn', columns: ['game_name_cn'] },
  { name: 'idx_project_index_game_type', columns: ['game_type'] },
  { name: 'idx_project_index_dev_status', columns: ['dev_status'] },
  { name: 'idx_project_index_category', columns: ['category'] },
  { name: 'idx_project_index_is_active', columns: ['is_active'] },
  { name: 'idx_project_index_sort_order', columns: ['sort_order'] },
  { name: 'idx_project_index_owner_id', columns: ['owner_id'] },
  
  // GIN 索引（全文搜尋和 JSONB）
  { name: 'idx_project_index_search_key', columns: ['search_key'], type: 'GIN' },
  { name: 'idx_project_index_tags', columns: ['tags'], type: 'GIN' },
  { name: 'idx_project_index_features', columns: ['features'], type: 'GIN' },
  { name: 'idx_project_index_metadata', columns: ['metadata'], type: 'GIN' },
]
```

---

## 欄位說明

### 1. 基本資訊欄位

| 欄位名稱 | 類型 | 必填 | 說明 | 範例 |
|---------|------|------|------|------|
| `id` | SERIAL | ✅ | 主鍵，自動遞增 | 1 |
| `game_id` | VARCHAR(100) | ✅ | 遊戲唯一識別碼 | BFG_001 |
| `game_name_en` | VARCHAR(255) | ✅ | 遊戲英文名稱 | Buffalo Fury |
| `game_name_cn` | VARCHAR(255) | ✅ | 遊戲中文名稱 | 狂暴水牛 |
| `search_key` | TEXT | - | 搜尋關鍵字（逗號分隔） | 水牛,buffalo,fury |
| `description` | TEXT | - | 遊戲描述 | 一款以美國西部... |

### 2. Slot 遊戲特性欄位

| 欄位名稱 | 類型 | 預設 | 說明 | 範例 |
|---------|------|------|------|------|
| `game_type` | VARCHAR(50) | slot | 遊戲類型 | slot, table, fishing |
| `reel_count` | INTEGER | - | 轉軸數量 | 3, 5, 6 |
| `row_count` | INTEGER | - | 行數 | 3, 4, 5 |
| `payline_count` | INTEGER | - | 支付線數量 | 20, 243, 1024 |
| `has_free_spin` | BOOLEAN | false | 是否有免費旋轉 | true, false |
| `has_bonus_game` | BOOLEAN | false | 是否有 Bonus 遊戲 | true, false |
| `has_wild` | BOOLEAN | false | 是否有 Wild 符號 | true, false |
| `has_scatter` | BOOLEAN | false | 是否有 Scatter 符號 | true, false |
| `has_multiplier` | BOOLEAN | false | 是否有倍數功能 | true, false |
| `max_win_multiplier` | DECIMAL(10,2) | - | 最大贏分倍數 | 5000.00 |
| `rtp` | DECIMAL(5,2) | - | 返還率（%） | 96.50 |
| `volatility` | VARCHAR(20) | - | 波動性 | low, medium, high |
| `theme` | VARCHAR(100) | - | 遊戲主題 | 古埃及, 水果, 動物 |
| `min_bet` | DECIMAL(10,2) | - | 最小投注額 | 0.20 |
| `max_bet` | DECIMAL(10,2) | - | 最大投注額 | 100.00 |

### 3. 資產相關欄位

| 欄位名稱 | 類型 | 說明 | 範例 |
|---------|------|------|------|
| `thumbnail_url` | TEXT | 縮圖 URL | /assets/games/bfg/thumb.png |
| `banner_url` | TEXT | Banner 圖片 URL | /assets/games/bfg/banner.jpg |
| `preview_video_url` | TEXT | 預覽影片 URL | /assets/games/bfg/preview.mp4 |
| `asset_folder_path` | TEXT | 資產資料夾路徑 | /assets/games/bfg/ |
| `psd_file_path` | TEXT | PSD 檔案路徑 | /designs/bfg/main.psd |

### 4. 開發狀態欄位

| 欄位名稱 | 類型 | 預設 | 說明 | 可選值 |
|---------|------|------|------|--------|
| `dev_status` | VARCHAR(50) | planning | 開發狀態 | planning, in_progress, testing, completed, published |
| `dev_progress` | INTEGER | 0 | 開發進度（0-100） | 0, 25, 50, 75, 100 |
| `release_version` | VARCHAR(50) | - | 發布版本號 | v1.0.0, v2.1.3 |
| `release_date` | DATE | - | 發布日期 | 2025-12-31 |
| `dev_team` | JSONB | - | 開發團隊成員 | [{"id": 1, "role": "developer"}] |

### 5. 技術規格欄位（JSONB）

| 欄位名稱 | 類型 | 說明 | JSON 範例 |
|---------|------|------|-----------|
| `platform_support` | JSONB | 支援平台 | `{"mobile": true, "desktop": true}` |
| `screen_orientation` | VARCHAR(50) | 螢幕方向 | landscape, portrait, both |
| `supported_languages` | JSONB | 支援語言 | `["en", "zh-CN", "zh-TW"]` |
| `tech_stack` | JSONB | 技術堆疊 | `{"engine": "Pixi.js", "framework": "React"}` |

### 6. 額外資料欄位（JSONB）

| 欄位名稱 | 類型 | 說明 | 用途 |
|---------|------|------|------|
| `features` | JSONB | 特色功能列表 | 儲存遊戲特色功能 |
| `symbols` | JSONB | 符號列表及配置 | 儲存所有遊戲符號資訊 |
| `paytable` | JSONB | 賠付表 | 儲存賠付規則 |
| `game_config` | JSONB | 遊戲完整配置 | 儲存遊戲設定 |
| `metadata` | JSONB | 額外元資料 | 彈性擴展欄位 |

### 7. 分類與標籤

| 欄位名稱 | 類型 | 說明 | 範例 |
|---------|------|------|------|
| `tags` | JSONB | 標籤 | `["popular", "new", "hot"]` |
| `category` | VARCHAR(100) | 分類 | video_slot, classic_slot |
| `owner_id` | INTEGER | 專案負責人 ID | 1 (外鍵 → users) |

### 8. 系統欄位

| 欄位名稱 | 類型 | 預設 | 說明 |
|---------|------|------|------|
| `created_at` | TIMESTAMP | CURRENT_TIMESTAMP | 建立時間 |
| `updated_at` | TIMESTAMP | CURRENT_TIMESTAMP | 更新時間 |
| `deleted_at` | TIMESTAMP | - | 刪除時間（軟刪除） |
| `sort_order` | INTEGER | 0 | 排序順序 |
| `is_active` | BOOLEAN | true | 是否啟用 |
| `is_featured` | BOOLEAN | false | 是否精選 |

---

## 使用範例

### 1. 建立新遊戲專案

```typescript
import { generateInsertSQL } from './server/database/sql-generator.js';
import { getDatabase } from './server/database/db.js';

const db = getDatabase();
await db.connect();

const gameData = {
  game_id: 'BFG_001',
  game_name_en: 'Buffalo Fury',
  game_name_cn: '狂暴水牛',
  search_key: '水牛,buffalo,fury,狂暴,動物',
  description: '一款以美國西部野牛為主題的 5x4 slot 遊戲',
  game_type: 'slot',
  reel_count: 5,
  row_count: 4,
  payline_count: 1024,
  has_free_spin: true,
  has_wild: true,
  has_scatter: true,
  has_multiplier: true,
  max_win_multiplier: 5000,
  rtp: 96.50,
  volatility: 'high',
  theme: '美國西部野牛',
  min_bet: 0.20,
  max_bet: 100.00,
  dev_status: 'planning',
  platform_support: JSON.stringify({
    mobile: true,
    desktop: true,
    tablet: true
  }),
  supported_languages: JSON.stringify(['en', 'zh-CN', 'zh-TW']),
  features: JSON.stringify([
    'Free Spins',
    'Multiplier',
    'Wild Symbol',
    '1024 Ways to Win'
  ]),
  tags: JSON.stringify(['popular', 'high_volatility']),
  category: 'video_slot',
  is_featured: true,
};

const query = generateInsertSQL('project_index', gameData);
const result = await db.query(query.sql, query.params);

console.log('建立成功:', result.rows[0]);
await db.disconnect();
```

### 2. 查詢所有 Slot 遊戲

```typescript
import { generateSelectSQL } from './server/database/sql-generator.js';

const query = generateSelectSQL('project_index', {
  columns: ['game_id', 'game_name_en', 'game_name_cn', 'rtp', 'dev_status'],
  where: {
    game_type: 'slot',
    is_active: true,
  },
  orderBy: 'sort_order ASC, created_at DESC',
  limit: 20,
});

const result = await db.query(query.sql, query.params);
console.log(`找到 ${result.rowCount} 個遊戲`);
```

### 3. 搜尋高波動性且有免費旋轉的遊戲

```typescript
const query = generateSelectSQL('project_index', {
  columns: ['game_id', 'game_name_en', 'game_name_cn', 'rtp', 'max_win_multiplier'],
  where: {
    volatility: 'high',
    has_free_spin: true,
    is_active: true,
  },
  orderBy: 'rtp DESC',
  limit: 10,
});

const result = await db.query(query.sql, query.params);
```

### 4. 更新開發進度

```typescript
import { generateUpdateSQL } from './server/database/sql-generator.js';

const query = generateUpdateSQL('project_index', 
  {
    dev_progress: 75,
    dev_status: 'testing',
  },
  {
    game_id: 'BFG_001',
  }
);

const result = await db.query(query.sql, query.params);
console.log('更新成功:', result.rows[0]);
```

### 5. 查詢支援手機平台的遊戲（JSONB 查詢）

```sql
SELECT 
  game_id,
  game_name_en,
  game_name_cn,
  platform_support
FROM project_index
WHERE 
  platform_support->>'mobile' = 'true'
  AND is_active = true
ORDER BY created_at DESC;
```

### 6. 使用標籤搜尋（GIN 索引）

```sql
-- 搜尋包含 'popular' 標籤的遊戲
SELECT 
  game_id,
  game_name_en,
  tags
FROM project_index
WHERE 
  tags @> '["popular"]'::jsonb
  AND is_active = true;
```

### 7. 批次插入多個遊戲

```typescript
const games = [
  {
    game_id: 'FRUIT_001',
    game_name_en: 'Fruit Paradise',
    game_name_cn: '水果天堂',
    game_type: 'slot',
    reel_count: 3,
    row_count: 3,
  },
  {
    game_id: 'EGYPT_001',
    game_name_en: 'Pharaoh Gold',
    game_name_cn: '法老黃金',
    game_type: 'slot',
    reel_count: 5,
    row_count: 4,
  },
];

const results = await db.batchInsert('project_index', games);
console.log(`批次插入 ${results.length} 個遊戲`);
```

---

## 最佳實踐

### 1. 遊戲 ID 命名規範

```typescript
// ✅ 好的命名
game_id: 'BFG_001'     // Buffalo Fury Game
game_id: 'EGYPT_001'   // Egypt Theme
game_id: 'FRUIT_001'   // Fruit Theme

// ❌ 避免
game_id: 'game1'
game_id: '遊戲001'
```

### 2. RTP 和倍數使用 DECIMAL

```typescript
// ✅ 好的做法
rtp: 96.50              // DECIMAL(5,2)
max_win_multiplier: 5000.00  // DECIMAL(10,2)

// ❌ 避免
rtp: "96.5%"
max_win_multiplier: "5000x"
```

### 3. JSONB 欄位結構化

```typescript
// ✅ 好的結構
platform_support: JSON.stringify({
  mobile: true,
  desktop: true,
  tablet: true
})

features: JSON.stringify([
  'Free Spins',
  'Multiplier',
  'Wild Symbol'
])

// ❌ 避免
platform_support: "mobile, desktop"
features: "Free Spins, Multiplier"
```

### 4. 搜尋關鍵字最佳化

```typescript
// ✅ 包含多語言和同義詞
search_key: '水牛,buffalo,fury,狂暴,動物,animal,野牛,bison'

// ❌ 太少
search_key: 'buffalo'
```

### 5. 開發狀態一致性

```typescript
// ✅ 使用標準值
dev_status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'published'

// ❌ 自訂值
dev_status: 'doing' | 'finish'
```

---

## 常見查詢

### 1. 儀表板統計

```sql
-- 開發狀態統計
SELECT 
  dev_status,
  COUNT(*) as count,
  AVG(dev_progress) as avg_progress
FROM project_index
WHERE is_active = true
GROUP BY dev_status
ORDER BY count DESC;

-- 遊戲類型統計
SELECT 
  game_type,
  COUNT(*) as count,
  AVG(rtp) as avg_rtp
FROM project_index
WHERE is_active = true
GROUP BY game_type;
```

### 2. 精選遊戲列表

```sql
SELECT 
  game_id,
  game_name_en,
  game_name_cn,
  thumbnail_url,
  rtp,
  max_win_multiplier
FROM project_index
WHERE 
  is_featured = true 
  AND is_active = true
ORDER BY sort_order ASC
LIMIT 10;
```

### 3. 高 RTP 遊戲排行

```sql
SELECT 
  game_id,
  game_name_en,
  rtp,
  volatility,
  max_win_multiplier
FROM project_index
WHERE 
  is_active = true 
  AND rtp IS NOT NULL
ORDER BY rtp DESC
LIMIT 20;
```

### 4. 即將發布的遊戲

```sql
SELECT 
  game_id,
  game_name_en,
  game_name_cn,
  dev_status,
  dev_progress,
  release_date
FROM project_index
WHERE 
  dev_status IN ('testing', 'completed')
  AND is_active = true
ORDER BY release_date ASC;
```

### 5. 關鍵字搜尋（全文搜尋）

```sql
SELECT 
  game_id,
  game_name_en,
  game_name_cn,
  theme
FROM project_index
WHERE 
  to_tsvector('english', search_key) @@ to_tsquery('english', 'buffalo | 水牛')
  AND is_active = true;
```

### 6. 功能特性篩選

```sql
-- 有 Free Spin 和 Multiplier 的遊戲
SELECT 
  game_id,
  game_name_en,
  has_free_spin,
  has_multiplier,
  max_win_multiplier
FROM project_index
WHERE 
  has_free_spin = true 
  AND has_multiplier = true
  AND is_active = true
ORDER BY max_win_multiplier DESC;
```

### 7. 按主題分類

```sql
SELECT 
  theme,
  COUNT(*) as game_count,
  AVG(rtp) as avg_rtp
FROM project_index
WHERE is_active = true
GROUP BY theme
ORDER BY game_count DESC;
```

### 8. 我的專案（負責人）

```sql
SELECT 
  pi.game_id,
  pi.game_name_en,
  pi.dev_status,
  pi.dev_progress,
  u.username as owner_name
FROM project_index pi
LEFT JOIN users u ON pi.owner_id = u.id
WHERE 
  pi.owner_id = $1
  AND pi.is_active = true
ORDER BY pi.updated_at DESC;
```

---

## 資料驗證

### 必填欄位檢查

```typescript
import { validateData } from './server/database/sql-generator.js';

const gameData = {
  game_id: 'BFG_001',
  game_name_en: 'Buffalo Fury',
  game_name_cn: '狂暴水牛',
  // ... 其他欄位
};

const validation = validateData('project_index', gameData);
if (!validation.valid) {
  console.error('驗證失敗:', validation.errors);
}
```

### 資料型別檢查

```typescript
// RTP 應該在 0-100 之間
if (gameData.rtp < 0 || gameData.rtp > 100) {
  throw new Error('RTP 必須在 0-100 之間');
}

// 開發進度應該在 0-100 之間
if (gameData.dev_progress < 0 || gameData.dev_progress > 100) {
  throw new Error('開發進度必須在 0-100 之間');
}

// 轉軸數量應該是正整數
if (gameData.reel_count < 1) {
  throw new Error('轉軸數量必須大於 0');
}
```

---

## 效能優化

### 1. 使用索引

所有常用查詢欄位都已建立索引，確保查詢效能。

### 2. JSONB 欄位使用 GIN 索引

```sql
-- GIN 索引已建立於：
-- tags, features, metadata
```

### 3. 分頁查詢

```typescript
const query = generateSelectSQL('project_index', {
  columns: ['game_id', 'game_name_en'],
  where: { is_active: true },
  orderBy: 'created_at DESC',
  limit: 20,
  offset: 0,  // 第一頁
});
```

### 4. 只查詢需要的欄位

```typescript
// ✅ 好的做法
columns: ['game_id', 'game_name_en', 'rtp']

// ❌ 避免
columns: ['*']  // 查詢所有欄位
```

---

## 遷移與維護

### 建立資料表

```bash
# 自動建立所有資料表
npm run db:create-tables
```

### 匯出 SQL

```bash
# 匯出 SQL（不執行）
npm run db:export-sql > schema.sql
```

### 備份資料

```bash
# 使用 pg_dump
pg_dump -h localhost -U postgres -d your_database -t project_index > backup.sql
```

---

## 相關文件

- **使用範例**: `server/database/project-index-examples.ts`
- **Table Config**: `server/config/table.config.ts`
- **SQL Generator**: `server/database/sql-generator.ts`
- **Database Module**: `server/database/db.ts`

---

## 總結

`project_index` 資料表提供了完整的 Slot 遊戲專案管理功能：

✅ **48 個欄位** 涵蓋所有需求
✅ **13 個索引** 確保查詢效能
✅ **5 個 JSONB 欄位** 提供彈性擴展
✅ **類型安全** TypeScript 定義
✅ **自動化工具** SQL 生成器

可以立即開始使用此資料表管理您的遊戲專案！🎮
