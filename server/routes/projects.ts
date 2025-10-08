import { Router, Request, Response } from 'express';
import { getDatabase } from '../database/db.js';

const router = Router();
const db = getDatabase();

// 專案資料類型
interface ProjectData {
  name: string;
  name_zh: string;
  name_en: string;
  game_type: string;
  description?: string;
  status?: string;
  owner_id?: number;
}

/**
 * 獲取所有專案
 * GET /api/projects
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('❌ 獲取專案列表失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取專案列表失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 獲取單一專案
 * GET /api/projects/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM projects WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '專案不存在',
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ 獲取專案失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取專案失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 創建新專案
 * POST /api/projects
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      name_zh,
      name_en,
      game_type,
      description,
      status = 'active',
      owner_id,
    }: ProjectData = req.body;
    
    // 驗證必填欄位
    if (!name || !name_zh || !name_en || !game_type) {
      return res.status(400).json({
        success: false,
        error: '缺少必填欄位',
        required: ['name', 'name_zh', 'name_en', 'game_type'],
      });
    }
    
    const result = await db.query(
      `INSERT INTO projects (
        name, name_zh, name_en, game_type, description, status, owner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [name, name_zh, name_en, game_type, description || null, status, owner_id || null]
    );
    
    console.log('✅ 專案創建成功:', result.rows[0].name);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '專案創建成功',
    });
  } catch (error) {
    console.error('❌ 創建專案失敗:', error);
    res.status(500).json({
      success: false,
      error: '創建專案失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 更新專案
 * PUT /api/projects/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      name_zh,
      name_en,
      game_type,
      description,
      status,
      owner_id,
    }: Partial<ProjectData> = req.body;
    
    // 檢查專案是否存在
    const checkResult = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '專案不存在',
      });
    }
    
    // 構建更新語句
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (name_zh !== undefined) {
      updates.push(`name_zh = $${paramIndex++}`);
      values.push(name_zh);
    }
    if (name_en !== undefined) {
      updates.push(`name_en = $${paramIndex++}`);
      values.push(name_en);
    }
    if (game_type !== undefined) {
      updates.push(`game_type = $${paramIndex++}`);
      values.push(game_type);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (owner_id !== undefined) {
      updates.push(`owner_id = $${paramIndex++}`);
      values.push(owner_id);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await db.query(
      `UPDATE projects 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    
    console.log('✅ 專案更新成功:', result.rows[0].name);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: '專案更新成功',
    });
  } catch (error) {
    console.error('❌ 更新專案失敗:', error);
    res.status(500).json({
      success: false,
      error: '更新專案失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 刪除專案（軟刪除）
 * DELETE /api/projects/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 檢查專案是否存在
    const checkResult = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '專案不存在',
      });
    }
    
    // 軟刪除（設定 deleted_at）
    const result = await db.query(
      `UPDATE projects 
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    console.log('✅ 專案刪除成功:', result.rows[0].name);
    
    res.json({
      success: true,
      message: '專案刪除成功',
    });
  } catch (error) {
    console.error('❌ 刪除專案失敗:', error);
    res.status(500).json({
      success: false,
      error: '刪除專案失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 永久刪除專案
 * DELETE /api/projects/:id/permanent
 */
router.delete('/:id/permanent', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '專案不存在',
      });
    }
    
    console.log('✅ 專案永久刪除成功:', result.rows[0].name);
    
    res.json({
      success: true,
      message: '專案永久刪除成功',
    });
  } catch (error) {
    console.error('❌ 永久刪除專案失敗:', error);
    res.status(500).json({
      success: false,
      error: '永久刪除專案失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

export default router;
