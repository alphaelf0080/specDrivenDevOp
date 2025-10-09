/**
 * 資料表配置檔案
 *
 * 定義資料庫中所有資料表的結構，包含資料表名稱、欄位定義、索引等
 * 用於自動建立資料表和生成查詢
 */
/**
 * 欄位資料型別
 */
export declare enum ColumnType {
    SERIAL = "SERIAL",
    INTEGER = "INTEGER",
    BIGINT = "BIGINT",
    DECIMAL = "DECIMAL",
    NUMERIC = "NUMERIC",
    REAL = "REAL",
    DOUBLE_PRECISION = "DOUBLE PRECISION",
    VARCHAR = "VARCHAR",
    CHAR = "CHAR",
    TEXT = "TEXT",
    BOOLEAN = "BOOLEAN",
    DATE = "DATE",
    TIME = "TIME",
    TIMESTAMP = "TIMESTAMP",
    TIMESTAMP_WITH_TIMEZONE = "TIMESTAMP WITH TIME ZONE",
    JSON = "JSON",
    JSONB = "JSONB",
    UUID = "UUID",
    INET = "INET",
    ARRAY = "ARRAY"
}
/**
 * 欄位定義介面
 */
export interface ColumnDefinition {
    name: string;
    type: ColumnType | string;
    length?: number;
    precision?: number;
    scale?: number;
    primaryKey?: boolean;
    unique?: boolean;
    notNull?: boolean;
    default?: string | number | boolean;
    references?: {
        table: string;
        column: string;
        onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
        onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    };
    autoIncrement?: boolean;
    comment?: string;
}
/**
 * 索引定義介面
 */
export interface IndexDefinition {
    name: string;
    columns: string[];
    unique?: boolean;
    type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
    where?: string;
}
/**
 * 資料表定義介面
 */
export interface TableDefinition {
    name: string;
    schema?: string;
    columns: ColumnDefinition[];
    indexes?: IndexDefinition[];
    triggers?: string[];
    comment?: string;
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
export declare const tableConfigs: TableConfig;
/**
 * 取得資料表定義
 */
export declare function getTableConfig(tableName: string): TableDefinition | undefined;
/**
 * 取得所有資料表名稱
 */
export declare function getAllTableNames(): string[];
/**
 * 取得資料表的所有欄位名稱
 */
export declare function getTableColumns(tableName: string): string[];
/**
 * 取得資料表的主鍵欄位
 */
export declare function getPrimaryKeyColumn(tableName: string): string | undefined;
/**
 * 檢查欄位是否存在
 */
export declare function hasColumn(tableName: string, columnName: string): boolean;
/**
 * 取得欄位定義
 */
export declare function getColumnDefinition(tableName: string, columnName: string): ColumnDefinition | undefined;
