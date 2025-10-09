/**
 * 資料庫初始化模組
 *
 * 負責檢查和建立必要的資料表
 * 在應用程式啟動時自動執行
 */
import { QueryResultRow } from 'pg';
import { Database } from './db.js';
/**
 * 檢查資料表是否存在
 */
export declare function checkTableExists(db: Database, tableName: string): Promise<boolean>;
/**
 * 建立單一資料表
 */
export declare function createTable(db: Database, tableName: string): Promise<void>;
/**
 * 初始化資料庫
 * 檢查並建立所有必要的資料表
 */
export declare function initializeDatabase(db: Database, tablesToCheck?: string[]): Promise<void>;
/**
 * 查詢資料表資料
 */
export declare function loadTableData<T extends QueryResultRow = any>(db: Database, tableName: string, options?: {
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
    offset?: number;
}): Promise<T[]>;
/**
 * 簡化的初始化函數 - 只檢查 projects 表
 */
export declare function initializeProjectsTable(db: Database): Promise<any[]>;
