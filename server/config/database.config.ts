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
  // 連線池配置
  max?: number;           // 最大連線數
  min?: number;           // 最小連線數
  idleTimeoutMillis?: number;  // 閒置超時時間
  connectionTimeoutMillis?: number;  // 連線超時時間
}

/**
 * 從環境變數載入資料庫配置
 */
export function loadDatabaseConfig(): DatabaseConfig {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    
    // 連線池配置
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  };

  // SSL 配置 (生產環境建議開啟)
  if (process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    };
  }

  return config;
}

/**
 * 驗證資料庫配置
 */
export function validateDatabaseConfig(config: DatabaseConfig): boolean {
  const required = ['host', 'port', 'database', 'user', 'password'];
  
  for (const field of required) {
    if (!config[field as keyof DatabaseConfig]) {
      console.error(`❌ 資料庫配置錯誤: 缺少必要欄位 ${field}`);
      return false;
    }
  }
  
  if (config.port < 1 || config.port > 65535) {
    console.error('❌ 資料庫配置錯誤: port 必須在 1-65535 之間');
    return false;
  }
  
  return true;
}

/**
 * 預設資料庫配置
 */
export const defaultDatabaseConfig: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '1234',
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
