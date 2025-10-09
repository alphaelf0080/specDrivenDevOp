/**
 * PostgreSQL 資料庫操作模組
 *
 * 此模組提供資料庫連線池管理和常用的資料庫操作方法
 * 支援交易、查詢、批次操作等功能
 */
import { Pool } from 'pg';
import { loadDatabaseConfig, validateDatabaseConfig } from '../config/database.config.js';
/**
 * 資料庫操作類別
 */
export class Database {
    constructor(config) {
        this.pool = null;
        this.isConnected = false;
        this.config = config || loadDatabaseConfig();
    }
    /**
     * 初始化資料庫連線池
     */
    async connect() {
        if (this.isConnected) {
            console.log('⚠️  資料庫已連線');
            return;
        }
        // 驗證配置
        if (!validateDatabaseConfig(this.config)) {
            throw new Error('資料庫配置驗證失敗');
        }
        try {
            this.pool = new Pool(this.config);
            // 測試連線
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            this.isConnected = true;
            console.log('✅ 資料庫連線成功');
            console.log(`📊 資料庫: ${this.config.database}@${this.config.host}:${this.config.port}`);
            // 監聽錯誤事件
            this.pool.on('error', (err) => {
                console.error('❌ 資料庫連線池錯誤:', err);
            });
        }
        catch (error) {
            console.error('❌ 資料庫連線失敗:', error);
            throw error;
        }
    }
    /**
     * 關閉資料庫連線池
     */
    async disconnect() {
        if (!this.pool) {
            return;
        }
        try {
            await this.pool.end();
            this.isConnected = false;
            this.pool = null;
            console.log('✅ 資料庫連線已關閉');
        }
        catch (error) {
            console.error('❌ 關閉資料庫連線失敗:', error);
            throw error;
        }
    }
    /**
     * 執行查詢
     */
    async query(text, params) {
        this.ensureConnected();
        try {
            const start = Date.now();
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`🔍 執行查詢 (${duration}ms): ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
            return result;
        }
        catch (error) {
            console.error('❌ 查詢執行失敗:', error);
            console.error('SQL:', text);
            console.error('參數:', params);
            throw error;
        }
    }
    /**
     * 執行查詢並返回單一結果
     */
    async queryOne(text, params) {
        const result = await this.query(text, params);
        return result.rows[0] || null;
    }
    /**
     * 執行查詢並返回多筆結果
     */
    async queryMany(text, params) {
        const result = await this.query(text, params);
        return result.rows;
    }
    /**
     * 執行 INSERT 並返回插入的資料
     */
    async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const text = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
        const result = await this.query(text, values);
        return result.rows[0];
    }
    /**
     * 執行 UPDATE 並返回更新的資料
     */
    async update(table, data, where) {
        const setKeys = Object.keys(data);
        const setValues = Object.values(data);
        const whereKeys = Object.keys(where);
        const whereValues = Object.values(where);
        const setClause = setKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const whereClause = whereKeys.map((key, i) => `${key} = $${i + 1 + setKeys.length}`).join(' AND ');
        const text = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `;
        const result = await this.query(text, [...setValues, ...whereValues]);
        return result.rows;
    }
    /**
     * 執行 DELETE
     */
    async delete(table, where) {
        const whereKeys = Object.keys(where);
        const whereValues = Object.values(where);
        const whereClause = whereKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
        const text = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await this.query(text, whereValues);
        return result.rowCount || 0;
    }
    /**
     * 執行交易
     */
    async transaction(callback) {
        this.ensureConnected();
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            console.log('🔄 開始交易');
            const result = await callback(client);
            await client.query('COMMIT');
            console.log('✅ 交易提交成功');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ 交易回滾:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * 批次插入
     */
    async batchInsert(table, dataList) {
        if (dataList.length === 0) {
            return [];
        }
        return this.transaction(async (client) => {
            const results = [];
            for (const data of dataList) {
                const keys = Object.keys(data);
                const values = Object.values(data);
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const text = `
          INSERT INTO ${table} (${keys.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;
                const result = await client.query(text, values);
                results.push(result.rows[0]);
            }
            return results;
        });
    }
    /**
     * 檢查資料表是否存在
     */
    async tableExists(tableName) {
        const result = await this.queryOne(`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`, [tableName]);
        return result?.exists || false;
    }
    /**
     * 取得連線池狀態
     */
    getPoolStatus() {
        if (!this.pool) {
            return null;
        }
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
        };
    }
    /**
     * 確保已連線
     */
    ensureConnected() {
        if (!this.isConnected || !this.pool) {
            throw new Error('資料庫尚未連線，請先執行 connect()');
        }
    }
}
/**
 * 單例資料庫實例
 */
let dbInstance = null;
/**
 * 取得資料庫實例（單例模式）
 */
export function getDatabase(config) {
    if (!dbInstance) {
        dbInstance = new Database(config);
    }
    return dbInstance;
}
/**
 * 重置資料庫實例（主要用於測試）
 */
export function resetDatabase() {
    if (dbInstance) {
        dbInstance.disconnect().catch(console.error);
        dbInstance = null;
    }
}
//# sourceMappingURL=db.js.map