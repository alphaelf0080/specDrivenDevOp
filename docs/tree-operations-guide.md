# 樹狀圖資料庫操作模組使用指南

## 概述

`tree.operations.ts` 提供了完整的樹狀圖資料庫 CRUD 操作和進階功能,包括:
- ✅ 基本 CRUD 操作
- ✅ 自動計算統計資訊（節點數、樹深度）
- ✅ 版本管理
- ✅ 範本管理
- ✅ 軟刪除和復原
- ✅ 複製樹狀圖
- ✅ 標籤篩選
- ✅ 交易支援

## 資料表結構

### Trees 表結構

```sql
CREATE TABLE trees (
  -- 基本欄位
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- 關聯
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  owner_id INTEGER,
  
  -- 資料
  data JSONB NOT NULL,              -- 完整樹狀結構
  config JSONB,                      -- 配置資訊
  
  -- 類型和分類
  tree_type VARCHAR(50) NOT NULL,    -- ui_layout, psd_structure, game_logic 等
  direction VARCHAR(10) DEFAULT 'LR', -- LR, TB, RL, BT
  
  -- 統計資訊
  node_count INTEGER DEFAULT 0,      -- 節點總數（自動計算）
  max_depth INTEGER DEFAULT 0,       -- 最大深度（自動計算）
  version INTEGER DEFAULT 1,         -- 版本號（自動遞增）
  
  -- 標籤和範本
  is_template BOOLEAN DEFAULT FALSE,
  tags TEXT,
  
  -- 時間戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_trees_project_id ON trees(project_id);
CREATE INDEX idx_trees_tree_type ON trees(tree_type);
CREATE INDEX idx_trees_owner_id ON trees(owner_id);
CREATE INDEX idx_trees_is_template ON trees(is_template);
CREATE INDEX idx_trees_data ON trees USING GIN (data);
CREATE INDEX idx_trees_config ON trees USING GIN (config);
CREATE INDEX idx_trees_name ON trees(name);
```

## 資料結構

### TreeNode (樹狀圖節點)

```typescript
interface TreeNode {
  id: string;                     // 節點唯一 ID
  label: string;                  // 節點標籤/名稱
  children?: TreeNode[];          // 子節點陣列
  metadata?: TreeNodeMetadata;    // 節點元數據
}
```

### TreeNodeMetadata (節點元數據)

```typescript
interface TreeNodeMetadata {
  nodeId?: number;                  // 節點 ID
  function?: string;                // 功能描述
  description?: string;             // 詳細描述
  photoshopCoords?: Coordinate3D;   // Photoshop 座標
  engineCoords?: Coordinate3D;      // 引擎座標
  blendMode?: string;               // 混合模式
  opacity?: string;                 // 透明度
  mask?: Record<string, unknown>;   // 遮罩資訊
  notes?: string;                   // 備註
}
```

### TreeConfig (樹狀圖配置)

```typescript
interface TreeConfig {
  direction?: 'LR' | 'TB' | 'RL' | 'BT';  // 方向
  nodeSpacing?: number;                    // 節點間距
  levelSpacing?: number;                   // 層級間距
  defaultNodeStyle?: Record<string, unknown>;
  defaultEdgeStyle?: Record<string, unknown>;
  viewportState?: {
    zoom?: number;
    position?: { x: number; y: number };
  };
}
```

## 基本使用

### 1. 初始化操作實例

```typescript
import { Pool } from 'pg';
import { createTreeOperations } from './operations/tree.operations';

// 建立資料庫連接池
const pool = new Pool({
  host: '192.168.10.6',
  port: 5432,
  database: 'your_database',
  user: 'your_user',
  password: 'your_password',
});

// 建立操作實例
const treeOps = createTreeOperations(pool);
```

### 2. 創建樹狀圖

```typescript
const newTree = await treeOps.createTree({
  name: '遊戲 UI 佈局',
  description: '主遊戲介面的 UI 元素結構',
  projectId: 123,
  treeType: 'ui_layout',
  direction: 'LR',
  data: {
    id: 'root',
    label: '根節點',
    children: [
      {
        id: 'node-1',
        label: '子節點 1',
        metadata: {
          function: '主按鈕',
          description: '開始遊戲按鈕',
        },
      },
    ],
  },
  config: {
    direction: 'LR',
    nodeSpacing: 100,
    levelSpacing: 150,
  },
  tags: 'UI,遊戲,主介面',
});

console.log('創建成功:', newTree);
// 自動計算: node_count=2, max_depth=1, version=1
```

