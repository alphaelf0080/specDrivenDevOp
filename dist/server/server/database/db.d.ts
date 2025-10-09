/**
 * PostgreSQL 資料庫操作模組
 *
 * 此模組提供資料庫連線池管理和常用的資料庫操作方法
 * 支援交易、查詢、批次操作等功能
 */
import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DatabaseConfig } from '../config/database.config.js';
/**
 * 資料庫操作類別
 */
export declare class Database {
    private pool;
    private config;
    private isConnected;
    constructor(config?: DatabaseConfig);
    /**
     * 初始化資料庫連線池
     */
    connect(): Promise<void>;
    /**
     * 關閉資料庫連線池
     */
    disconnect(): Promise<void>;
    /**
     * 執行查詢
     */
    query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    /**
     * 執行查詢並返回單一結果
     */
    queryOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null>;
    /**
     * 執行查詢並返回多筆結果
     */
    queryMany<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]>;
    /**
     * 執行 INSERT 並返回插入的資料
     */
    insert<T extends QueryResultRow = any>(table: string, data: Record<string, any>): Promise<T>;
    /**
     * 執行 UPDATE 並返回更新的資料
     */
    update<T extends QueryResultRow = any>(table: string, data: Record<string, any>, where: Record<string, any>): Promise<T[]>;
    /**
     * 執行 DELETE
     */
    delete(table: string, where: Record<string, any>): Promise<number>;
    /**
     * 執行交易
     */
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    /**
     * 批次插入
     */
    batchInsert<T extends QueryResultRow = any>(table: string, dataList: Record<string, any>[]): Promise<T[]>;
    /**
     * 檢查資料表是否存在
     */
    tableExists(tableName: string): Promise<boolean>;
    /**
     * 取得連線池狀態
     */
    getPoolStatus(): {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    } | null;
    /**
     * 確保已連線
     */
    private ensureConnected;
}
/**
 * 取得資料庫實例（單例模式）
 */
export declare function getDatabase(config?: DatabaseConfig): Database;
/**
 * 重置資料庫實例（主要用於測試）
 */
export declare function resetDatabase(): void;
