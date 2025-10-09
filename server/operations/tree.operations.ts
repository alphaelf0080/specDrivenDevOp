/**
 * 樹狀圖資料庫操作模組
 * 
 * 提供完整的 CRUD 操作和進階功能:
 * - 創建、讀取、更新、刪除樹狀圖
 * - 統計資訊（節點數、深度）
 * - 版本管理
 * - 範本管理
 * - 標籤篩選
 */

import { Pool, PoolClient } from 'pg';

/**
 * 樹狀圖節點介面
 */
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  metadata?: TreeNodeMetadata;
}

/**
 * 樹狀圖節點 Metadata 介面
 */
export interface TreeNodeMetadata {
  nodeId?: number;
  function?: string;
  description?: string;
  photoshopCoords?: Coordinate3D;
  engineCoords?: Coordinate3D;
  blendMode?: string;
  opacity?: string;
  mask?: Record<string, unknown>;
  notes?: string;
}

/**
 * 3D 座標介面
 */
export interface Coordinate3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 樹狀圖配置介面
 */
export interface TreeConfig {
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  nodeSpacing?: number;
  levelSpacing?: number;
  defaultNodeStyle?: Record<string, unknown>;
  defaultEdgeStyle?: Record<string, unknown>;
  viewportState?: {
    zoom?: number;
    position?: { x: number; y: number };
  };
}

/**
 * 樹狀圖完整資料介面
 */
export interface TreeData {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  projectId?: number;
  treeType: string;
  data: TreeNode;
  config?: TreeConfig;
  direction?: string;
  nodeCount?: number;
  maxDepth?: number;
  version?: number;
  isTemplate?: boolean;
  tags?: string;
  ownerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 查詢篩選條件
 */
export interface TreeQueryFilter {
  projectId?: number;
  treeType?: string;
  isTemplate?: boolean;
  ownerId?: number;
  tags?: string[];
  includeDeleted?: boolean;
}

/**
 * 樹狀圖資料庫操作類別
 */
export class TreeOperations {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 計算樹狀圖的節點數量
   */
  private calculateNodeCount(node: TreeNode): number {
    let count = 1; // 當前節點
    if (node.children && node.children.length > 0) {
      count += node.children.reduce(
        (sum, child) => sum + this.calculateNodeCount(child),
        0
      );
    }
    return count;
  }

  /**
   * 計算樹狀圖的最大深度
   */
  private calculateMaxDepth(node: TreeNode, currentDepth: number = 0): number {
    if (!node.children || node.children.length === 0) {
      return currentDepth;
    }
    return Math.max(
      ...node.children.map((child) =>
        this.calculateMaxDepth(child, currentDepth + 1)
      )
    );
  }