### 3. 查詢樹狀圖

#### 根據 ID 查詢

```typescript
const tree = await treeOps.getTreeById(1);
if (tree) {
  console.log('樹狀圖:', tree.name);
  console.log('節點數:', tree.nodeCount);
  console.log('最大深度:', tree.maxDepth);
}
```

#### 根據 UUID 查詢

```typescript
const tree = await treeOps.getTreeByUuid('550e8400-e29b-41d4-a716-446655440000');
```

#### 查詢清單（帶篩選）

```typescript
// 查詢所有 UI 佈局樹
const uiTrees = await treeOps.listTrees({
  treeType: 'ui_layout',
  includeDeleted: false,
});

// 查詢特定專案的樹狀圖
const projectTrees = await treeOps.getTreesByProject(123);

// 查詢所有範本
const templates = await treeOps.getTemplates();

// 複雜查詢
const filteredTrees = await treeOps.listTrees({
  projectId: 123,
  treeType: 'ui_layout',
  isTemplate: false,
  tags: ['UI', '主介面'],
  includeDeleted: false,
});
```

### 4. 更新樹狀圖

```typescript
// 更新基本資訊
const updated = await treeOps.updateTree(1, {
  name: '遊戲 UI 佈局 v2',
  description: '更新後的介面結構',
});

// 更新樹狀結構（會自動重新計算統計資訊和增加版本號）
const updatedTree = await treeOps.updateTree(1, {
  data: {
    id: 'root',
    label: '根節點',
    children: [
      {
        id: 'node-1',
        label: '子節點 1',
        children: [
          { id: 'node-1-1', label: '孫節點 1-1' },
          { id: 'node-1-2', label: '孫節點 1-2' },
        ],
      },
      {
        id: 'node-2',
        label: '子節點 2',
      },
    ],
  },
});
// 自動更新: node_count=5, max_depth=2, version=2
```

### 5. 刪除樹狀圖

```typescript
// 軟刪除（預設）
await treeOps.deleteTree(1);

// 永久刪除
await treeOps.deleteTree(1, false);

// 復原軟刪除
await treeOps.restoreTree(1);
```

### 6. 複製樹狀圖

```typescript
// 複製樹狀圖
const cloned = await treeOps.cloneTree(1, '遊戲 UI 佈局 (副本)');

// 不指定名稱會自動加上 "(副本)"
const cloned2 = await treeOps.cloneTree(1);
```

## 進階功能

### 1. 交易操作

```typescript
// 在交易中執行多個操作
await treeOps.transaction(async (client) => {
  // 創建多個樹狀圖
  const tree1 = await treeOps.createTree({...});
  const tree2 = await treeOps.createTree({...});
  
  // 更新關聯
  await client.query('UPDATE projects SET main_tree_id = $1 WHERE id = $2', [tree1.id, projectId]);
  
  return { tree1, tree2 };
});
```

### 2. 統計資訊

統計資訊會在創建和更新時自動計算:

```typescript
const tree = await treeOps.getTreeById(1);
console.log(`節點總數: ${tree.nodeCount}`);
console.log(`最大深度: ${tree.maxDepth}`);
console.log(`版本號: ${tree.version}`);
```

### 3. 版本管理

每次更新樹狀圖資料時,版本號會自動遞增:

```typescript
// 第一次更新 -> version = 2
await treeOps.updateTree(1, { data: newData });

// 第二次更新 -> version = 3
await treeOps.updateTree(1, { data: anotherData });
```

### 4. 範本系統

```typescript
// 創建範本
const template = await treeOps.createTree({
  name: '標準 UI 佈局範本',
  treeType: 'ui_layout',
  isTemplate: true,
  data: standardLayout,
});

// 從範本創建新樹狀圖
const templates = await treeOps.getTemplates();
const newTree = await treeOps.cloneTree(templates[0].id!, '我的 UI 佈局');
await treeOps.updateTree(newTree.id!, { isTemplate: false });
```

## 樹狀圖類型 (tree_type)

建議的樹狀圖類型:

| 類型 | 說明 | 用途 |
|------|------|------|
| `ui_layout` | UI 佈局樹 | 遊戲介面元素結構 |
| `psd_structure` | PSD 結構樹 | Photoshop 圖層結構 |
| `game_logic` | 遊戲邏輯樹 | 遊戲流程和邏輯結構 |
| `asset_tree` | 資源樹 | 遊戲資源組織結構 |
| `component_tree` | 組件樹 | React/Vue 組件結構 |
| `file_system` | 文件系統樹 | 專案文件結構 |
| `custom` | 自定義 | 其他用途 |

