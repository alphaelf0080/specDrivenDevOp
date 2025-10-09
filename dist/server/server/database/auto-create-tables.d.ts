/**
 * 使用 Table Config 自動建立資料表
 *
 * 此腳本會根據 table.config.ts 中的定義自動建立所有資料表
 */
/**
 * 建立所有資料表
 */
declare function createAllTables(): Promise<void>;
/**
 * 輸出所有資料表的 SQL 到檔案
 */
declare function exportSQL(): Promise<void>;
/**
 * 刪除所有資料表（危險操作！）
 */
declare function dropAllTables(): Promise<void>;
export { createAllTables, exportSQL, dropAllTables };
