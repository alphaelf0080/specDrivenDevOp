/**
 * 資料表配置檔案
 * 
 * 定義資料庫中所有資料表的結構，包含資料表名稱、欄位定義、索引等
 * 用於自動建立資料表和生成查詢
 */

/**
 * 欄位資料型別
 */
export enum ColumnType {
  // 數字類型
  SERIAL = 'SERIAL',
  INTEGER = 'INTEGER',
  BIGINT = 'BIGINT',
  DECIMAL = 'DECIMAL',
  NUMERIC = 'NUMERIC',
  REAL = 'REAL',
  DOUBLE_PRECISION = 'DOUBLE PRECISION',
  
  // 字串類型
  VARCHAR = 'VARCHAR',
  CHAR = 'CHAR',
  TEXT = 'TEXT',
  
  // 布林類型
  BOOLEAN = 'BOOLEAN',
  
  // 日期時間類型
  DATE = 'DATE',
  TIME = 'TIME',
  TIMESTAMP = 'TIMESTAMP',
  TIMESTAMP_WITH_TIMEZONE = 'TIMESTAMP WITH TIME ZONE',
  
  // JSON 類型
  JSON = 'JSON',
  JSONB = 'JSONB',
  
  // 其他類型
  UUID = 'UUID',
  INET = 'INET',
  ARRAY = 'ARRAY',
}

/**
 * 欄位定義介面
 */