## API 整合範例

### Express API 路由

```typescript
import express from 'express';
import { createTreeOperations } from './operations/tree.operations';

const router = express.Router();
const treeOps = createTreeOperations(pool);

// GET /api/trees - 取得樹狀圖清單
router.get('/trees', async (req, res) => {
  try {
    const { projectId, treeType, isTemplate } = req.query;
    const trees = await treeOps.listTrees({
      projectId: projectId ? Number(projectId) : undefined,
      treeType: treeType as string,
      isTemplate: isTemplate === 'true',
    });
    res.json(trees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trees' });
  }
});

// GET /api/trees/:id - 取得單一樹狀圖
router.get('/trees/:id', async (req, res) => {
  try {
    const tree = await treeOps.getTreeById(Number(req.params.id));
    if (!tree) {
      return res.status(404).json({ error: 'Tree not found' });
    }
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tree' });
  }
});

// POST /api/trees - 創建樹狀圖
router.post('/trees', async (req, res) => {
  try {
    const tree = await treeOps.createTree(req.body);
    res.status(201).json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tree' });
  }
});

// PUT /api/trees/:id - 更新樹狀圖
router.put('/trees/:id', async (req, res) => {
  try {
    const tree = await treeOps.updateTree(Number(req.params.id), req.body);
    if (!tree) {
      return res.status(404).json({ error: 'Tree not found' });
    }
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tree' });
  }
});

// DELETE /api/trees/:id - 刪除樹狀圖
router.delete('/trees/:id', async (req, res) => {
  try {
    const success = await treeOps.deleteTree(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Tree not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tree' });
  }
});

// POST /api/trees/:id/clone - 複製樹狀圖
router.post('/trees/:id/clone', async (req, res) => {
  try {
    const { name } = req.body;
    const tree = await treeOps.cloneTree(Number(req.params.id), name);
    if (!tree) {
      return res.status(404).json({ error: 'Tree not found' });
    }
    res.status(201).json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Failed to clone tree' });
  }
});

export default router;
```

## 資料遷移

### 從 projects.tree_data 遷移到 trees 表

```typescript
async function migrateProjectTreesToTable() {
  const client = await pool.connect();
  try {
    // 取得所有專案的樹狀圖資料
    const projects = await client.query(
      'SELECT id, name, tree_data, tree_config FROM projects WHERE tree_data IS NOT NULL'
    );

    for (const project of projects.rows) {
      // 創建獨立的樹狀圖記錄
      await treeOps.createTree({
        name: `${project.name} - 專案樹狀圖`,
        projectId: project.id,
        treeType: 'ui_layout',
        data: project.tree_data,
        config: project.tree_config,
      });

      console.log(`遷移專案 ${project.id} 的樹狀圖完成`);
    }
  } finally {
    client.release();
  }
}
```

## 最佳實踐

1. **使用交易**: 當需要同時操作多個樹狀圖或相關資料時,使用 `transaction` 方法確保資料一致性

2. **軟刪除**: 預設使用軟刪除,保留資料歷史記錄

3. **標籤管理**: 使用標籤進行分類和篩選,提升搜尋效率

4. **版本控制**: 利用自動版本號追蹤變更歷史

5. **統計資訊**: 統計資訊會自動計算和更新,無需手動維護

6. **範本重用**: 將常用結構設為範本,通過複製快速創建新樹狀圖

7. **類型規範**: 統一使用標準的 `tree_type` 值,便於分類和查詢

## 錯誤處理

```typescript
try {
  const tree = await treeOps.createTree(treeData);
} catch (error) {
  if (error.code === '23505') {
    // 唯一性約束違反
    console.error('樹狀圖名稱已存在');
  } else if (error.code === '23503') {
    // 外鍵約束違反
    console.error('關聯的專案不存在');
  } else {
    console.error('創建失敗:', error.message);
  }
}
```

## 總結

`tree.operations.ts` 提供了完整而強大的樹狀圖資料庫操作功能,涵蓋了:
- ✅ 完整的 CRUD 操作
- ✅ 自動統計和版本管理
- ✅ 軟刪除和復原
- ✅ 範本系統
- ✅ 交易支援
- ✅ 靈活的查詢和篩選

配合擴充後的 `trees` 資料表,可以輕鬆管理各種類型的樹狀結構數據,是構建複雜樹狀圖系統的理想基礎。
