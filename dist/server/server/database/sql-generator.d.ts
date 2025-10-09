/**
 * SQL 生成器
 *
 * 根據 table config 自動生成 SQL 語句
 */
import { ColumnDefinition, IndexDefinition } from '../config/table.config.js';
/**
 * 生成 CREATE TABLE 語句
 */
export declare function generateCreateTableSQL(tableName: string): string;
/**
 * 生成索引的 CREATE INDEX 語句
 */
export declare function generateCreateIndexSQL(tableName: string, index: IndexDefinition): string;
/**
 * 生成所有索引的 SQL
 */
export declare function generateAllIndexesSQL(tableName: string): string;
/**
 * 生成完整的資料表建立 SQL（包含索引）
 */
export declare function generateFullTableSQL(tableName: string): string;
/**
 * 生成所有資料表的建立 SQL
 */
export declare function generateAllTablesSQL(): string;
/**
 * 生成 SELECT 查詢語句
 */
export declare function generateSelectSQL(tableName: string, options?: {
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
    offset?: number;
}): {
    sql: string;
    params: any[];
};
/**
 * 生成 INSERT 語句
 */
export declare function generateInsertSQL(tableName: string, data: Record<string, any>, returning?: boolean): {
    sql: string;
    params: any[];
};
/**
 * 生成 UPDATE 語句
 */
export declare function generateUpdateSQL(tableName: string, data: Record<string, any>, where: Record<string, any>): {
    sql: string;
    params: any[];
};
/**
 * 生成 DELETE 語句
 */
export declare function generateDeleteSQL(tableName: string, where: Record<string, any>): {
    sql: string;
    params: any[];
};
/**
 * 生成 DROP TABLE 語句
 */
export declare function generateDropTableSQL(tableName: string, cascade?: boolean): string;
/**
 * 生成 ALTER TABLE 語句（新增欄位）
 */
export declare function generateAddColumnSQL(tableName: string, column: ColumnDefinition): string;
/**
 * 驗證資料是否符合資料表定義
 */
export declare function validateData(tableName: string, data: Record<string, any>): {
    valid: boolean;
    errors: string[];
};
