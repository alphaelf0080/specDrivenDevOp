/**
 * 建立測試資料表
 *
 * 此腳本用於建立一個測試用的資料表並插入測試資料
 */
import { getDatabase } from './db.js';
/**
 * 建立 test table 的 SQL
 */
const CREATE_TEST_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;
/**
 * 建立索引
 */
const CREATE_TEST_INDEXES_SQL = `
  CREATE INDEX IF NOT EXISTS idx_test_name ON test(name);
  CREATE INDEX IF NOT EXISTS idx_test_status ON test(status);
  CREATE INDEX IF NOT EXISTS idx_test_data ON test USING gin(data);
`;
/**
 * 建立自動更新 updated_at 的觸發器
 */
const CREATE_TEST_TRIGGER_SQL = `
  DROP TRIGGER IF EXISTS update_test_updated_at ON test;
  
  CREATE TRIGGER update_test_updated_at 
    BEFORE UPDATE ON test 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
`;
/**
 * 插入測試資料
 */
const INSERT_TEST_DATA_SQL = `
  INSERT INTO test (name, description, status, data) VALUES
    ('測試項目 1', '這是第一個測試項目', 'active', '{"priority": "high", "tags": ["test", "demo"]}'),
    ('測試項目 2', '這是第二個測試項目', 'active', '{"priority": "medium", "tags": ["test"]}'),
    ('測試項目 3', '這是第三個測試項目', 'inactive', '{"priority": "low", "tags": ["demo"]}')
  ON CONFLICT DO NOTHING;
`;
/**
 * 建立 test table
 */
async function createTestTable() {
    const db = getDatabase();
    try {
        console.log('🔌 正在連接資料庫...');
        await db.connect();
        console.log('📋 正在建立 test 資料表...');
        await db.query(CREATE_TEST_TABLE_SQL);
        console.log('✅ test 資料表建立成功');
        console.log('📊 正在建立索引...');
        await db.query(CREATE_TEST_INDEXES_SQL);
        console.log('✅ 索引建立成功');
        console.log('⚙️  正在建立觸發器...');
        await db.query(CREATE_TEST_TRIGGER_SQL);
        console.log('✅ 觸發器建立成功');
        console.log('📝 正在插入測試資料...');
        await db.query(INSERT_TEST_DATA_SQL);
        console.log('✅ 測試資料插入成功');
        // 驗證資料表
        console.log('\n🔍 驗證資料表...');
        const tableExists = await db.tableExists('test');
        console.log('test 資料表存在:', tableExists);
        // 查詢測試資料
        const testData = await db.queryMany('SELECT * FROM test ORDER BY id');
        console.log('\n📦 測試資料 (%d 筆):', testData.length);
        testData.forEach((row) => {
            console.log(`  - ID: ${row.id}, Name: ${row.name}, Status: ${row.status}`);
        });
        // 顯示資料表結構
        console.log('\n🏗️  資料表結構:');
        const columns = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'test'
      ORDER BY ordinal_position
    `);
        columns.rows.forEach((col) => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        console.log('\n✨ 完成！test 資料表已準備就緒');
    }
    catch (error) {
        console.error('❌ 建立 test 資料表失敗:', error);
        throw error;
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 刪除 test table（清理用）
 */
async function dropTestTable() {
    const db = getDatabase();
    try {
        await db.connect();
        console.log('🗑️  正在刪除 test 資料表...');
        await db.query('DROP TABLE IF EXISTS test CASCADE');
        console.log('✅ test 資料表已刪除');
    }
    catch (error) {
        console.error('❌ 刪除失敗:', error);
        throw error;
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 主要執行函式
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (command === 'drop') {
        await dropTestTable();
    }
    else {
        await createTestTable();
    }
}
// 如果直接執行此檔案
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('執行失敗:', error);
        process.exit(1);
    });
}
export { createTestTable, dropTestTable };
//# sourceMappingURL=create-test-table.js.map