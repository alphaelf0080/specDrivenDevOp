/**
 * 建立測試資料表
 *
 * 此腳本用於建立一個測試用的資料表並插入測試資料
 */
/**
 * 建立 test table
 */
declare function createTestTable(): Promise<void>;
/**
 * 刪除 test table（清理用）
 */
declare function dropTestTable(): Promise<void>;
export { createTestTable, dropTestTable };
