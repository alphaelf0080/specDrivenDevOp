/**
 * PostgreSQL 資料庫使用範例
 * 
 * 展示如何使用資料庫操作模組進行各種資料庫操作
 */

import { getDatabase } from './db.js';

/**
 * 範例：基本查詢操作
 */
export async function exampleBasicQuery() {
  const db = getDatabase();
  await db.connect();

  try {
    // 執行簡單查詢
    const result = await db.query('SELECT NOW() as current_time');
    console.log('當前時間:', result.rows[0].current_time);

    // 查詢單一結果
    const user = await db.queryOne(
      'SELECT * FROM users WHERE id = $1',
      [1]
    );
    console.log('使用者:', user);

    // 查詢多筆結果
    const users = await db.queryMany(
      'SELECT * FROM users WHERE active = $1',
      [true]
    );
    console.log('活躍使用者數量:', users.length);

  } catch (error) {
    console.error('查詢失敗:', error);
  }
}

/**
 * 範例：INSERT 操作
 */
export async function exampleInsert() {
  const db = getDatabase();
  await db.connect();

  try {
    const newUser = await db.insert('users', {
      username: 'john_doe',
      email: 'john@example.com',
      created_at: new Date(),
    });

    console.log('新增使用者:', newUser);
  } catch (error) {
    console.error('插入失敗:', error);
  }
}

/**
 * 範例：UPDATE 操作
 */
export async function exampleUpdate() {
  const db = getDatabase();
  await db.connect();

  try {
    const updatedUsers = await db.update(
      'users',
      { email: 'newemail@example.com', updated_at: new Date() },
      { username: 'john_doe' }
    );

    console.log('更新的使用者:', updatedUsers);
  } catch (error) {
    console.error('更新失敗:', error);
  }
}

/**
 * 範例：DELETE 操作
 */
export async function exampleDelete() {
  const db = getDatabase();
  await db.connect();

  try {
    const deletedCount = await db.delete(
      'users',
      { username: 'john_doe' }
    );

    console.log('刪除的記錄數:', deletedCount);
  } catch (error) {
    console.error('刪除失敗:', error);
  }
}

/**
 * 範例：交易操作
 */
export async function exampleTransaction() {
  const db = getDatabase();
  await db.connect();

  try {
    const result = await db.transaction(async (client) => {
      // 在交易中執行多個操作
      await client.query(
        'INSERT INTO accounts (user_id, balance) VALUES ($1, $2)',
        [1, 1000]
      );

      await client.query(
        'INSERT INTO transactions (account_id, amount, type) VALUES ($1, $2, $3)',
        [1, 1000, 'deposit']
      );

      return { success: true };
    });

    console.log('交易結果:', result);
  } catch (error) {
    console.error('交易失敗:', error);
  }
}

/**
 * 範例：批次插入
 */
export async function exampleBatchInsert() {
  const db = getDatabase();
  await db.connect();

  try {
    const users = [
      { username: 'user1', email: 'user1@example.com' },
      { username: 'user2', email: 'user2@example.com' },
      { username: 'user3', email: 'user3@example.com' },
    ];

    const insertedUsers = await db.batchInsert('users', users);
    console.log('批次插入的使用者數量:', insertedUsers.length);
  } catch (error) {
    console.error('批次插入失敗:', error);
  }
}

/**
 * 範例：檢查資料表是否存在
 */
export async function exampleTableCheck() {
  const db = getDatabase();
  await db.connect();

  try {
    const exists = await db.tableExists('users');
    console.log('users 資料表存在:', exists);

    // 取得連線池狀態
    const poolStatus = db.getPoolStatus();
    console.log('連線池狀態:', poolStatus);
  } catch (error) {
    console.error('檢查失敗:', error);
  }
}

/**
 * 主要執行函式（用於測試）
 */
export async function main() {
  const db = getDatabase();

  try {
    await db.connect();

    console.log('\n=== 執行範例 ===\n');

    // 執行各種範例
    // await exampleBasicQuery();
    // await exampleInsert();
    // await exampleUpdate();
    // await exampleDelete();
    // await exampleTransaction();
    // await exampleBatchInsert();
    await exampleTableCheck();

  } catch (error) {
    console.error('執行失敗:', error);
  } finally {
    await db.disconnect();
  }
}

// 如果直接執行此檔案
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
