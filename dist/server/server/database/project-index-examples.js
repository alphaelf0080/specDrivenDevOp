/**
 * 專案索引資料表使用範例
 *
 * 展示如何使用 project_index 資料表進行遊戲專案管理
 */
import { generateInsertSQL, generateSelectSQL, generateUpdateSQL } from './sql-generator.js';
import { getDatabase } from './db.js';
/**
 * 範例 1：新增 Slot 遊戲專案
 */
async function example1_createSlotGame() {
    console.log('\n=== 範例 1：新增 Slot 遊戲專案 ===\n');
    const gameData = {
        game_id: 'BFG_001',
        game_name_en: 'Buffalo Fury',
        game_name_cn: '狂暴水牛',
        search_key: '水牛,buffalo,fury,狂暴,動物,animal',
        description: '一款以美國西部野牛為主題的 5x4 slot 遊戲，具有免費旋轉和累積倍數功能',
        game_type: 'slot',
        reel_count: 5,
        row_count: 4,
        payline_count: 1024,
        has_free_spin: true,
        has_bonus_game: false,
        has_wild: true,
        has_scatter: true,
        has_multiplier: true,
        max_win_multiplier: 5000,
        rtp: 96.50,
        volatility: 'high',
        theme: '美國西部野牛',
        min_bet: 0.20,
        max_bet: 100.00,
        dev_status: 'in_progress',
        dev_progress: 45,
        platform_support: JSON.stringify({
            mobile: true,
            desktop: true,
            tablet: true
        }),
        screen_orientation: 'landscape',
        supported_languages: JSON.stringify(['en', 'zh-CN', 'zh-TW', 'ja', 'ko']),
        features: JSON.stringify([
            'Free Spins',
            'Multiplier',
            'Wild Symbol',
            'Scatter Symbol',
            '1024 Ways to Win'
        ]),
        tags: JSON.stringify(['popular', 'high_volatility', 'animal_theme']),
        category: 'video_slot',
        sort_order: 1,
        is_active: true,
        is_featured: true,
    };
    const query = generateInsertSQL('project_index', gameData);
    console.log('生成的 SQL:');
    console.log(query.sql);
    console.log('\n參數:');
    console.log(query.params);
}
/**
 * 範例 2：查詢所有 Slot 遊戲
 */
async function example2_querySlotGames() {
    console.log('\n=== 範例 2：查詢所有 Slot 遊戲 ===\n');
    const query = generateSelectSQL('project_index', {
        columns: ['game_id', 'game_name_en', 'game_name_cn', 'dev_status', 'rtp'],
        where: {
            game_type: 'slot',
            is_active: true,
        },
        orderBy: 'sort_order ASC, created_at DESC',
    });
    console.log('生成的 SQL:');
    console.log(query.sql);
    console.log('\n參數:');
    console.log(query.params);
}
/**
 * 範例 3：搜尋遊戲（多條件）
 */
async function example3_searchGames() {
    console.log('\n=== 範例 3：搜尋遊戲（多條件） ===\n');
    const query = generateSelectSQL('project_index', {
        columns: ['game_id', 'game_name_en', 'game_name_cn', 'theme', 'rtp'],
        where: {
            has_free_spin: true,
            volatility: 'high',
            is_active: true,
        },
        orderBy: 'rtp DESC',
        limit: 10,
    });
    console.log('生成的 SQL:');
    console.log(query.sql);
    console.log('\n參數:');
    console.log(query.params);
}
/**
 * 範例 4：更新開發進度
 */
async function example4_updateProgress() {
    console.log('\n=== 範例 4：更新開發進度 ===\n');
    const query = generateUpdateSQL('project_index', {
        dev_progress: 75,
        dev_status: 'testing',
    }, {
        game_id: 'BFG_001',
    });
    console.log('生成的 SQL:');
    console.log(query.sql);
    console.log('\n參數:');
    console.log(query.params);
}
/**
 * 範例 5：查詢精選遊戲
 */
async function example5_queryFeaturedGames() {
    console.log('\n=== 範例 5：查詢精選遊戲 ===\n');
    const query = generateSelectSQL('project_index', {
        columns: [
            'game_id',
            'game_name_en',
            'game_name_cn',
            'thumbnail_url',
            'rtp',
            'max_win_multiplier'
        ],
        where: {
            is_featured: true,
            is_active: true,
        },
        orderBy: 'sort_order ASC',
        limit: 5,
    });
    console.log('生成的 SQL:');
    console.log(query.sql);
    console.log('\n參數:');
    console.log(query.params);
}
/**
 * 範例 6：實際執行 - 建立遊戲
 */
