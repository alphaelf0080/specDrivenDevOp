/**
 * 樹狀圖 API 路由
 * 
 * 提供完整的樹狀圖 CRUD 操作
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { getDatabase } from '../database/db.js';
import { createTreeOperations, TreeData, TreeNode } from '../operations/tree.operations.js';
import { loadDatabaseConfig } from '../config/database.config.js';

const router = Router();
const db = getDatabase();

// 創建 Pool 實例用於 TreeOperations
const config = loadDatabaseConfig();
const pool = new Pool(config);
const treeOps = createTreeOperations(pool);

/**
 * 獲取樹狀圖清單
 * GET /api/trees
 * 查詢參數: projectId, treeType, isTemplate, ownerId, tags
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId, treeType, isTemplate, ownerId, tags } = req.query;

    const filter: any = {};
    
    if (projectId) {
      filter.projectId = Number(projectId);
    }
    if (treeType) {
      filter.treeType = treeType as string;
    }
    if (isTemplate !== undefined) {
      filter.isTemplate = isTemplate === 'true';
    }
    if (ownerId) {
      filter.ownerId = Number(ownerId);
    }
    if (tags) {
      filter.tags = (tags as string).split(',');
    }

    const trees = await treeOps.listTrees(filter);

    res.json({
      success: true,
      data: trees,
      count: trees.length,
    });
  } catch (error) {
    console.error('❌ 獲取樹狀圖清單失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取樹狀圖清單失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 獲取單一樹狀圖 (by ID)
 * GET /api/trees/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tree = await treeOps.getTreeById(Number(id));

    if (!tree) {
      return res.status(404).json({
        success: false,
        error: '樹狀圖不存在',
      });
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('❌ 獲取樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 獲取單一樹狀圖 (by UUID)
 * GET /api/trees/uuid/:uuid
 */
router.get('/uuid/:uuid', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const tree = await treeOps.getTreeByUuid(uuid);

    if (!tree) {
      return res.status(404).json({
        success: false,
        error: '樹狀圖不存在',
      });
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('❌ 獲取樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 獲取專案的主要樹狀圖
 * GET /api/trees/project/:projectId/main
 */
router.get('/project/:projectId/main', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    // 先查詢專案的 main_tree_id
    const projectResult = await db.query(
      'SELECT main_tree_id FROM projects WHERE id = $1 AND deleted_at IS NULL',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '專案不存在',
      });
    }

    const mainTreeId = projectResult.rows[0].main_tree_id;
    
    if (!mainTreeId) {
      return res.status(404).json({
        success: false,
        error: '此專案尚未設定主要樹狀圖',
      });
    }

    const tree = await treeOps.getTreeById(mainTreeId);

    if (!tree) {
      return res.status(404).json({
        success: false,
        error: '主要樹狀圖不存在',
      });
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('❌ 獲取專案主要樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取專案主要樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 創建新樹狀圖
 * POST /api/trees
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const treeData: TreeData = req.body;

    // 驗證必填欄位
    if (!treeData.name || !treeData.treeType || !treeData.data) {
      return res.status(400).json({
        success: false,
        error: '缺少必填欄位',
        required: ['name', 'treeType', 'data'],
      });
    }

    const newTree = await treeOps.createTree(treeData);

    // 如果有 projectId 且設定為主要樹狀圖,則更新專案
    if (treeData.projectId && req.body.setAsMain) {
      await db.query(
        'UPDATE projects SET main_tree_id = $1 WHERE id = $2',
        [newTree.id, treeData.projectId]
      );
    }

    console.log('✅ 樹狀圖創建成功:', newTree.name);

    res.status(201).json({
      success: true,
      data: newTree,
      message: '樹狀圖創建成功',
    });
  } catch (error) {
    console.error('❌ 創建樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '創建樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 更新樹狀圖
 * PUT /api/trees/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<TreeData> = req.body;

    const updatedTree = await treeOps.updateTree(Number(id), updates);

    if (!updatedTree) {
      return res.status(404).json({
        success: false,
        error: '樹狀圖不存在',
      });
    }

    console.log('✅ 樹狀圖更新成功:', updatedTree.name, '版本:', updatedTree.version);

    res.json({
      success: true,
      data: updatedTree,
      message: '樹狀圖更新成功',
    });
  } catch (error) {
    console.error('❌ 更新樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '更新樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 刪除樹狀圖（軟刪除）
 * DELETE /api/trees/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const success = await treeOps.deleteTree(Number(id), permanent !== 'true');

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '樹狀圖不存在',
      });
    }

    console.log('✅ 樹狀圖刪除成功 ID:', id);

    res.json({
      success: true,
      message: permanent === 'true' ? '樹狀圖永久刪除成功' : '樹狀圖刪除成功',
    });
  } catch (error) {
    console.error('❌ 刪除樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '刪除樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 復原已刪除的樹狀圖
 * POST /api/trees/:id/restore
 */
router.post('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await treeOps.restoreTree(Number(id));

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '樹狀圖不存在或未被刪除',
      });
    }

    console.log('✅ 樹狀圖復原成功 ID:', id);

    res.json({
      success: true,
      message: '樹狀圖復原成功',
    });
  } catch (error) {
    console.error('❌ 復原樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '復原樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 複製樹狀圖
 * POST /api/trees/:id/clone
 */
router.post('/:id/clone', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const clonedTree = await treeOps.cloneTree(Number(id), name);

    if (!clonedTree) {
      return res.status(404).json({
        success: false,
        error: '原始樹狀圖不存在',
      });
    }

    console.log('✅ 樹狀圖複製成功:', clonedTree.name);

    res.status(201).json({
      success: true,
      data: clonedTree,
      message: '樹狀圖複製成功',
    });
  } catch (error) {
    console.error('❌ 複製樹狀圖失敗:', error);
    res.status(500).json({
      success: false,
      error: '複製樹狀圖失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * 獲取所有範本樹狀圖
 * GET /api/trees/templates/list
 */
router.get('/templates/list', async (req: Request, res: Response) => {
  try {
    const templates = await treeOps.getTemplates();

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('❌ 獲取範本清單失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取範本清單失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

export default router;
