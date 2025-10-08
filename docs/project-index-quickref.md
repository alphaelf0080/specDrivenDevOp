# Project Index 快速參考

## 🎮 專案索引資料表 (project_index)

專為 Slot 遊戲專案設計的完整索引系統。

---

## 📦 快速開始

### 1. 建立資料表

```bash
npm run db:create-tables
```

### 2. 查看範例

```bash
npm run db:project-index-examples
```

### 3. 匯出 SQL

```bash
npm run db:export-sql
```

---

## 🏗️ 資料表結構速覽

| 類別 | 主要欄位 |
|------|---------|
| **基本資訊** | game_id, game_name_en, game_name_cn, description |
| **Slot 特性** | reel_count, payline_count, rtp, volatility, max_win_multiplier |
| **功能特性** | has_free_spin, has_bonus_game, has_wild, has_scatter, has_multiplier |
| **開發管理** | dev_status, dev_progress, release_version, release_date |
| **技術規格** | platform_support, screen_orientation, supported_languages, tech_stack |
| **資產路徑** | thumbnail_url, banner_url, psd_file_path, asset_folder_path |
| **JSONB 資料** | features, symbols, paytable, game_config, metadata |
| **分類標籤** | tags, category, theme |

---

## 🚀 常用操作

### 新增遊戲

```typescript
import { generateInsertSQL } from './server/database/sql-generator.js';
import { getDatabase } from './server/database/db.js';

const db = getDatabase();
await db.connect();

const game = {
  game_id: 'BFG_001',
  game_name_en: 'Buffalo Fury',
  game_name_cn: '狂暴水牛',
  game_type: 'slot',
  reel_count: 5,
  row_count: 4,
  payline_count: 1024,
  rtp: 96.50,
  volatility: 'high',
  has_free_spin: true,
  has_wild: true,
  max_win_multiplier: 5000,
};

const query = generateInsertSQL('project_index', game);
const result = await db.query(query.sql, query.params);
```

### 查詢遊戲列表

```typescript
const query = generateSelectSQL('project_index', {
  columns: ['game_id', 'game_name_en', 'game_name_cn', 'rtp'],
  where: {
    game_type: 'slot',
    is_active: true,
  },
  orderBy: 'rtp DESC',
  limit: 10,
});
```

### 更新開發進度

```typescript
const query = generateUpdateSQL('project_index',
  { dev_progress: 75, dev_status: 'testing' },
  { game_id: 'BFG_001' }
);
```

---

## 📊 重要欄位說明

### 遊戲識別

```typescript
game_id: 'BFG_001'              // 唯一識別碼
game_name_en: 'Buffalo Fury'    // 英文名
game_name_cn: '狂暴水牛'         // 中文名
```

### Slot 配置

```typescript
reel_count: 5                   // 轉軸數（3, 5, 6）
row_count: 4                    // 行數（3, 4, 5）
payline_count: 1024             // 支付線（20, 243, 1024）
```

### 功能特性

```typescript
has_free_spin: true             // 免費旋轉
has_wild: true                  // Wild 符號
has_scatter: true               // Scatter 符號
has_multiplier: true            // 倍數功能
has_bonus_game: true            // Bonus 遊戲
```

### 數值指標

```typescript
rtp: 96.50                      // 返還率 (%)
max_win_multiplier: 5000.00     // 最大贏分倍數
min_bet: 0.20                   // 最小投注額
max_bet: 100.00                 // 最大投注額
```

### 開發狀態

```typescript
dev_status: 'planning'          // 狀態
dev_progress: 45                // 進度 (0-100)
release_version: 'v1.0.0'       // 版本號
release_date: '2025-12-31'      // 發布日期
```

### JSONB 資料

```typescript
// 平台支援
platform_support: {
  mobile: true,
  desktop: true,
  tablet: true
}

// 支援語言
supported_languages: ['en', 'zh-CN', 'zh-TW']

// 特色功能
features: [
  'Free Spins',
  'Multiplier',
  'Wild Symbol'
]

// 標籤
tags: ['popular', 'high_volatility', 'new']
```

