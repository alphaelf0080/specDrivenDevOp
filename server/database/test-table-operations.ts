/**
 * 測試 test table 的操作
 * 
 * 此腳本展示如何對 test table 進行 CRUD 操作
 */

import { getDatabase } from './db.js';

async function testTableOperations() {
  const db = getDatabase();
  
  try {
    console.log('🔌 連接資料庫...');
    await db.connect();
    
    // 1. 檢查 test table 是否存在
    console.log('\n1️⃣  檢查 test table 是否存在...');
    const exists = await db.tableExists('test');
    console.log(`   test table ${exists ? '✅ 存在' : '❌ 不存在'}`);
    
    if (!exists) {
      console.log('   ⚠️  請先執行 create-test-table.ts 建立資料表');
      return;
    }
    
    // 2. 查詢所有資料
    console.log('\n2️⃣  查詢所有測試資料...');
    const allData = await db.queryMany('SELECT * FROM test ORDER BY id');
    console.log(`   找到 ${allData.length} 筆資料:`);
    allData.forEach((row: any) => {
      console.log(`   - [${row.id}] ${row.name} (${row.status})`);
    });
    
    // 3. 插入新資料
    console.log('\n3️⃣  插入新資料...');
    const newItem = await db.insert('test', {
      name: '動態新增項目',
      description: '這是透過 API 新增的測試項目',
      status: 'active',
      data: JSON.stringify({ 
        source: 'api', 
        priority: 'high',
        tags: ['dynamic', 'api-test']
      })
    });
    console.log(`   ✅ 新增成功: ID=${newItem.id}, Name=${newItem.name}`);
    
    // 4. 查詢單一資料
    console.log('\n4️⃣  查詢單一資料...');
    const singleItem = await db.queryOne(
      'SELECT * FROM test WHERE id = $1',
      [newItem.id]
    );
    if (singleItem) {
      console.log(`   ✅ 找到資料: ${singleItem.name}`);
      console.log(`   描述: ${singleItem.description}`);
      console.log(`   JSON 資料:`, singleItem.data);
    }
    
    // 5. 更新資料
    console.log('\n5️⃣  更新資料...');
    const updatedItems = await db.update(
      'test',
      { 
        status: 'completed',
        description: '已完成的測試項目（更新後）'
      },
      { id: newItem.id }
    );
    console.log(`   ✅ 更新成功: ${updatedItems.length} 筆`);
    if (updatedItems[0]) {
      console.log(`   新狀態: ${updatedItems[0].status}`);
      console.log(`   新描述: ${updatedItems[0].description}`);
    }
    
    // 6. 使用 WHERE 條件查詢
    console.log('\n6️⃣  查詢 active 狀態的項目...');
    const activeItems = await db.queryMany(
      'SELECT * FROM test WHERE status = $1 ORDER BY created_at DESC',
      ['active']
    );
    console.log(`   找到 ${activeItems.length} 筆 active 項目`);
    
    // 7. 使用 JSONB 查詢
    console.log('\n7️⃣  使用 JSONB 查詢 (priority = high)...');
    const highPriorityItems = await db.queryMany(
      "SELECT * FROM test WHERE data->>'priority' = $1",
      ['high']
    );
    console.log(`   找到 ${highPriorityItems.length} 筆高優先級項目`);
    highPriorityItems.forEach((row: any) => {
      console.log(`   - ${row.name}`);
    });
    
    // 8. 統計資料
    console.log('\n8️⃣  統計資料...');
    const stats = await db.queryOne(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM test
    `);
    console.log(`   總計: ${stats.total} 筆`);
    console.log(`   Active: ${stats.active_count} 筆`);
    console.log(`   Inactive: ${stats.inactive_count} 筆`);
    console.log(`   Completed: ${stats.completed_count} 筆`);
    
    // 9. 交易範例
    console.log('\n9️⃣  交易範例 (插入兩筆資料)...');
    const transactionResult = await db.transaction(async (client) => {
      const item1 = await client.query(
        'INSERT INTO test (name, description, status) VALUES ($1, $2, $3) RETURNING *',
        ['交易測試 1', '第一筆交易資料', 'active']
      );
      
      const item2 = await client.query(
        'INSERT INTO test (name, description, status) VALUES ($1, $2, $3) RETURNING *',
        ['交易測試 2', '第二筆交易資料', 'active']
      );
      
      return {
        count: 2,
        ids: [item1.rows[0].id, item2.rows[0].id]
      };
    });
    console.log(`   ✅ 交易成功: 插入 ${transactionResult.count} 筆資料`);
    console.log(`   IDs: ${transactionResult.ids.join(', ')}`);
    
    // 10. 批次插入
    console.log('\n🔟 批次插入範例...');
    const batchData = [
      { name: '批次項目 1', description: '批次插入測試 1', status: 'active' },
      { name: '批次項目 2', description: '批次插入測試 2', status: 'active' },
      { name: '批次項目 3', description: '批次插入測試 3', status: 'active' },
    ];
    const batchResults = await db.batchInsert('test', batchData);
    console.log(`   ✅ 批次插入成功: ${batchResults.length} 筆`);
    
    // 11. 最終統計
    console.log('\n📊 最終統計...');
    const finalCount = await db.queryOne('SELECT COUNT(*) as total FROM test');
    console.log(`   test table 總共有 ${finalCount.total} 筆資料`);
    
    // 12. 顯示連線池狀態
    console.log('\n🔗 連線池狀態:');
    const poolStatus = db.getPoolStatus();
    if (poolStatus) {
      console.log(`   總連線數: ${poolStatus.totalCount}`);
      console.log(`   閒置連線: ${poolStatus.idleCount}`);
      console.log(`   等待連線: ${poolStatus.waitingCount}`);
    }
    
    console.log('\n✅ 所有測試完成！');
    
  } catch (error) {
    console.error('\n❌ 測試失敗:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

// 執行測試
if (import.meta.url === `file://${process.argv[1]}`) {
  testTableOperations().catch((error) => {
    console.error('執行失敗:', error);
    process.exit(1);
  });
}

export { testTableOperations };