  /**
   * 創建新的樹狀圖
   */
  async createTree(treeData: TreeData): Promise<TreeData> {
    const client = await this.pool.connect();
    try {
      // 計算統計資訊
      const nodeCount = this.calculateNodeCount(treeData.data);
      const maxDepth = this.calculateMaxDepth(treeData.data);

      const query = `
        INSERT INTO trees (
          name, description, project_id, tree_type, data, config,
          direction, node_count, max_depth, version, is_template,
          tags, owner_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const values = [
        treeData.name,
        treeData.description || null,
        treeData.projectId || null,
        treeData.treeType,
        JSON.stringify(treeData.data),
        treeData.config ? JSON.stringify(treeData.config) : null,
        treeData.direction || 'LR',
        nodeCount,
        maxDepth,
        treeData.version || 1,
        treeData.isTemplate || false,
        treeData.tags || null,
        treeData.ownerId || null,
      ];

      const result = await client.query(query, values);
      return this.mapRowToTreeData(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * 根據 ID 取得樹狀圖
   */
  async getTreeById(id: number, includeDeleted = false): Promise<TreeData | null> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM trees
        WHERE id = $1 ${includeDeleted ? '' : 'AND deleted_at IS NULL'}
      `;

      const result = await client.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapRowToTreeData(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * 根據 UUID 取得樹狀圖
   */
  async getTreeByUuid(uuid: string, includeDeleted = false): Promise<TreeData | null> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM trees
        WHERE uuid = $1 ${includeDeleted ? '' : 'AND deleted_at IS NULL'}
      `;

      const result = await client.query(query, [uuid]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapRowToTreeData(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * 查詢樹狀圖清單
   */
  async listTrees(filter?: TreeQueryFilter): Promise<TreeData[]> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT * FROM trees WHERE 1=1';
      const params: unknown[] = [];
      let paramIndex = 1;

      if (filter) {
        if (filter.projectId !== undefined) {
          query += ` AND project_id = $${paramIndex++}`;
          params.push(filter.projectId);
        }

        if (filter.treeType) {
          query += ` AND tree_type = $${paramIndex++}`;
          params.push(filter.treeType);
        }

        if (filter.isTemplate !== undefined) {
          query += ` AND is_template = $${paramIndex++}`;
          params.push(filter.isTemplate);
        }

        if (filter.ownerId !== undefined) {
          query += ` AND owner_id = $${paramIndex++}`;
          params.push(filter.ownerId);
        }

        if (filter.tags && filter.tags.length > 0) {
          // 簡單的標籤搜尋（使用 LIKE）
          const tagConditions = filter.tags
            .map(() => `tags LIKE $${paramIndex++}`)
            .join(' OR ');
          query += ` AND (${tagConditions})`;
          filter.tags.forEach((tag) => params.push(`%${tag}%`));
        }

        if (!filter.includeDeleted) {
          query += ' AND deleted_at IS NULL';
        }
      } else {
        query += ' AND deleted_at IS NULL';
      }

      query += ' ORDER BY created_at DESC';

      const result = await client.query(query, params);
      return result.rows.map((row) => this.mapRowToTreeData(row));
    } finally {
      client.release();
    }
  }

  /**
   * 更新樹狀圖
   */
  async updateTree(id: number, updates: Partial<TreeData>): Promise<TreeData | null> {
    const client = await this.pool.connect();
    try {
      // 先取得現有資料
      const existing = await this.getTreeById(id);
      if (!existing) {
        return null;
      }

      const setClauses: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        params.push(updates.name);
      }

      if (updates.description !== undefined) {
        setClauses.push(`description = $${paramIndex++}`);
        params.push(updates.description);
      }

      if (updates.treeType !== undefined) {
        setClauses.push(`tree_type = $${paramIndex++}`);
        params.push(updates.treeType);
      }

      if (updates.data !== undefined) {
        setClauses.push(`data = $${paramIndex++}`);
        params.push(JSON.stringify(updates.data));

        // 重新計算統計資訊
        const nodeCount = this.calculateNodeCount(updates.data);
        const maxDepth = this.calculateMaxDepth(updates.data);

        setClauses.push(`node_count = $${paramIndex++}`);
        params.push(nodeCount);

        setClauses.push(`max_depth = $${paramIndex++}`);
        params.push(maxDepth);
      }

      if (updates.config !== undefined) {
        setClauses.push(`config = $${paramIndex++}`);
        params.push(JSON.stringify(updates.config));
      }

      if (updates.direction !== undefined) {
        setClauses.push(`direction = $${paramIndex++}`);
        params.push(updates.direction);
      }

      if (updates.isTemplate !== undefined) {
        setClauses.push(`is_template = $${paramIndex++}`);
        params.push(updates.isTemplate);
      }

      if (updates.tags !== undefined) {
        setClauses.push(`tags = $${paramIndex++}`);
        params.push(updates.tags);
      }

      if (setClauses.length === 0) {
        // 沒有任何更新
        return existing;
      }

      // 增加版本號
      setClauses.push(`version = version + 1`);
      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

      const query = `
        UPDATE trees
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      params.push(id);

      const result = await client.query(query, params);
      return this.mapRowToTreeData(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * 軟刪除樹狀圖
   */
  async deleteTree(id: number, soft = true): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      if (soft) {
        const query = `
          UPDATE trees
          SET deleted_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND deleted_at IS NULL
        `;
        const result = await client.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
      } else {
        const query = `DELETE FROM trees WHERE id = $1`;
        const result = await client.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
      }
    } finally {
      client.release();
    }
  }

  /**
   * 復原已軟刪除的樹狀圖
   */
  async restoreTree(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE trees
        SET deleted_at = NULL
        WHERE id = $1 AND deleted_at IS NOT NULL
      `;
      const result = await client.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * 複製樹狀圖
   */
  async cloneTree(id: number, newName?: string): Promise<TreeData | null> {
    const client = await this.pool.connect();
    try {
      const original = await this.getTreeById(id);
      if (!original) {
        return null;
      }

      const clonedData: TreeData = {
        ...original,
        name: newName || `${original.name} (副本)`,
        version: 1,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
      };

      delete clonedData.id;
      delete clonedData.uuid;

      return await this.createTree(clonedData);
    } finally {
      client.release();
    }
  }

  /**
   * 取得專案的所有樹狀圖
   */
  async getTreesByProject(projectId: number): Promise<TreeData[]> {
    return this.listTrees({ projectId, includeDeleted: false });
  }

  /**
   * 取得所有範本樹狀圖
   */
  async getTemplates(): Promise<TreeData[]> {
    return this.listTrees({ isTemplate: true, includeDeleted: false });
  }

  /**
   * 批次操作 - 在交易中執行多個操作
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 將資料庫行映射為 TreeData 物件
   */
  private mapRowToTreeData(row: Record<string, unknown>): TreeData {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      name: row.name as string,
      description: row.description as string | undefined,
      projectId: row.project_id as number | undefined,
      treeType: row.tree_type as string,
      data: row.data as TreeNode,
      config: row.config as TreeConfig | undefined,
      direction: row.direction as string | undefined,
      nodeCount: row.node_count as number | undefined,
      maxDepth: row.max_depth as number | undefined,
      version: row.version as number | undefined,
      isTemplate: row.is_template as boolean | undefined,
      tags: row.tags as string | undefined,
      ownerId: row.owner_id as number | undefined,
      createdAt: row.created_at as Date | undefined,
      updatedAt: row.updated_at as Date | undefined,
      deletedAt: row.deleted_at as Date | undefined,
    };
  }
}

/**
 * 建立樹狀圖操作實例的工廠函數
 */
export function createTreeOperations(pool: Pool): TreeOperations {
  return new TreeOperations(pool);
}

export default TreeOperations;