---

## 🔍 常用查詢

### 1. 精選遊戲

```sql
SELECT game_id, game_name_en, thumbnail_url, rtp
FROM project_index
WHERE is_featured = true AND is_active = true
ORDER BY sort_order ASC
LIMIT 10;
```

### 2. 高 RTP 遊戲

```sql
SELECT game_id, game_name_en, rtp, max_win_multiplier
FROM project_index
WHERE is_active = true AND rtp >= 96.00
ORDER BY rtp DESC;
```

### 3. 按主題分類

```sql
SELECT theme, COUNT(*) as count
FROM project_index
WHERE is_active = true
GROUP BY theme
ORDER BY count DESC;
```

### 4. 開發中的專案

```sql
SELECT game_id, game_name_en, dev_status, dev_progress
FROM project_index
WHERE dev_status IN ('planning', 'in_progress')
ORDER BY dev_progress DESC;
```

### 5. 搜尋關鍵字

```sql
SELECT game_id, game_name_en, game_name_cn
FROM project_index
WHERE 
  search_key ILIKE '%buffalo%'
  OR game_name_en ILIKE '%buffalo%'
  OR game_name_cn ILIKE '%buffalo%';
```

### 6. JSONB 查詢（支援手機）

```sql
SELECT game_id, game_name_en, platform_support
FROM project_index
WHERE platform_support->>'mobile' = 'true';
```

---

## 📋 開發狀態枚舉

| 狀態 | 說明 |
|------|------|
| `planning` | 規劃中 |
| `in_progress` | 開發中 |
| `testing` | 測試中 |
| `completed` | 已完成 |
| `published` | 已發布 |

---

## 🎯 波動性枚舉

| 值 | 說明 |
|----|------|
| `low` | 低波動 - 頻繁小獎 |
| `medium` | 中波動 - 平衡 |
| `high` | 高波動 - 罕見大獎 |

---

## 🎮 遊戲類型

| 類型 | 說明 |
|------|------|
| `slot` | 老虎機 |
| `video_slot` | 視訊老虎機 |
| `classic_slot` | 經典老虎機 |
| `table` | 桌遊 |
| `fishing` | 捕魚遊戲 |

---

## 💾 JSONB 欄位結構

### platform_support

```json
{
  "mobile": true,
  "desktop": true,
  "tablet": true
}
```

### supported_languages

```json
["en", "zh-CN", "zh-TW", "ja", "ko"]
```

### tech_stack

```json
{
  "engine": "Pixi.js",
  "framework": "React",
  "build_tool": "Vite"
}
```

### features

```json
[
  "Free Spins",
  "Multiplier",
  "Wild Symbol",
  "Scatter Symbol",
  "Bonus Game"
]
```

### symbols

```json
{
  "wild": {
    "name": "Wild Buffalo",
    "multiplier": 2
  },
  "scatter": {
    "name": "Gold Coin",
    "trigger_free_spins": 3
  }
}
```

### paytable

```json
{
  "high_symbols": [
    {"id": "buffalo", "5x": 500, "4x": 100, "3x": 20}
  ],
  "low_symbols": [
    {"id": "A", "5x": 100, "4x": 50, "3x": 10}
  ]
}
```

---

## ⚡ 索引優化

已建立的索引：

- ✅ `game_id` - 唯一索引
- ✅ `game_name_en` / `game_name_cn` - 名稱查詢
- ✅ `game_type` - 類型篩選
- ✅ `dev_status` - 狀態篩選
- ✅ `is_active` / `is_featured` - 布林篩選
- ✅ `sort_order` - 排序
- ✅ `search_key` - GIN 全文搜尋
- ✅ `tags` - GIN JSONB 查詢
- ✅ `features` - GIN JSONB 查詢

---

## 🛠️ 實用工具函數

### 取得資料表配置

```typescript
import { getTableConfig, getAllTableNames } from './server/config/table.config.js';

const config = getTableConfig('project_index');
const allTables = getAllTableNames();
```

### 資料驗證

