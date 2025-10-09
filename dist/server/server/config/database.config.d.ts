/**
 * PostgreSQL 資料庫配置
 *
 * 此模組負責管理資料庫連線的配置參數
 * 支援從環境變數讀取配置，並提供預設值
 */
import { PoolConfig } from 'pg';
/**
 * 資料庫配置介面
 */
export interface DatabaseConfig extends PoolConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}
/**
 * 從環境變數載入資料庫配置
 */
export declare function loadDatabaseConfig(): DatabaseConfig;
/**
 * 驗證資料庫配置
 */
export declare function validateDatabaseConfig(config: DatabaseConfig): boolean;
/**
 * 預設資料庫配置
 */
export declare const defaultDatabaseConfig: DatabaseConfig;
