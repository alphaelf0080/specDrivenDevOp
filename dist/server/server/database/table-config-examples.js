/**
 * Table Config 和 SQL Generator 使用範例
 */
import { getTableConfig, getAllTableNames, getTableColumns, getPrimaryKeyColumn, hasColumn, getColumnDefinition, } from '../config/table.config.js';
import { generateCreateTableSQL, generateAllIndexesSQL, generateFullTableSQL, generateAllTablesSQL, generateSelectSQL, generateInsertSQL, generateUpdateSQL, generateDeleteSQL, validateData, } from './sql-generator.js';
import { getDatabase } from './db.js';
/**
 * 範例 1: 查看資料表配置
 */
export function example1_viewTableConfig() {
    console.log('=== 範例 1: 查看資料表配置 ===\n');
    // 取得所有資料表名稱
    console.log('所有資料表:');
    const tableNames = getAllTableNames();
    console.log(tableNames);
    console.log('');
    // 取得特定資料表的配置
    console.log('users 資料表配置:');
    const usersConfig = getTableConfig('users');
    console.log(JSON.stringify(usersConfig, null, 2));
    console.log('');
    // 取得資料表的欄位
    console.log('test 資料表的欄位:');
    const testColumns = getTableColumns('test');
    console.log(testColumns);
    console.log('');
    // 取得主鍵欄位
    console.log('users 資料表的主鍵:');
    const pk = getPrimaryKeyColumn('users');
    console.log(pk);
    console.log('');
    // 檢查欄位是否存在
    console.log('test 資料表是否有 name 欄位:', hasColumn('test', 'name'));
    console.log('test 資料表是否有 xxx 欄位:', hasColumn('test', 'xxx'));
    console.log('');
    // 取得欄位定義
    console.log('test.name 欄位定義:');
    const nameColumn = getColumnDefinition('test', 'name');
    console.log(JSON.stringify(nameColumn, null, 2));
}
/**
 * 範例 2: 生成 CREATE TABLE SQL
 */
export function example2_generateCreateTableSQL() {
    console.log('\n=== 範例 2: 生成 CREATE TABLE SQL ===\n');
    // 生成單一資料表的 CREATE TABLE 語句
    console.log('生成 test 資料表的 CREATE TABLE 語句:');
    const createSQL = generateCreateTableSQL('test');
    console.log(createSQL);
    console.log('');
    // 生成索引語句
    console.log('生成 test 資料表的索引語句:');
    const indexesSQL = generateAllIndexesSQL('test');
    console.log(indexesSQL);
    console.log('');
    // 生成完整的資料表 SQL（包含索引）
    console.log('生成完整的 test 資料表 SQL:');
    const fullSQL = generateFullTableSQL('test');
    console.log(fullSQL);
}
/**
 * 範例 3: 生成所有資料表的 SQL
 */
export function example3_generateAllTablesSQL() {
    console.log('\n=== 範例 3: 生成所有資料表的 SQL ===\n');
    const allSQL = generateAllTablesSQL();
    console.log(allSQL);
}
/**
 * 範例 4: 生成查詢語句
 */
export function example4_generateSelectSQL() {
    console.log('\n=== 範例 4: 生成查詢語句 ===\n');
    // 簡單查詢
    console.log('1. 查詢所有資料:');
    const query1 = generateSelectSQL('test');
    console.log('SQL:', query1.sql);
    console.log('Params:', query1.params);
    console.log('');
    // 指定欄位
    console.log('2. 查詢特定欄位:');
    const query2 = generateSelectSQL('test', {
        columns: ['id', 'name', 'status'],
    });
    console.log('SQL:', query2.sql);
    console.log('');
    // 使用 WHERE 條件
    console.log('3. 使用 WHERE 條件:');
    const query3 = generateSelectSQL('test', {
        where: { status: 'active', id: 1 },
    });
    console.log('SQL:', query3.sql);
    console.log('Params:', query3.params);
    console.log('');
    // 使用 ORDER BY, LIMIT, OFFSET
    console.log('4. 使用 ORDER BY, LIMIT, OFFSET:');
    const query4 = generateSelectSQL('test', {
        orderBy: 'created_at DESC',
        limit: 10,
        offset: 0,
    });
    console.log('SQL:', query4.sql);
    console.log('');
}
/**
 * 範例 5: 生成 INSERT 語句
 */
