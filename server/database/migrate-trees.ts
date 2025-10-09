/**
 * 樹狀圖資料遷移腳本
 * 
 * 將 projects.tree_data 遷移到獨立的 trees 表
 * 並更新 projects.main_tree_id 關聯
 */

import { Pool } from 'pg';
import { loadDatabaseConfig } from '../config/database.config.js';
import { createTreeOperations } from '../operations/tree.operations.js';

async function migrateProjectTrees() {
  const config = loadDatabaseConfig();
  const pool = new Pool(config);
  const treeOps = createTreeOperations(pool);

  try {
    console.log('🚀 開始遷移樹狀圖資料...\n');

    // 1. 查詢所有有 tree_data 的專案
    const projectsResult = await pool.query(`
      SELECT id, name, name_zh, tree_data, tree_config, tree_version
      FROM projects
      WHERE tree_data IS NOT NULL AND deleted_at IS NULL
    `);

    const projects = projectsResult.rows;
    console.log(`📊 找到 ${projects.length} 個專案需要遷移\n`);

    if (projects.length === 0) {
      console.log('✅ 沒有需要遷移的資料');
      await pool.end();
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // 2. 逐一遷移每個專案的樹狀圖
    for (const project of projects) {
      try {
        console.log(`📝 遷移專案: ${project.name} (ID: ${project.id})`);

        // 創建獨立的樹狀圖記錄
        const newTree = await treeOps.createTree({
          name: `${project.name_zh || project.name} - 專案樹狀圖`,
          description: `從專案 "${project.name}" 遷移的樹狀圖`,
          projectId: project.id,
          treeType: 'ui_layout',
          data: project.tree_data,
          config: project.tree_config || undefined,
          version: project.tree_version || 1,
          isTemplate: false,
          tags: '專案,遷移',
        });

        console.log(`   ✅ 創建樹狀圖成功 (Tree ID: ${newTree.id}, UUID: ${newTree.uuid})`);
        console.log(`   📊 節點數: ${newTree.nodeCount}, 深度: ${newTree.maxDepth}`);

        // 更新專案的 main_tree_id
        await pool.query(
          'UPDATE projects SET main_tree_id = $1 WHERE id = $2',
          [newTree.id, project.id]
        );

        console.log(`   ✅ 更新專案 main_tree_id 成功\n`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ 遷移專案 ${project.id} 失敗:`, error);
        failCount++;
      }
    }

    // 3. 顯示遷移結果
    console.log('\n' + '='.repeat(60));
    console.log('📊 遷移結果統計:');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${successCount} 個專案`);
    console.log(`❌ 失敗: ${failCount} 個專案`);
    console.log(`📊 總計: ${projects.length} 個專案`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('💡 後續步驟:');
      console.log('   1. 確認新的樹狀圖資料正確');
      console.log('   2. 更新前端代碼使用新的 API (/api/trees)');
      console.log('   3. 測試所有功能正常');
      console.log('   4. (可選) 備份後刪除 projects 表的 tree_data 欄位\n');
    }

  } catch (error) {
    console.error('❌ 遷移過程發生錯誤:', error);
  } finally {
    await pool.end();
  }
}

// 執行遷移
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProjectTrees()
    .then(() => {
      console.log('✅ 遷移腳本執行完畢');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 遷移腳本執行失敗:', error);
      process.exit(1);
    });
}

export { migrateProjectTrees };
