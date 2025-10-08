import React, { useMemo, useState, useEffect, useCallback } from 'react';
import TreeDiagram, { TreeNode } from './TreeDiagram';
import { recordTreeVisit } from '../../utils/treeHistory';
import { saveTreeDataWithTimestamp, loadTreeData, mergeTreeData } from '../../utils/treeDataStorage';
// @ts-ignore
import uiLayout from '../../../docs/layout/ui_layout.json';

const PAGE_KEY = 'ui-layout-rich';

type UILayout = {
  meta?: { canvas?: { width?: number; height?: number } };
  buttons?: Record<string, { states: Record<string, { bboxPx?: { x: number; y: number; w: number; h: number }, bboxPct?: { x: number; y: number; w: number; h: number } }> }>;
};

function buildTree(data: UILayout) {
  const width = data?.meta?.canvas?.width ?? 1080;
  const height = data?.meta?.canvas?.height ?? 1920;
  const root: TreeNode = { id: 'ui-root', label: `UI Layout (${width}×${height})`, children: [] };

  const buttonsGroup: TreeNode = { id: 'buttons', label: 'Buttons', children: [] };
  const buttons = data.buttons ?? {};
  Object.entries(buttons).forEach(([key, val]) => {
    const btnNode: TreeNode = { id: `btn-${key}`, label: key, children: [] };
    Object.entries(val.states || {}).forEach(([state, sv]) => {
      const p = sv.bboxPx; const q = sv.bboxPct;
      const label = [
        `state: ${state}`,
        p ? `px: (${p.x},${p.y}) ${p.w}×${p.h}` : undefined,
        q ? `pct: (${q.x},${q.y}) ${q.w}×${q.h}` : undefined,
      ].filter(Boolean).join(' | ');
      btnNode.children!.push({ id: `btn-${key}-${state}`, label });
    });
    buttonsGroup.children!.push(btnNode);
  });

  root.children!.push(buttonsGroup);
  return root;
}

interface TreeUiLayoutRichPageProps {
  onBackHome?: () => void;
}

export default function TreeUiLayoutRichPage({ onBackHome }: TreeUiLayoutRichPageProps) {
  const [defaultCollapsed] = useState<string[]>(['buttons']);
  
  // 1. 從原始 JSON 生成基礎樹狀結構
  const originalTree = useMemo(() => buildTree(uiLayout as UILayout), []);
  
  // 2. 載入已儲存的資料並合併
  const initialTree = useMemo(() => {
    const savedData = loadTreeData(PAGE_KEY);
    return mergeTreeData(originalTree, savedData);
  }, [originalTree]);
  
  const [tree, setTree] = useState<TreeNode>(initialTree);

  const generateNodeId = useCallback(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `node-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }, []);

  const createNewTreeNode = useCallback((): TreeNode => ({
    id: generateNodeId(),
    label: '新節點',
    children: [],
    metadata: {
      nodeId: Date.now(),
      mask: {},
    },
  }), [generateNodeId]);
  
  useEffect(() => {
    recordTreeVisit('tree-ui-layout-rich', 'UI Layout 完整資訊', '/tree-ui-layout-rich');
  }, []);
  
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    setTree(prevTree => {
      const updateNodeInTree = (node: TreeNode): TreeNode => {
        if (node.id === nodeId) {
          return { 
            ...node, 
            ...updates,
            metadata: updates.metadata ? { ...node.metadata, ...updates.metadata } : node.metadata
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateNodeInTree)
          };
        }
        return node;
      };
      
      const updatedTree = updateNodeInTree(prevTree);
      
      // 儲存到 localStorage
      saveTreeDataWithTimestamp(PAGE_KEY, updatedTree);
      
      return updatedTree;
    });
  }, []);

  const handleAddNode = useCallback((parentId: string) => {
    if (!parentId) {
      return;
    }

    setTree(prevTree => {
      const newNode = createNewTreeNode();

      const addChild = (node: TreeNode): { updated: TreeNode; added: boolean } => {
        if (node.id === parentId) {
          const children = node.children ? [...node.children, newNode] : [newNode];
          return { updated: { ...node, children }, added: true };
        }
        if (!node.children) {
          return { updated: node, added: false };
        }
        let childChanged = false;
        const children = node.children.map(child => {
          const result = addChild(child);
          if (result.added) {
            childChanged = true;
          }
          return result.updated;
        });
        if (childChanged) {
          return { updated: { ...node, children }, added: true };
        }
        return { updated: node, added: false };
      };

      const result = addChild(prevTree);
      if (!result.added) {
        return prevTree;
      }
      const updatedTree = result.updated;
      saveTreeDataWithTimestamp(PAGE_KEY, updatedTree);
      return updatedTree;
    });
  }, [createNewTreeNode]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (!nodeId || nodeId === tree.id) {
      return;
    }

    setTree(prevTree => {
      if (prevTree.id === nodeId) {
        return prevTree;
      }

      const deleteNode = (node: TreeNode): { updated: TreeNode; removed: boolean } => {
        if (!node.children) {
          return { updated: node, removed: false };
        }

        let removed = false;
        const children: TreeNode[] = [];
        node.children.forEach(child => {
          if (child.id === nodeId) {
            removed = true;
            return;
          }
          const result = deleteNode(child);
          if (result.removed) {
            removed = true;
          }
          children.push(result.updated);
        });

        if (removed) {
          return { updated: { ...node, children }, removed: true };
        }

        return { updated: node, removed: false };
      };

      const result = deleteNode(prevTree);
      if (!result.removed) {
        return prevTree;
      }

      const updatedTree = result.updated;
      saveTreeDataWithTimestamp(PAGE_KEY, updatedTree);
      return updatedTree;
    });
  }, [tree.id]);
  
  return (
    <TreeDiagram
      data={tree}
      direction="LR"
      nodeWidth={260}
      defaultCollapsedIds={defaultCollapsed}
      renderNode={({ data }) => <div style={{ padding: 4 }}>{data.label}</div>}
      onBackHome={onBackHome}
      onNodeUpdate={handleNodeUpdate}
      onAddNode={handleAddNode}
      onDeleteNode={handleDeleteNode}
    />
  );
}