export interface ColumnDefinition {
  name: string;                    // 欄位名稱
  type: ColumnType | string;       // 資料型別
  length?: number;                 // 長度（如 VARCHAR(255)）
  precision?: number;              // 精度（DECIMAL 用）
  scale?: number;                  // 小數位數（DECIMAL 用）
  primaryKey?: boolean;            // 是否為主鍵
  unique?: boolean;                // 是否唯一
  notNull?: boolean;               // 是否不可為 NULL
  default?: string | number | boolean;  // 預設值
  references?: {                   // 外鍵參考
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
  autoIncrement?: boolean;         // 是否自動遞增
  comment?: string;                // 欄位註解
}

/**
 * 索引定義介面
 */
export interface IndexDefinition {
  name: string;                    // 索引名稱
  columns: string[];               // 索引欄位
  unique?: boolean;                // 是否唯一索引
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';  // 索引類型
  where?: string;                  // 部分索引條件
}

/**
 * 資料表定義介面
 */
export interface TableDefinition {
  name: string;                    // 資料表名稱
  schema?: string;                 // Schema 名稱（預設 public）
  columns: ColumnDefinition[];     // 欄位定義
  indexes?: IndexDefinition[];     // 索引定義
  triggers?: string[];             // 觸發器
  comment?: string;                // 資料表註解
}

/**
 * 資料表配置集合
 */
export interface TableConfig {
  [tableName: string]: TableDefinition;
}

/**
 * 預設資料表配置
 */
export const tableConfigs: TableConfig = {
  // 使用者資料表
  users: {
    name: 'users',
    comment: '使用者資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '使用者 ID',
      },
      {
        name: 'uuid',
        type: ColumnType.UUID,
        unique: true,
        default: 'uuid_generate_v4()',
        comment: 'UUID',
      },
      {
        name: 'username',
        type: ColumnType.VARCHAR,
        length: 50,
        unique: true,
        notNull: true,
        comment: '使用者名稱',
      },
      {
        name: 'email',
        type: ColumnType.VARCHAR,
        length: 255,
        unique: true,
        notNull: true,
        comment: '電子郵件',
      },
      {
        name: 'password_hash',
        type: ColumnType.VARCHAR,
        length: 255,
        comment: '密碼雜湊',
      },
      {
        name: 'active',
        type: ColumnType.BOOLEAN,
        default: true,
        comment: '是否啟用',
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
        comment: '建立時間',
      },
      {
        name: 'updated_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        comment: '更新時間',
      },
      {
        name: 'deleted_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        comment: '刪除時間（軟刪除）',
      },
    ],
    indexes: [
      { name: 'idx_users_email', columns: ['email'] },
      { name: 'idx_users_username', columns: ['username'] },
      { name: 'idx_users_active', columns: ['active'] },
    ],
    triggers: ['update_users_updated_at'],
  },

  // 專案索引資料表（遊戲專案）
  project_index: {
    name: 'project_index',
    comment: '專案索引資料表 - 遊戲專案列表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '專案索引 ID',
      },
      {
        name: 'game_id',
        type: ColumnType.VARCHAR,
        length: 100,
        unique: true,
        notNull: true,
        comment: '遊戲唯一識別碼（例如：BFG_001）',
      },
      {
        name: 'game_name_en',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '遊戲英文名稱',
      },
      {
        name: 'game_name_cn',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '遊戲中文名稱',
      },
      {
        name: 'search_key',
        type: ColumnType.TEXT,
        comment: '搜尋關鍵字（多個關鍵字以逗號分隔）',
      },
      {
        name: 'description',
        type: ColumnType.TEXT,
        comment: '遊戲描述',
      },
      // Slot Game 相關欄位
      {
        name: 'game_type',
        type: ColumnType.VARCHAR,
        length: 50,
        default: "'slot'",
        comment: '遊戲類型（slot, table, fishing, etc.）',
      },
      {
        name: 'reel_count',
        type: ColumnType.INTEGER,
        comment: '轉軸數量（3, 5, 6 等）',
      },
      {
        name: 'row_count',
        type: ColumnType.INTEGER,
        comment: '行數（通常 3-5 行）',
      },
      {
        name: 'payline_count',
        type: ColumnType.INTEGER,
        comment: '支付線數量',
      },
      {
        name: 'has_free_spin',
        type: ColumnType.BOOLEAN,
        default: false,
        comment: '是否有免費旋轉功能',
      },
      {
        name: 'has_bonus_game',
        type: ColumnType.BOOLEAN,
        default: false,
        comment: '是否有 Bonus 遊戲',
      },
      {
        name: 'has_wild',
        type: ColumnType.BOOLEAN,
        default: false,
        comment: '是否有 Wild 符號',
      },
      {
        name: 'has_scatter',
        type: ColumnType.BOOLEAN,
        default: false,
        comment: '是否有 Scatter 符號',
      },
      {
        name: 'has_multiplier',
        type: ColumnType.BOOLEAN,
        default: false,
        comment: '是否有倍數功能',
      },
      {
        name: 'max_win_multiplier',
        type: ColumnType.DECIMAL,
        precision: 10,
        scale: 2,
        comment: '最大贏分倍數（例如：5000x）',
      },
      {
        name: 'rtp',
        type: ColumnType.DECIMAL,
        precision: 5,
        scale: 2,
        comment: 'RTP 返還率（例如：96.50）',
      },
      {
        name: 'volatility',
        type: ColumnType.VARCHAR,
        length: 20,
        comment: '波動性（low, medium, high）',
      },
      {
        name: 'theme',
        type: ColumnType.VARCHAR,
        length: 100,
        comment: '遊戲主題（例如：古埃及、水果、動物）',
      },
      {
        name: 'min_bet',
        type: ColumnType.DECIMAL,
        precision: 10,
        scale: 2,
        comment: '最小投注額',
      },
      {
        name: 'max_bet',
        type: ColumnType.DECIMAL,
        precision: 10,
        scale: 2,
        comment: '最大投注額',
      },
      // 資產相關
      {
        name: 'thumbnail_url',
        type: ColumnType.TEXT,
        comment: '縮圖 URL',
      },
      {
        name: 'banner_url',
        type: ColumnType.TEXT,
        comment: 'Banner 圖片 URL',
      },
      {
        name: 'preview_video_url',
        type: ColumnType.TEXT,
        comment: '預覽影片 URL',
      },
      {
        name: 'asset_folder_path',
        type: ColumnType.TEXT,
        comment: '資產資料夾路徑',
      },
      {
        name: 'psd_file_path',
        type: ColumnType.TEXT,
        comment: 'PSD 檔案路徑',
      },
      // 開發狀態
      {
        name: 'dev_status',
        type: ColumnType.VARCHAR,
        length: 50,
        default: "'planning'",
        comment: '開發狀態（planning, in_progress, testing, completed, published）',
      },
      {
        name: 'dev_progress',
        type: ColumnType.INTEGER,
        default: 0,
        comment: '開發進度（0-100）',
      },
      {
        name: 'release_version',
        type: ColumnType.VARCHAR,
        length: 50,
        comment: '發布版本號（例如：v1.0.0）',
      },
      {
        name: 'release_date',
        type: ColumnType.DATE,
        comment: '發布日期',
      },
      // 技術規格
      {
        name: 'platform_support',
        type: ColumnType.JSONB,
        comment: '支援平台（JSON：{mobile: true, desktop: true, tablet: true}）',
      },
      {
        name: 'screen_orientation',
        type: ColumnType.VARCHAR,
        length: 50,
        comment: '螢幕方向（landscape, portrait, both）',
      },
      {
        name: 'supported_languages',
        type: ColumnType.JSONB,
        comment: '支援語言列表（JSON 陣列：["en", "zh-CN", "zh-TW"]）',
      },
      {
        name: 'tech_stack',
        type: ColumnType.JSONB,
        comment: '技術堆疊（JSON：{engine: "Pixi.js", framework: "React"}）',
      },
      // 額外資料
      {
        name: 'features',
        type: ColumnType.JSONB,
        comment: '特色功能列表（JSON 陣列）',
      },
      {
        name: 'symbols',
        type: ColumnType.JSONB,
        comment: '符號列表及配置（JSON）',
      },
      {
        name: 'paytable',
        type: ColumnType.JSONB,
        comment: '賠付表（JSON）',
      },
      {
        name: 'game_config',
        type: ColumnType.JSONB,
        comment: '遊戲配置（JSON：完整遊戲設定）',
      },
      {
        name: 'metadata',
        type: ColumnType.JSONB,
        comment: '額外的元資料（JSON：彈性擴展欄位）',
      },
      // 標籤與分類
      {
        name: 'tags',
        type: ColumnType.JSONB,
        comment: '標籤（JSON 陣列：["popular", "new", "hot"]）',
      },
      {
        name: 'category',
        type: ColumnType.VARCHAR,
        length: 100,
        comment: '分類（例如：slot, video_slot, classic_slot）',
      },
      // 負責人員
      {
        name: 'owner_id',
        type: ColumnType.INTEGER,
        references: {
          table: 'users',
          column: 'id',
          onDelete: 'SET NULL',
        },
        comment: '專案負責人 ID',
      },
      {
        name: 'dev_team',
        type: ColumnType.JSONB,
        comment: '開發團隊成員列表（JSON）',
      },
      // 時間戳記
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
        comment: '建立時間',
      },
      {
        name: 'updated_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        comment: '更新時間',
      },
      {
        name: 'deleted_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        comment: '刪除時間（軟刪除）',
      },
      // 排序與顯示
      {
        name: 'sort_order',
        type: ColumnType.INTEGER,
        default: 0,
        comment: '排序順序',
      },
      {
        name: 'is_active',
        type: ColumnType.BOOLEAN,
        default: true,
        comment: '是否啟用',
      },
      {
        name: 'is_featured',
        type: ColumnType.BOOLEAN,
        default: false,
        comment: '是否精選',
      },
    ],
    indexes: [
      { name: 'idx_project_index_game_id', columns: ['game_id'], unique: true },
      { name: 'idx_project_index_game_name_en', columns: ['game_name_en'] },
      { name: 'idx_project_index_game_name_cn', columns: ['game_name_cn'] },
      { name: 'idx_project_index_game_type', columns: ['game_type'] },
      { name: 'idx_project_index_dev_status', columns: ['dev_status'] },
      { name: 'idx_project_index_category', columns: ['category'] },
      { name: 'idx_project_index_is_active', columns: ['is_active'] },
      { name: 'idx_project_index_sort_order', columns: ['sort_order'] },
      { name: 'idx_project_index_owner_id', columns: ['owner_id'] },
      // 全文搜尋索引（搜尋關鍵字）
      { name: 'idx_project_index_search_key', columns: ['search_key'], type: 'GIN' },
      // JSONB 欄位索引
      { name: 'idx_project_index_tags', columns: ['tags'], type: 'GIN' },
      { name: 'idx_project_index_features', columns: ['features'], type: 'GIN' },
      { name: 'idx_project_index_metadata', columns: ['metadata'], type: 'GIN' },
    ],
    triggers: ['update_project_index_updated_at'],
  },

  // 專案資料表
  projects: {
    name: 'projects',
    comment: '專案資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '專案 ID',
      },
      {
        name: 'uuid',
        type: ColumnType.UUID,
        unique: true,
        default: 'uuid_generate_v4()',
        comment: 'UUID',
      },
      {
        name: 'name',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '專案名稱（顯示用）',
      },
      {
        name: 'name_zh',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '中文專案名稱',
      },
      {
        name: 'name_en',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '英文專案名稱',
      },
      {
        name: 'game_type',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '遊戲類型',
      },
      {
        name: 'description',
        type: ColumnType.TEXT,
        comment: '專案描述',
      },
      {
        name: 'status',
        type: ColumnType.VARCHAR,
        length: 50,
        default: "'active'",
        comment: '專案狀態',
      },
      {
        name: 'owner_id',
        type: ColumnType.INTEGER,
        // TODO: 未來建立 users 表時，可加回外鍵約束
        // references: {
        //   table: 'users',
        //   column: 'id',
        //   onDelete: 'SET NULL',
        // },
        comment: '擁有者 ID',
      },
      {
        name: 'tree_data',
        type: ColumnType.JSONB,
        comment: '樹狀圖資料（JSONB 格式）- 儲存專案的樹狀結構',
      },
      {
        name: 'tree_config',
        type: ColumnType.JSONB,
        comment: '樹狀圖配置（JSONB 格式）- 儲存樹狀圖的顯示設定',
      },
      {
        name: 'tree_version',
        type: ColumnType.INTEGER,
        default: 1,
        comment: '樹狀圖版本號',
      },
      {
        name: 'tree_updated_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        comment: '樹狀圖最後更新時間',
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
        comment: '建立時間',
      },
      {
        name: 'updated_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        comment: '更新時間',
      },
      {
        name: 'deleted_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        comment: '刪除時間',
      },
    ],
    indexes: [
      { name: 'idx_projects_owner_id', columns: ['owner_id'] },
      { name: 'idx_projects_status', columns: ['status'] },
      { name: 'idx_projects_name', columns: ['name'] },
      { name: 'idx_projects_tree_data', columns: ['tree_data'], type: 'GIN' },
      { name: 'idx_projects_tree_config', columns: ['tree_config'], type: 'GIN' },
    ],
    triggers: ['update_projects_updated_at'],
  },

  // 心智圖資料表
  mindmaps: {
    name: 'mindmaps',
    comment: '心智圖資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '心智圖 ID',
      },
      {
        name: 'uuid',
        type: ColumnType.UUID,
        unique: true,
        default: 'uuid_generate_v4()',
        comment: 'UUID',
      },
      {
        name: 'name',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '心智圖名稱',
      },
      {
        name: 'description',
        type: ColumnType.TEXT,
        comment: '心智圖描述',
      },
      {
        name: 'project_id',
        type: ColumnType.INTEGER,
        references: {
          table: 'projects',
          column: 'id',
          onDelete: 'CASCADE',
        },
        comment: '所屬專案 ID',
      },
      {
        name: 'data',
        type: ColumnType.JSONB,
        comment: '心智圖資料（JSONB 格式）',
      },
      {
        name: 'node_count',
        type: ColumnType.INTEGER,
        default: 0,
        comment: '節點數量',
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
        comment: '建立時間',
      },
      {
        name: 'updated_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        comment: '更新時間',
      },
      {
        name: 'deleted_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        comment: '刪除時間',
      },
    ],
    indexes: [
      { name: 'idx_mindmaps_project_id', columns: ['project_id'] },
      { name: 'idx_mindmaps_name', columns: ['name'] },
      { name: 'idx_mindmaps_data', columns: ['data'], type: 'GIN' },
    ],
    triggers: ['update_mindmaps_updated_at'],
  },

  // 樹狀圖資料表
  trees: {
    name: 'trees',
    comment: '樹狀圖資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '樹狀圖 ID',
      },
      {
        name: 'uuid',
        type: ColumnType.UUID,
        unique: true,
        default: 'uuid_generate_v4()',
        comment: 'UUID',
      },
      {
        name: 'name',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '樹狀圖名稱',
      },
      {
        name: 'description',
        type: ColumnType.TEXT,
        comment: '樹狀圖描述',
      },
      {
        name: 'project_id',
        type: ColumnType.INTEGER,
        references: {
          table: 'projects',
          column: 'id',
          onDelete: 'CASCADE',
        },
        comment: '所屬專案 ID',
      },
      {
        name: 'data',
        type: ColumnType.JSONB,
        comment: '樹狀圖資料（JSONB 格式）',
      },
      {
        name: 'tree_type',
        type: ColumnType.VARCHAR,
        length: 50,
        comment: '樹狀圖類型',
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
        comment: '建立時間',
      },
      {
        name: 'updated_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        comment: '更新時間',
      },
      {
        name: 'deleted_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        comment: '刪除時間',
      },
    ],
    indexes: [
      { name: 'idx_trees_project_id', columns: ['project_id'] },
      { name: 'idx_trees_tree_type', columns: ['tree_type'] },
      { name: 'idx_trees_data', columns: ['data'], type: 'GIN' },
    ],
    triggers: ['update_trees_updated_at'],
  },

  // 測試資料表
  test: {
    name: 'test',
    comment: '測試資料表',
    columns: [
      {
        name: 'id',
        type: ColumnType.SERIAL,
        primaryKey: true,
        notNull: true,
        comment: '測試項目 ID',
      },
      {
        name: 'name',
        type: ColumnType.VARCHAR,
        length: 255,
        notNull: true,
        comment: '名稱',
      },
      {
        name: 'description',
        type: ColumnType.TEXT,
        comment: '描述',
      },
      {
        name: 'status',
        type: ColumnType.VARCHAR,
        length: 50,
        default: "'active'",
        comment: '狀態',
      },
      {
        name: 'data',
        type: ColumnType.JSONB,
        comment: '額外資料（JSONB 格式）',
      },
      {
        name: 'created_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        notNull: true,
        comment: '建立時間',
      },
      {
        name: 'updated_at',
        type: ColumnType.TIMESTAMP_WITH_TIMEZONE,
        default: 'CURRENT_TIMESTAMP',
        comment: '更新時間',
      },
    ],
    indexes: [
      { name: 'idx_test_name', columns: ['name'] },
      { name: 'idx_test_status', columns: ['status'] },
      { name: 'idx_test_data', columns: ['data'], type: 'GIN' },
    ],
    triggers: ['update_test_updated_at'],
  },
};

/**
 * 取得資料表定義
 */
export function getTableConfig(tableName: string): TableDefinition | undefined {
  return tableConfigs[tableName];
}

/**
 * 取得所有資料表名稱
 */
export function getAllTableNames(): string[] {
  return Object.keys(tableConfigs);
}

/**
 * 取得資料表的所有欄位名稱
 */
export function getTableColumns(tableName: string): string[] {
  const table = tableConfigs[tableName];
  return table ? table.columns.map(col => col.name) : [];
}

/**
 * 取得資料表的主鍵欄位
 */
export function getPrimaryKeyColumn(tableName: string): string | undefined {
  const table = tableConfigs[tableName];
  if (!table) return undefined;
  
  const pkColumn = table.columns.find(col => col.primaryKey);
  return pkColumn?.name;
}

/**
 * 檢查欄位是否存在
 */
export function hasColumn(tableName: string, columnName: string): boolean {
  const columns = getTableColumns(tableName);
  return columns.includes(columnName);
}

/**
 * 取得欄位定義
 */
export function getColumnDefinition(
  tableName: string,
  columnName: string
): ColumnDefinition | undefined {
  const table = tableConfigs[tableName];
  if (!table) return undefined;
  
  return table.columns.find(col => col.name === columnName);
}
