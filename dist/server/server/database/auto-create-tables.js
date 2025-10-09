/**
 * 使用 Table Config 自動建立資料表
 *
 * 此腳本會根據 table.config.ts 中的定義自動建立所有資料表
 */
import { getDatabase } from './db.js';
import { generateAllTablesSQL, generateCreateTableSQL, generateAllIndexesSQL, } from './sql-generator.js';
import { getAllTableNames } from '../config/table.config.js';
/**
 * 建立單一資料表
 */
async function createTable(tableName, db) {
    try {
        console.log(`📋 建立資料表: ${tableName}`);
        // 生成 CREATE TABLE SQL
        const createSQL = generateCreateTableSQL(tableName);
        await db.query(createSQL);
        console.log(`   ✅ 資料表建立成功`);
        // 生成並執行索引 SQL
        const indexesSQL = generateAllIndexesSQL(tableName);
        if (indexesSQL) {
            const indexStatements = indexesSQL
                .split(';')
                .filter(s => s.trim())
                .map(s => s.trim() + ';');
            for (const indexSQL of indexStatements) {
                await db.query(indexSQL);
            }
            console.log(`   ✅ 索引建立成功`);
        }
        return true;
    }
    catch (error) {
        console.error(`   ❌ 建立失敗:`, error.message);
        return false;
    }
}
/**
 * 建立所有資料表
 */
async function createAllTables() {
    const db = getDatabase();
    try {
        console.log('🔌 連接資料庫...');
        await db.connect();
        console.log('✅ 資料庫連線成功\n');
        // 啟用 UUID 擴展
        console.log('⚙️  啟用 UUID 擴展...');
        await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('✅ UUID 擴展已啟用\n');
        // 建立觸發器函數（如果不存在）
        console.log('⚙️  建立更新時間戳觸發器函數...');
        await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
        console.log('✅ 觸發器函數建立成功\n');
        // 取得所有資料表名稱
        const tableNames = getAllTableNames();
        console.log(`📊 準備建立 ${tableNames.length} 個資料表\n`);
        // 建立資料表（按順序，處理外鍵依賴）
        const successCount = { count: 0 };
        const failedTables = [];
        // 第一輪：建立沒有外鍵依賴的資料表
        for (const tableName of tableNames) {
            const success = await createTable(tableName, db);
            if (success) {
                successCount.count++;
            }
            else {
                failedTables.push(tableName);
            }
            console.log('');
        }
        // 建立觸發器
        console.log('⚙️  建立自動更新 updated_at 的觸發器...');
        for (const tableName of tableNames) {
            try {
                await db.query(`
          DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName};
          CREATE TRIGGER update_${tableName}_updated_at 
            BEFORE UPDATE ON ${tableName} 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        `);
                console.log(`   ✅ ${tableName} 觸發器建立成功`);
            }
            catch (error) {
                console.log(`   ⚠️  ${tableName} 觸發器建立失敗: ${error.message}`);
            }
        }
        console.log('');
        // 顯示結果
        console.log('📊 建立結果:');
        console.log(`   成功: ${successCount.count} 個資料表`);
        console.log(`   失敗: ${failedTables.length} 個資料表`);
        if (failedTables.length > 0) {
            console.log(`   失敗的資料表: ${failedTables.join(', ')}`);
        }
        console.log('');
        // 驗證資料表
        console.log('🔍 驗證資料表...');
        const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
        console.log(`   找到 ${result.rows.length} 個資料表:`);
        result.rows.forEach((row) => {
            console.log(`   - ${row.table_name}`);
        });
        console.log('');
        console.log('✨ 完成！所有資料表已建立');
    }
    catch (error) {
        console.error('❌ 執行失敗:', error);
        throw error;
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 輸出所有資料表的 SQL 到檔案
 */
async function exportSQL() {
    console.log('📝 生成所有資料表的 SQL...\n');
    const allSQL = generateAllTablesSQL();
    console.log(allSQL);
    console.log('\n✅ SQL 生成完成');
    console.log('💡 提示: 你可以將上面的 SQL 複製到檔案中執行');
}
/**
 * 刪除所有資料表（危險操作！）
 */
async function dropAllTables() {
    const db = getDatabase();
    try {
        console.log('⚠️  警告: 即將刪除所有資料表！');
        console.log('');
        await db.connect();
        const tableNames = getAllTableNames().reverse(); // 反向刪除，處理外鍵依賴
        for (const tableName of tableNames) {
            try {
                console.log(`🗑️  刪除資料表: ${tableName}`);
                await db.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
                console.log(`   ✅ 刪除成功`);
            }
            catch (error) {
                console.log(`   ❌ 刪除失敗: ${error.message}`);
            }
        }
        console.log('\n✅ 所有資料表已刪除');
    }
    catch (error) {
        console.error('❌ 執行失敗:', error);
        throw error;
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 主函式
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    switch (command) {
        case 'create':
            await createAllTables();
            break;
        case 'export':
            await exportSQL();
            break;
        case 'drop':
            await dropAllTables();
            break;
        default:
            console.log('使用方式:');
            console.log('  npm run db:create-tables       建立所有資料表');
            console.log('  npm run db:export-sql          輸出 SQL 到終端');
            console.log('  npm run db:drop-tables         刪除所有資料表（危險！）');
            console.log('');
            console.log('或直接執行:');
            console.log('  tsx server/database/auto-create-tables.ts create');
            console.log('  tsx server/database/auto-create-tables.ts export');
            console.log('  tsx server/database/auto-create-tables.ts drop');
    }
}
// 如果直接執行此檔案
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('執行失敗:', error);
        process.exit(1);
    });
}
export { createAllTables, exportSQL, dropAllTables };
//# sourceMappingURL=auto-create-tables.js.map