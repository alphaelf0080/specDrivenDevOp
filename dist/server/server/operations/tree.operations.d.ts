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
        position?: {
            x: number;
            y: number;
        };
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
export declare class TreeOperations {
    private pool;
    constructor(pool: Pool);
    /**
     * 計算樹狀圖的節點數量
     */
    private calculateNodeCount;
    /**
     * 計算樹狀圖的最大深度
     */
    private calculateMaxDepth;
    /**
     * 創建新的樹狀圖
     */
    createTree(treeData: TreeData): Promise<TreeData>;
    /**
     * 根據 ID 取得樹狀圖
     */
    getTreeById(id: number, includeDeleted?: boolean): Promise<TreeData | null>;
    /**
     * 根據 UUID 取得樹狀圖
     */
    getTreeByUuid(uuid: string, includeDeleted?: boolean): Promise<TreeData | null>;
    /**
     * 查詢樹狀圖清單
     */
    listTrees(filter?: TreeQueryFilter): Promise<TreeData[]>;
    /**
     * 更新樹狀圖
     */
    updateTree(id: number, updates: Partial<TreeData>): Promise<TreeData | null>;
    /**
     * 軟刪除樹狀圖
     */
    deleteTree(id: number, soft?: boolean): Promise<boolean>;
    /**
     * 復原已軟刪除的樹狀圖
     */
    restoreTree(id: number): Promise<boolean>;
    /**
     * 複製樹狀圖
     */
    cloneTree(id: number, newName?: string): Promise<TreeData | null>;
    /**
     * 取得專案的所有樹狀圖
     */
    getTreesByProject(projectId: number): Promise<TreeData[]>;
    /**
     * 取得所有範本樹狀圖
     */
    getTemplates(): Promise<TreeData[]>;
    /**
     * 批次操作 - 在交易中執行多個操作
     */
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    /**
     * 將資料庫行映射為 TreeData 物件
     */
    private mapRowToTreeData;
}
/**
 * 建立樹狀圖操作實例的工廠函數
 */
export declare function createTreeOperations(pool: Pool): TreeOperations;
export default TreeOperations;