async function example6_executeCreate() {
    console.log('\n=== 範例 6：實際執行 - 建立遊戲 ===\n');
    const db = getDatabase();
    try {
        await db.connect();
        const gameData = {
            game_id: 'TEST_SLOT_001',
            game_name_en: 'Test Slot Game',
            game_name_cn: '測試老虎機',
            search_key: 'test,測試,slot',
            description: '測試用的 slot 遊戲',
            game_type: 'slot',
            reel_count: 5,
            row_count: 3,
            payline_count: 20,
            has_free_spin: true,
            has_wild: true,
            rtp: 96.00,
            volatility: 'medium',
            dev_status: 'planning',
            dev_progress: 0,
        };
        const query = generateInsertSQL('project_index', gameData);
        const result = await db.query(query.sql, query.params);
        console.log('建立成功！');
        console.log('新增的遊戲:', result.rows[0]);
    }
    catch (error) {
        console.error('執行錯誤:', error);
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 範例 7：實際執行 - 查詢遊戲列表
 */
async function example7_executeQuery() {
    console.log('\n=== 範例 7：實際執行 - 查詢遊戲列表 ===\n');
    const db = getDatabase();
    try {
        await db.connect();
        const query = generateSelectSQL('project_index', {
            columns: ['game_id', 'game_name_en', 'game_name_cn', 'dev_status'],
            where: {
                is_active: true,
            },
            orderBy: 'created_at DESC',
            limit: 5,
        });
        const result = await db.query(query.sql, query.params);
        console.log(`找到 ${result.rowCount} 個遊戲：`);
        result.rows.forEach((game, index) => {
            console.log(`${index + 1}. [${game.game_id}] ${game.game_name_en} (${game.game_name_cn}) - ${game.dev_status}`);
        });
    }
    catch (error) {
        console.error('執行錯誤:', error);
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 範例 8：複雜查詢 - 使用 JSONB 欄位
 */
async function example8_jsonbQuery() {
    console.log('\n=== 範例 8：複雜查詢 - 使用 JSONB 欄位 ===\n');
    const db = getDatabase();
    try {
        await db.connect();
        // 查詢支援手機平台的遊戲
        const sql = `
      SELECT 
        game_id,
        game_name_en,
        game_name_cn,
        platform_support,
        features
      FROM project_index
      WHERE 
        platform_support->>'mobile' = 'true'
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT 5
    `;
        const result = await db.query(sql);
        console.log(`找到 ${result.rowCount} 個支援手機的遊戲：`);
        result.rows.forEach((game, index) => {
            console.log(`${index + 1}. [${game.game_id}] ${game.game_name_en}`);
            console.log(`   平台支援:`, game.platform_support);
            console.log(`   特色功能:`, game.features);
        });
    }
    catch (error) {
        console.error('執行錯誤:', error);
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 範例 9：批次插入遊戲
 */
async function example9_batchInsert() {
    console.log('\n=== 範例 9：批次插入遊戲 ===\n');
    const db = getDatabase();
    try {
        await db.connect();
        const games = [
            {
                game_id: 'FRUIT_001',
                game_name_en: 'Fruit Paradise',
                game_name_cn: '水果天堂',
                game_type: 'slot',
                reel_count: 3,
                row_count: 3,
                theme: '水果',
                volatility: 'low',
                rtp: 95.50,
            },
            {
                game_id: 'EGYPT_001',
                game_name_en: 'Pharaoh Gold',
                game_name_cn: '法老黃金',
                game_type: 'slot',
                reel_count: 5,
                row_count: 4,
                theme: '古埃及',
                volatility: 'high',
                rtp: 96.80,
            },
            {
                game_id: 'OCEAN_001',
                game_name_en: 'Ocean Treasure',
                game_name_cn: '海洋寶藏',
                game_type: 'slot',
                reel_count: 5,
                row_count: 3,
                theme: '海洋',
                volatility: 'medium',
                rtp: 96.20,
            },
        ];
        const results = await db.batchInsert('project_index', games);
        console.log(`批次插入成功！共插入 ${results.length} 個遊戲：`);
        results.forEach((game, index) => {
            console.log(`${index + 1}. [${game.game_id}] ${game.game_name_en}`);
        });
    }
    catch (error) {
        console.error('執行錯誤:', error);
    }
    finally {
        await db.disconnect();
    }
}
/**
 * 範例 10：統計查詢
 */
async function example10_statistics() {
    console.log('\n=== 範例 10：統計查詢 ===\n');
    const db = getDatabase();
    try {
        await db.connect();
        // 按開發狀態統計
        const statusStats = await db.query(`
      SELECT 
        dev_status,
        COUNT(*) as count,
        AVG(dev_progress) as avg_progress
      FROM project_index
      WHERE is_active = true
      GROUP BY dev_status
      ORDER BY count DESC
    `);
        console.log('開發狀態統計：');
        statusStats.rows.forEach(stat => {
            console.log(`  ${stat.dev_status}: ${stat.count} 個專案 (平均進度: ${stat.avg_progress}%)`);
        });
        // 按遊戲類型統計
        const typeStats = await db.query(`
      SELECT 
        game_type,
        COUNT(*) as count,
        AVG(rtp) as avg_rtp
      FROM project_index
      WHERE is_active = true
      GROUP BY game_type
      ORDER BY count DESC
    `);
        console.log('\n遊戲類型統計：');
        typeStats.rows.forEach(stat => {
            console.log(`  ${stat.game_type}: ${stat.count} 個遊戲 (平均 RTP: ${stat.avg_rtp}%)`);
        });
    }
    catch (error) {
        console.error('執行錯誤:', error);
    }
    finally {
        await db.disconnect();
    }
}
// 執行所有範例
async function runAllExamples() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║          專案索引資料表 (project_index) 使用範例                ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    // SQL 生成範例（不執行）
    await example1_createSlotGame();
    await example2_querySlotGames();
    await example3_searchGames();
    await example4_updateProgress();
    await example5_queryFeaturedGames();
    // 實際執行範例（需要資料庫連線）
    // 取消註解以執行
    // await example6_executeCreate();
    // await example7_executeQuery();
    // await example8_jsonbQuery();
    // await example9_batchInsert();
    // await example10_statistics();
    console.log('\n✅ 所有範例執行完成！');
}
// 執行
runAllExamples().catch(console.error);
//# sourceMappingURL=project-index-examples.js.map