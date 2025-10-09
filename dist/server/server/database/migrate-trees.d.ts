/**
 * 樹狀圖資料遷移腳本
 *
 * 將 projects.tree_data 遷移到獨立的 trees 表
 * 並更新 projects.main_tree_id 關聯
 */
declare function migrateProjectTrees(): Promise<void>;
export { migrateProjectTrees };
