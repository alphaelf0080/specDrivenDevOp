-- 創建 trees 表和更新 projects 表
-- 執行: psql -h 192.168.10.6 -U postgres -d postgres -f create-trees-table.sql

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創建 trees 表
CREATE TABLE IF NOT EXISTS trees (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_id INTEGER,
  tree_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  config JSONB,
  direction VARCHAR(10) DEFAULT 'LR',
  node_count INTEGER DEFAULT 0,
  max_depth INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT FALSE,
  tags TEXT,
  owner_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 為 projects 表添加缺失的欄位
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tree_data JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tree_config JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tree_version INTEGER DEFAULT 1;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tree_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS main_tree_id INTEGER;

-- 添加外鍵約束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_projects_main_tree'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT fk_projects_main_tree 
        FOREIGN KEY (main_tree_id) 
        REFERENCES trees(id) 
        ON DELETE SET NULL;
    END IF;
END
$$;

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_trees_project_id ON trees(project_id);
CREATE INDEX IF NOT EXISTS idx_trees_tree_type ON trees(tree_type);
CREATE INDEX IF NOT EXISTS idx_trees_owner_id ON trees(owner_id);
CREATE INDEX IF NOT EXISTS idx_trees_is_template ON trees(is_template);
CREATE INDEX IF NOT EXISTS idx_trees_data ON trees USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_trees_config ON trees USING GIN (config);
CREATE INDEX IF NOT EXISTS idx_trees_name ON trees(name);

CREATE INDEX IF NOT EXISTS idx_projects_tree_data ON projects USING GIN (tree_data);
CREATE INDEX IF NOT EXISTS idx_projects_tree_config ON projects USING GIN (tree_config);
CREATE INDEX IF NOT EXISTS idx_projects_main_tree_id ON projects(main_tree_id);

-- 創建 updated_at 觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 為 trees 表創建觸發器
DROP TRIGGER IF EXISTS update_trees_updated_at ON trees;
CREATE TRIGGER update_trees_updated_at
BEFORE UPDATE ON trees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 為 projects 表創建觸發器 (如果不存在)
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 添加註釋
COMMENT ON TABLE trees IS '樹狀圖資料表 - 儲存樹狀結構數據,支持 UI 佈局樹、PSD 結構樹等';
COMMENT ON COLUMN trees.id IS '樹狀圖 ID';
COMMENT ON COLUMN trees.uuid IS 'UUID - 用於搜尋和分享';
COMMENT ON COLUMN trees.name IS '樹狀圖名稱';
COMMENT ON COLUMN trees.description IS '樹狀圖描述';
COMMENT ON COLUMN trees.project_id IS '所屬專案 ID（可選）';
COMMENT ON COLUMN trees.tree_type IS '樹狀圖類型（ui_layout, psd_structure, game_logic, asset_tree 等）';
COMMENT ON COLUMN trees.data IS '樹狀圖完整資料（JSONB 格式）- 包含根節點和所有子節點的完整樹狀結構';
COMMENT ON COLUMN trees.config IS '樹狀圖配置（JSONB 格式）- 包含顯示設定、方向、節點樣式等';
COMMENT ON COLUMN trees.direction IS '樹狀圖方向（LR: 左到右, TB: 上到下）';
COMMENT ON COLUMN trees.node_count IS '節點總數（自動計算）';
COMMENT ON COLUMN trees.max_depth IS '最大深度（自動計算）';
COMMENT ON COLUMN trees.version IS '版本號（自動遞增）';
COMMENT ON COLUMN trees.is_template IS '是否為範本';
COMMENT ON COLUMN trees.tags IS '標籤（逗號分隔）';
COMMENT ON COLUMN trees.owner_id IS '擁有者 ID';

COMMENT ON COLUMN projects.main_tree_id IS '主要樹狀圖 ID - 關聯到 trees 表';
COMMENT ON COLUMN projects.tree_data IS '樹狀圖資料（JSONB 格式）- 儲存專案的樹狀結構（已廢棄,使用 main_tree_id 關聯）';
COMMENT ON COLUMN projects.tree_config IS '樹狀圖配置（JSONB 格式）- 儲存樹狀圖的顯示設定';
COMMENT ON COLUMN projects.tree_version IS '樹狀圖版本號';
COMMENT ON COLUMN projects.tree_updated_at IS '樹狀圖最後更新時間';

-- 顯示結果
SELECT 'Tables created successfully!' AS status;
\dt
