-- ========================================
-- 樹狀圖遷移 - 資料庫準備腳本
-- ========================================
-- 執行此腳本來為遷移準備資料庫
-- 執行方式: psql -h HOST -U USER -d DATABASE -f prepare-migration.sql

\echo '========================================';
\echo '  樹狀圖遷移 - 資料庫準備';
\echo '========================================';
\echo '';

-- 1. 檢查 trees 表是否存在
\echo '🔍 檢查 trees 表...';
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'trees'
    ) THEN
        RAISE EXCEPTION '❌ trees 表不存在，請先執行 db-init';
    ELSE
        RAISE NOTICE '✅ trees 表已存在';
    END IF;
END
$$;

-- 2. 為 projects 表添加 main_tree_id 欄位
\echo '';
\echo '📝 添加 main_tree_id 欄位...';
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS main_tree_id INTEGER;

-- 3. 添加外鍵約束
\echo '🔗 添加外鍵約束...';
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
        RAISE NOTICE '✅ 外鍵約束已添加';
    ELSE
        RAISE NOTICE '⚠️  外鍵約束已存在';
    END IF;
END
$$;

-- 4. 創建索引
\echo '📊 創建索引...';
CREATE INDEX IF NOT EXISTS idx_projects_main_tree_id 
ON projects(main_tree_id);

-- 5. 檢查需要遷移的資料
\echo '';
\echo '========================================';
\echo '  檢查需要遷移的資料';
\echo '========================================';

\echo '';
\echo '📊 專案統計:';
SELECT 
    COUNT(*) AS total_projects,
    COUNT(CASE WHEN tree_data IS NOT NULL THEN 1 END) AS projects_with_tree_data,
    COUNT(CASE WHEN main_tree_id IS NOT NULL THEN 1 END) AS projects_with_main_tree_id
FROM projects 
WHERE deleted_at IS NULL;

\echo '';
\echo '📋 需要遷移的專案列表:';
SELECT 
    id,
    name,
    name_zh,
    CASE WHEN tree_data IS NOT NULL THEN '✅' ELSE '❌' END AS has_tree_data,
    CASE WHEN main_tree_id IS NOT NULL THEN '✅' ELSE '❌' END AS has_main_tree_id
FROM projects 
WHERE deleted_at IS NULL
ORDER BY id;

\echo '';
\echo '📊 trees 表統計:';
SELECT COUNT(*) AS total_trees FROM trees;

\echo '';
\echo '========================================';
\echo '  ✅ 資料庫準備完成';
\echo '========================================';
\echo '';
\echo '下一步: 執行遷移腳本';
\echo '  PowerShell: .\migrate-trees.ps1';
\echo '  或直接: npx tsx server/database/migrate-trees.ts';
\echo '';
