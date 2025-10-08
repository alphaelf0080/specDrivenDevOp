import React, { useMemo, useEffect, useState, useCallback } from 'react';
import TreeDiagram, { TreeNode } from './TreeDiagram';
import { recordTreeVisit } from '../../utils/treeHistory';
import { saveTreeDataWithTimestamp, loadTreeData, mergeTreeData } from '../../utils/treeDataStorage';
// 直接匯入 JSON（Vite 支援 JSON 模組）
// 路徑：client/components/Tree -> ../../../docs/layout/ui_layout.json
// 若遇到型別告警，可將其視為 any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import uiLayout from '../../../docs/layout/ui_layout.json';

const PAGE_KEY = 'ui-layout';

type UILayout = {
  meta?: { canvas?: { width?: number; height?: number } };
  buttons?: Record<string, { states: Record<string, { bboxPx?: { x: number; y: number; w: number; h: number } }> }>;
};

function toTree(data: UILayout): TreeNode {
  const width = data?.meta?.canvas?.width ?? 1080;
  const height = data?.meta?.canvas?.height ?? 1920;
  const root: TreeNode = { id: 'ui-root', label: `UI Layout (${width}×${height})`, children: [] };

  const buttonsGroup: TreeNode = { id: 'buttons', label: 'Buttons', children: [] };
  const buttons = data.buttons ?? {};
  Object.entries(buttons).forEach(([btnKey, btnVal]) => {
    const btnNode: TreeNode = { id: `btn-${btnKey}`, label: btnKey, children: [] };
    Object.entries(btnVal.states || {}).forEach(([stateKey, stateVal]) => {
      const bbox = stateVal?.bboxPx;
      const label = bbox ? `${stateKey} @ (${bbox.x},${bbox.y}) ${bbox.w}×${bbox.h}` : stateKey;
      btnNode.children!.push({ id: `btn-${btnKey}-${stateKey}`, label });
    });
    buttonsGroup.children!.push(btnNode);
  });

  root.children!.push(buttonsGroup);
  return root;
}

interface TreeUiLayoutPageProps {
  onBackHome?: () => void;
}

export default function TreeUiLayoutPage({ onBackHome }: TreeUiLayoutPageProps) {
  // 1. 從原始 JSON 生成基礎樹狀結構
  const originalTreeData = useMemo(() => toTree(uiLayout as UILayout), []);
  
  // 2. 載入已儲存的資料並合併
  const initialTreeData = useMemo(() => {
    const savedData = loadTreeData(PAGE_KEY);
    return mergeTreeData(originalTreeData, savedData);
  }, [originalTreeData]);
  
  const [treeData, setTreeData] = useState<TreeNode>(initialTreeData);

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
    recordTreeVisit('tree-ui-layout', 'UI Layout 樹狀圖', '/tree-ui-layout');
  }, []);
  
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    setTreeData(prevTree => {
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

    setTreeData(prevTree => {
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
    if (!nodeId || nodeId === treeData.id) {
      return;
    }

    setTreeData(prevTree => {
      if (prevTree.id === nodeId) {
        return prevTree;
      }

      const deleteNode = (node: TreeNode): { updated: TreeNode; removed: boolean } => {
        if (!node.children) {
          return { updated: node, removed: false };
        }

        let removed = false;
        const children = [] as TreeNode[];
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
  }, [treeData.id]);
  
  return (
    <TreeDiagram 
      data={treeData} 
      direction="LR" 
      onBackHome={onBackHome}
      onNodeUpdate={handleNodeUpdate}
      onAddNode={handleAddNode}
      onDeleteNode={handleDeleteNode}
    />
  );
}
