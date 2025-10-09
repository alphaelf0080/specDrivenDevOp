/**
 * 手動初始化資料庫腳本
 * 執行: npx tsx server/database/manual-init.ts
 */

import { Pool } from 'pg';
import { loadDatabaseConfig } from '../config/database.config.js';
import { getAllTableNames } from '../config/table.config.js';
import { generateCreateTableSQL, generateAllIndexesSQL } from './sql-generator.js';

async function initDatabase() {
  const config = loadDatabaseConfig();
  const pool = new Pool(config);

  console.log('🚀 開始初始化資料庫...\n');
  console.log(`📊 資料庫: ${config.database}@${config.host}:${config.port}\n`);

  try {
    // 測試連接
    await pool.query('SELECT NOW()');
    console.log('✅ 資料庫連接成功\n');

    // 啟用 UUID 擴展
    console.log('📦 啟用 UUID 擴展...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID 擴展已啟用\n');

    // 獲取所有表名
    const tableNames = getAllTableNames();
    console.log(`📋 需要創建 ${tableNames.length} 個表: ${tableNames.join(', ')}\n`);

    // 檢查並創建每個表
    for (const tableName of tableNames) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`處理表: ${tableName}`);
      console.log('='.repeat(60));

      // 檢查表是否存在
      const checkResult = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      );

      const exists = checkResult.rows[0].exists;

      if (exists) {
        console.log(`⚠️  表 ${tableName} 已存在，跳過創建`);
        
        // 檢查是否需要添加缺失的欄位
        if (tableName === 'projects') {
          await addMissingProjectsColumns(pool);
        }
        continue;
      }

      // 生成並執行 CREATE TABLE
      console.log(`📝 生成 CREATE TABLE SQL...`);
      const createSQL = generateCreateTableSQL(tableName);
      
      console.log(`🔨 執行 CREATE TABLE...`);
      await pool.query(createSQL);
      console.log(`✅ 表 ${tableName} 創建成功`);
    }

    // 創建觸發器
    console.log(`\n${'='.repeat(60)}`);
    console.log('創建觸發器');
    console.log('='.repeat(60));
    
    // 創建 updated_at 觸發器函數
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // 為每個有 updated_at 欄位的表創建觸發器
    for (const tableName of tableNames) {
      try {
        await pool.query(`
          DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName};
          CREATE TRIGGER update_${tableName}_updated_at
          BEFORE UPDATE ON ${tableName}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log(`  ✅ 創建觸發器: update_${tableName}_updated_at`);
      } catch (error) {
        // 忽略沒有 updated_at 欄位的表
      }
    }
    console.log('✅ 觸發器創建完成');

    // 創建索引
    console.log(`\n${'='.repeat(60)}`);
    console.log('創建索引');
    console.log('='.repeat(60));
    for (const tableName of tableNames) {
      try {
        const indexSQL = generateAllIndexesSQL(tableName);
        if (indexSQL.trim()) {
          await pool.query(indexSQL);
          console.log(`  ✅ 創建索引: ${tableName}`);
        }
      } catch (error) {
        console.error(`  ⚠️  創建索引失敗 (${tableName}):`, error);
      }
    }
    console.log('✅ 索引創建完成');

    // 顯示結果
    console.log(`\n${'='.repeat(60)}`);
    console.log('初始化完成 - 資料表列表');
    console.log('='.repeat(60));
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    for (const row of tablesResult.rows) {
      console.log(`  ✓ ${row.table_name}`);
    }

    console.log('\n✅ 資料庫初始化完成!\n');

  } catch (error) {
    console.error('\n❌ 資料庫初始化失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * 為 projects 表添加缺失的欄位
 */
async function addMissingProjectsColumns(pool: Pool) {
  console.log('🔍 檢查 projects 表缺失的欄位...');

  const columnsToAdd = [
    { name: 'tree_data', type: 'JSONB', comment: '樹狀圖資料' },
    { name: 'tree_config', type: 'JSONB', comment: '樹狀圖配置' },
    { name: 'tree_version', type: 'INTEGER', default: '1', comment: '樹狀圖版本號' },
    { name: 'tree_updated_at', type: 'TIMESTAMP WITH TIME ZONE', comment: '樹狀圖最後更新時間' },
    { name: 'main_tree_id', type: 'INTEGER', comment: '主要樹狀圖 ID' },
  ];

  for (const col of columnsToAdd) {
    try {
      // 檢查欄位是否存在
      const checkCol = await pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'projects' 
         AND column_name = $1`,
        [col.name]
      );

      if (checkCol.rows.length === 0) {
        // 添加欄位
        let sql = `ALTER TABLE projects ADD COLUMN ${col.name} ${col.type}`;
        if (col.default) {
          sql += ` DEFAULT ${col.default}`;
        }
        
        await pool.query(sql);
        console.log(`  ✅ 添加欄位: ${col.name}`);

        // 添加註釋
        if (col.comment) {
          await pool.query(
            `COMMENT ON COLUMN projects.${col.name} IS '${col.comment}'`
          );
        }
      } else {
        console.log(`  ⚠️  欄位 ${col.name} 已存在`);
      }
    } catch (error) {
      console.error(`  ❌ 添加欄位 ${col.name} 失敗:`, error);
    }
  }

  // 添加外鍵約束 (如果 trees 表存在)
  try {
    const treesExists = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'trees'
      )`
    );

    if (treesExists.rows[0].exists) {
      // 檢查外鍵是否存在
      const fkExists = await pool.query(
        `SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = 'projects' 
         AND constraint_name = 'fk_projects_main_tree'`
      );

      if (fkExists.rows.length === 0) {
        await pool.query(`
          ALTER TABLE projects 
          ADD CONSTRAINT fk_projects_main_tree 
          FOREIGN KEY (main_tree_id) 
          REFERENCES trees(id) 
          ON DELETE SET NULL
        `);
        console.log('  ✅ 添加外鍵約束: fk_projects_main_tree');
      }
    }
  } catch (error) {
    console.error('  ⚠️  添加外鍵約束失敗 (可能 trees 表尚未創建):', error);
  }

  // 創建索引
  const indexes = [
    { name: 'idx_projects_tree_data', column: 'tree_data', type: 'GIN' },
    { name: 'idx_projects_tree_config', column: 'tree_config', type: 'GIN' },
    { name: 'idx_projects_main_tree_id', column: 'main_tree_id', type: 'BTREE' },
  ];

  for (const idx of indexes) {
    try {
      const checkIdx = await pool.query(
        `SELECT indexname 
         FROM pg_indexes 
         WHERE tablename = 'projects' 
         AND indexname = $1`,
        [idx.name]
      );

      if (checkIdx.rows.length === 0) {
        const sql = idx.type === 'GIN' 
          ? `CREATE INDEX ${idx.name} ON projects USING GIN (${idx.column})`
          : `CREATE INDEX ${idx.name} ON projects (${idx.column})`;
        
        await pool.query(sql);
        console.log(`  ✅ 創建索引: ${idx.name}`);
      }
    } catch (error) {
      console.error(`  ⚠️  創建索引 ${idx.name} 失敗:`, error);
    }
  }
}

// 執行初始化
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log('🎉 完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 失敗:', error);
      process.exit(1);
    });
}

export { initDatabase };
