/**
 * 資料庫初始化模組
 * 
 * 負責檢查和建立必要的資料表
 * 在應用程式啟動時自動執行
 */

import { QueryResultRow } from 'pg';
import { Database } from './db.js';
import { getTableConfig, getAllTableNames } from '../config/table.config.js';
import { generateCreateTableSQL, generateAllIndexesSQL } from './sql-generator.js';

/**
 * 檢查資料表是否存在
 */
export async function checkTableExists(db: Database, tableName: string): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [tableName]
    );
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ 檢查資料表 ${tableName} 失敗:`, error);
    throw error;
  }
}

/**
 * 建立單一資料表
 */
export async function createTable(db: Database, tableName: string): Promise<void> {
  try {
    console.log(`📊 建立資料表: ${tableName}`);
    
    const tableConfig = getTableConfig(tableName);
    if (!tableConfig) {
      throw new Error(`找不到資料表配置: ${tableName}`);
    }

    // 生成並執行 CREATE TABLE
    const createTableSQL = generateCreateTableSQL(tableName);
    await db.query(createTableSQL);
    console.log(`✅ 資料表 ${tableName} 建立成功`);

    // 生成並執行索引
    const indexesSQL = generateAllIndexesSQL(tableName);
    if (indexesSQL.length > 0) {
      for (const indexSQL of indexesSQL) {
        await db.query(indexSQL);
      }
      console.log(`✅ 資料表 ${tableName} 索引建立成功（${indexesSQL.length} 個）`);
    }

    // 建立觸發器（如果有定義）
    if (tableConfig.triggers && tableConfig.triggers.length > 0) {
      for (const trigger of tableConfig.triggers) {
        if (trigger.includes('update') && trigger.includes('updated_at')) {
          // 建立 updated_at 自動更新觸發器
          const triggerSQL = `
            CREATE OR REPLACE FUNCTION ${trigger}()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS ${trigger} ON ${tableName};
            
            CREATE TRIGGER ${trigger}
            BEFORE UPDATE ON ${tableName}
            FOR EACH ROW
            EXECUTE FUNCTION ${trigger}();
          `;
          await db.query(triggerSQL);
          console.log(`✅ 觸發器 ${trigger} 建立成功`);
        }
      }
    }

  } catch (error) {
    console.error(`❌ 建立資料表 ${tableName} 失敗:`, error);
    throw error;
  }
}

/**
 * 初始化資料庫
 * 檢查並建立所有必要的資料表
 */
export async function initializeDatabase(db: Database, tablesToCheck: string[] = []): Promise<void> {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║              🗄️  資料庫初始化開始                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // 確保資料庫已連線
    await db.connect();

    // 🔧 自動安裝必要的 PostgreSQL 擴展
    try {
      console.log('🔧 安裝必要的 PostgreSQL 擴展...');
      await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ uuid-ossp 擴展已就緒\n');
    } catch (error) {
      console.warn('⚠️  無法安裝 uuid-ossp 擴展，UUID 功能可能無法使用\n');
    }

    // 如果沒有指定要檢查的資料表，則檢查所有已配置的資料表
    const tablesToInit = tablesToCheck.length > 0 ? tablesToCheck : getAllTableNames();

    console.log(`📋 需要檢查的資料表: ${tablesToInit.join(', ')}\n`);

    const results = {
      existed: [] as string[],
      created: [] as string[],
      failed: [] as string[],
    };

    // 檢查並建立每個資料表
    for (const tableName of tablesToInit) {
      try {
        const exists = await checkTableExists(db, tableName);
        
        if (exists) {
          console.log(`✓ 資料表 ${tableName} 已存在`);
          results.existed.push(tableName);
        } else {
          console.log(`⚠️  資料表 ${tableName} 不存在，開始建立...`);
          await createTable(db, tableName);
          results.created.push(tableName);
        }
      } catch (error) {
        console.error(`❌ 處理資料表 ${tableName} 失敗:`, error);
        results.failed.push(tableName);
      }
      console.log(''); // 空行分隔
    }

    // 輸出總結
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║              📊 資料庫初始化完成                            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log(`✅ 已存在: ${results.existed.length} 個資料表`);
    if (results.existed.length > 0) {
      console.log(`   ${results.existed.join(', ')}`);
    }
    console.log(`\n🆕 新建立: ${results.created.length} 個資料表`);
    if (results.created.length > 0) {
      console.log(`   ${results.created.join(', ')}`);
    }
    if (results.failed.length > 0) {
      console.log(`\n❌ 失敗: ${results.failed.length} 個資料表`);
      console.log(`   ${results.failed.join(', ')}`);
    }
    console.log('');

    // 如果有失敗的資料表，拋出錯誤
    if (results.failed.length > 0) {
      throw new Error(`部分資料表初始化失敗: ${results.failed.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    throw error;
  }
}

/**
 * 查詢資料表資料
 */
export async function loadTableData<T extends QueryResultRow = any>(
  db: Database, 
  tableName: string,
  options: {
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<T[]> {
  try {
    let sql = `SELECT ${options.columns?.join(', ') || '*'} FROM ${tableName}`;
    const params: any[] = [];
    let paramIndex = 1;

    // WHERE 條件
    if (options.where && Object.keys(options.where).length > 0) {
      const whereClause = Object.entries(options.where)
        .map(([key, _]) => `${key} = $${paramIndex++}`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(options.where));
    }

    // ORDER BY
    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    // LIMIT
    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    // OFFSET
    if (options.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    console.log(`🔍 載入 ${tableName} 資料...`);
    const result = await db.query<T>(sql, params);
    console.log(`✅ 載入 ${result.rowCount} 筆資料`);
    
    return result.rows;
  } catch (error) {
    console.error(`❌ 載入 ${tableName} 資料失敗:`, error);
    throw error;
  }
}

/**
 * 簡化的初始化函數 - 只檢查 projects 表
 */
export async function initializeProjectsTable(db: Database): Promise<any[]> {
  try {
    // 初始化資料庫（檢查並建立 projects 表）
    await initializeDatabase(db, ['projects']);

    // 載入 projects 資料
    const projects = await loadTableData(db, 'projects', {
      where: { deleted_at: null },
      orderBy: 'created_at DESC',
    });

    return projects;
  } catch (error) {
    console.error('❌ 初始化 projects 資料表失敗:', error);
    throw error;
  }
}
