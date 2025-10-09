/**
 * PostgreSQL 資料庫配置
 *
 * 此模組負責管理資料庫連線的配置參數
 * 支援從環境變數讀取配置，並提供預設值
 */
/**
 * 從環境變數載入資料庫配置
 */
export function loadDatabaseConfig() {
    const config = {
        host: process.env.DB_HOST || '192.168.10.6',
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
export function validateDatabaseConfig(config) {
    const required = ['host', 'port', 'database', 'user', 'password'];
    for (const field of required) {
        if (!config[field]) {
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
export const defaultDatabaseConfig = {
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
//# sourceMappingURL=database.config.js.map