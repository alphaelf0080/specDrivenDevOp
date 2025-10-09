-- 為 trees 表添加 AI Agent 相關欄位
-- 執行: psql -h 192.168.10.6 -U postgres -d postgres -f add-ai-agent-fields.sql

-- 添加 AI Agent 相關欄位
ALTER TABLE trees 
ADD COLUMN IF NOT EXISTS enable_ai_agent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_agent_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_agent_prompt TEXT;

-- 創建索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_trees_enable_ai_agent ON trees(enable_ai_agent);
CREATE INDEX IF NOT EXISTS idx_trees_ai_agent_type ON trees(ai_agent_type);

-- 添加註解說明欄位用途
COMMENT ON COLUMN trees.enable_ai_agent IS '是否啟用 AI Agent 功能';
COMMENT ON COLUMN trees.ai_agent_type IS 'AI Agent 類型 (claude, gpt-4, gemini, copilot, custom)';
COMMENT ON COLUMN trees.ai_agent_prompt IS 'AI Agent 的 Prompt 指令';

-- 顯示更新結果
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'trees' 
  AND column_name IN ('enable_ai_agent', 'ai_agent_type', 'ai_agent_prompt')
ORDER BY ordinal_position;
