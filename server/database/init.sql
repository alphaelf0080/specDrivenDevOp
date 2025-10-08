-- PostgreSQL 資料庫初始化腳本
-- 建立資料表範例

-- 建立資料庫（需要以 superuser 身份執行）
-- CREATE DATABASE spec_driven_dev;

-- 連接到資料庫
-- \c spec_driven_dev;

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 建立使用者資料表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 建立專案資料表
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 建立心智圖資料表
CREATE TABLE IF NOT EXISTS mindmaps (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    data JSONB,
    node_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 建立樹狀圖資料表
CREATE TABLE IF NOT EXISTS trees (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    data JSONB,
    tree_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 建立操作日誌資料表
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立測試資料表
CREATE TABLE IF NOT EXISTS test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_mindmaps_project_id ON mindmaps(project_id);
CREATE INDEX IF NOT EXISTS idx_trees_project_id ON trees(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- 建立 GIN 索引用於 JSONB 欄位
CREATE INDEX IF NOT EXISTS idx_mindmaps_data ON mindmaps USING gin(data);
CREATE INDEX IF NOT EXISTS idx_trees_data ON trees USING gin(data);
CREATE INDEX IF NOT EXISTS idx_activity_logs_details ON activity_logs USING gin(details);
CREATE INDEX IF NOT EXISTS idx_test_name ON test(name);
CREATE INDEX IF NOT EXISTS idx_test_status ON test(status);
CREATE INDEX IF NOT EXISTS idx_test_data ON test USING gin(data);

-- 建立更新時間戳的觸發函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為各個資料表建立自動更新 updated_at 的觸發器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mindmaps_updated_at 
    BEFORE UPDATE ON mindmaps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trees_updated_at 
    BEFORE UPDATE ON trees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_updated_at 
    BEFORE UPDATE ON test 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入測試資料（可選）
INSERT INTO users (username, email, password_hash) VALUES
    ('admin', 'admin@example.com', '$2a$10$XkDXwjklXx1234567890abcdef'),
    ('testuser', 'test@example.com', '$2a$10$XkDXwjklXx1234567890abcdef')
ON CONFLICT (username) DO NOTHING;

INSERT INTO test (name, description, status, data) VALUES
    ('測試項目 1', '這是第一個測試項目', 'active', '{"priority": "high", "tags": ["test", "demo"]}'),
    ('測試項目 2', '這是第二個測試項目', 'active', '{"priority": "medium", "tags": ["test"]}'),
    ('測試項目 3', '這是第三個測試項目', 'inactive', '{"priority": "low", "tags": ["demo"]}')
ON CONFLICT DO NOTHING;

-- 顯示建立的資料表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 完成
SELECT '✅ 資料庫初始化完成' as status;