export function example5_generateInsertSQL() {
    console.log('\n=== 範例 5: 生成 INSERT 語句 ===\n');
    const data = {
        name: '測試項目',
        description: '這是一個測試',
        status: 'active',
        data: JSON.stringify({ priority: 'high' }),
    };
    const insertQuery = generateInsertSQL('test', data);
    console.log('SQL:', insertQuery.sql);
    console.log('Params:', insertQuery.params);
}
/**
 * 範例 6: 生成 UPDATE 語句
 */
export function example6_generateUpdateSQL() {
    console.log('\n=== 範例 6: 生成 UPDATE 語句 ===\n');
    const data = {
        status: 'completed',
        description: '已完成的項目',
    };
    const where = {
        id: 1,
    };
    const updateQuery = generateUpdateSQL('test', data, where);
    console.log('SQL:', updateQuery.sql);
    console.log('Params:', updateQuery.params);
}
/**
 * 範例 7: 生成 DELETE 語句
 */
export function example7_generateDeleteSQL() {
    console.log('\n=== 範例 7: 生成 DELETE 語句 ===\n');
    const where = {
        id: 1,
        status: 'inactive',
    };
    const deleteQuery = generateDeleteSQL('test', where);
    console.log('SQL:', deleteQuery.sql);
    console.log('Params:', deleteQuery.params);
}
/**
 * 範例 8: 資料驗證
 */
export function example8_validateData() {
    console.log('\n=== 範例 8: 資料驗證 ===\n');
    // 有效的資料
    console.log('1. 驗證有效資料:');
    const validData = {
        name: '測試',
        status: 'active',
    };
    const validation1 = validateData('test', validData);
    console.log('Valid:', validation1.valid);
    console.log('Errors:', validation1.errors);
    console.log('');
    // 缺少必填欄位
    console.log('2. 缺少必填欄位:');
    const invalidData1 = {
        status: 'active',
    };
    const validation2 = validateData('test', invalidData1);
    console.log('Valid:', validation2.valid);
    console.log('Errors:', validation2.errors);
    console.log('');
    // 包含未定義欄位
    console.log('3. 包含未定義欄位:');
    const invalidData2 = {
        name: '測試',
        unknown_field: 'value',
    };
    const validation3 = validateData('test', invalidData2);
    console.log('Valid:', validation3.valid);
    console.log('Errors:', validation3.errors);
}
/**
 * 範例 9: 使用生成的 SQL 執行資料庫操作
 */
export async function example9_executeSQLQueries() {
    console.log('\n=== 範例 9: 使用生成的 SQL 執行資料庫操作 ===\n');
    const db = getDatabase();
    try {
        await db.connect();
        // 1. 插入資料
        console.log('1. 插入資料:');
        const insertData = {
            name: 'SQL Generator 測試',
            description: '使用 SQL Generator 插入的資料',
            status: 'active',
        };
        const insertQuery = generateInsertSQL('test', insertData);
        const insertResult = await db.query(insertQuery.sql, insertQuery.params);
        console.log('插入成功:', insertResult.rows[0]);
        console.log('');
        const newId = insertResult.rows[0].id;
        // 2. 查詢資料
        console.log('2. 查詢資料:');
        const selectQuery = generateSelectSQL('test', {
            where: { id: newId },
        });
        const selectResult = await db.query(selectQuery.sql, selectQuery.params);
        console.log('查詢結果:', selectResult.rows[0]);
        console.log('');
        // 3. 更新資料
        console.log('3. 更新資料:');
        const updateData = {
            status: 'completed',
            description: '已更新的描述',
        };
        const updateQuery = generateUpdateSQL('test', updateData, { id: newId });
        const updateResult = await db.query(updateQuery.sql, updateQuery.params);
        console.log('更新成功:', updateResult.rows[0]);
        console.log('');
        // 4. 刪除資料
        console.log('4. 刪除資料:');
        const deleteQuery = generateDeleteSQL('test', { id: newId });
        await db.query(deleteQuery.sql, deleteQuery.params);
        console.log('刪除成功');
        console.log('');
    }
    catch (error) {
        console.error('執行失敗:', error);
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 主函式
 */
export async function main() {
    // 顯示非資料庫操作的範例
    example1_viewTableConfig();
    example2_generateCreateTableSQL();
    // example3_generateAllTablesSQL(); // 輸出較多，可選擇執行
    example4_generateSelectSQL();
    example5_generateInsertSQL();
    example6_generateUpdateSQL();
    example7_generateDeleteSQL();
    example8_validateData();
    // 需要資料庫連線的範例
    // await example9_executeSQLQueries();
}
// 如果直接執行此檔案
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
//# sourceMappingURL=table-config-examples.js.map