```typescript
import { validateData } from './server/database/sql-generator.js';

const validation = validateData('project_index', gameData);
if (!validation.valid) {
  console.error('驗證失敗:', validation.errors);
}
```

---

## 📈 統計查詢範例

### 開發狀態統計

```sql
SELECT 
  dev_status,
  COUNT(*) as count,
  AVG(dev_progress) as avg_progress
FROM project_index
WHERE is_active = true
GROUP BY dev_status;
```

### 遊戲類型統計

```sql
SELECT 
  game_type,
  COUNT(*) as count,
  AVG(rtp) as avg_rtp,
  AVG(max_win_multiplier) as avg_max_win
FROM project_index
GROUP BY game_type;
```

### 主題分佈

```sql
SELECT 
  theme,
  COUNT(*) as count
FROM project_index
WHERE is_active = true
GROUP BY theme
ORDER BY count DESC;
```

---

## 🎨 完整範例

```typescript
// 1. 建立完整的遊戲專案
const completeGame = {
  // 基本資訊
  game_id: 'BFG_001',
  game_name_en: 'Buffalo Fury',
  game_name_cn: '狂暴水牛',
  search_key: '水牛,buffalo,fury,狂暴,動物,野生,西部',
  description: '一款以美國西部野牛為主題的高波動性 5x4 slot 遊戲',
  
  // Slot 特性
  game_type: 'slot',
  reel_count: 5,
  row_count: 4,
  payline_count: 1024,
  has_free_spin: true,
  has_bonus_game: false,
  has_wild: true,
  has_scatter: true,
  has_multiplier: true,
  max_win_multiplier: 5000,
  rtp: 96.50,
  volatility: 'high',
  theme: '美國西部野牛',
  min_bet: 0.20,
  max_bet: 100.00,
  
  // 資產路徑
  thumbnail_url: '/assets/games/bfg/thumb.png',
  banner_url: '/assets/games/bfg/banner.jpg',
  preview_video_url: '/assets/games/bfg/preview.mp4',
  asset_folder_path: '/assets/games/bfg/',
  psd_file_path: '/designs/bfg/main.psd',
  
  // 開發狀態
  dev_status: 'in_progress',
  dev_progress: 65,
  release_version: 'v1.0.0',
  release_date: '2025-12-31',
  
  // 技術規格
  platform_support: JSON.stringify({
    mobile: true,
    desktop: true,
    tablet: true
  }),
  screen_orientation: 'landscape',
  supported_languages: JSON.stringify(['en', 'zh-CN', 'zh-TW', 'ja', 'ko']),
  tech_stack: JSON.stringify({
    engine: 'Pixi.js',
    framework: 'React',
    build_tool: 'Vite'
  }),
  
  // 額外資料
  features: JSON.stringify([
    'Free Spins',
    'Progressive Multiplier',
    'Wild Symbol',
    'Scatter Symbol',
    '1024 Ways to Win',
    'Buy Feature'
  ]),
  tags: JSON.stringify(['popular', 'high_volatility', 'animal_theme', 'new']),
  category: 'video_slot',
  
  // 排序與狀態
  sort_order: 1,
  is_active: true,
  is_featured: true,
};

// 2. 插入資料庫
const db = getDatabase();
await db.connect();

const query = generateInsertSQL('project_index', completeGame);
const result = await db.query(query.sql, query.params);

console.log('建立成功:', result.rows[0]);

await db.disconnect();
```

---

## 📚 相關文件

- **詳細指南**: `docs/project-index-guide.md`
- **完整範例**: `server/database/project-index-examples.ts`
- **Table Config**: `server/config/table.config.ts`
- **SQL Generator**: `server/database/sql-generator.ts`

---

## 🎉 總結

`project_index` 提供完整的 Slot 遊戲專案管理：

✅ **48 個欄位** - 涵蓋所有遊戲資訊
✅ **13 個索引** - 優化查詢效能
✅ **5 個 JSONB** - 彈性擴展能力
✅ **類型安全** - TypeScript 支援
✅ **自動化** - SQL 自動生成

立即開始使用：`npm run db:create-tables` 🚀
