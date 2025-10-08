import React, { useMemo, useState, useEffect, useCallback } from 'react';
import TreeDiagram, { TreeNode } from './TreeDiagram';
import { recordTreeVisit } from '../../utils/treeHistory';
import { saveTreeDataWithTimestamp, loadTreeData, mergeTreeData } from '../../utils/treeDataStorage';
import './TreeDiagram.css';
// @ts-ignore
import psd from '../../../docs/psd_structure.json';

const PAGE_KEY = 'psd-structure';

type Bounds = { left: number; top: number; right: number; bottom: number; width: number; height: number };
type NodeRaw = {
  name: string;
  kind: 'group' | 'layer';
  visible?: boolean;
  opacity?: number;
  blend_mode?: string;
  clipping?: boolean;
  mask?: boolean;
  bounds: Bounds;
  text?: any;
  smart_object?: any;
  children?: NodeRaw[];
};

function makeId(path: string[]) { return path.join('/'); }

function toTreeNodes(nodes: NodeRaw[], path: string[] = []): TreeNode[] {
  return nodes.map((n) => {
    const id = makeId([...path, n.name]);
    const label = `${n.kind === 'group' ? '📁' : '🖼️'} ${n.name}`;
    const tn: TreeNode = {
      id,
      label,
      children: (n.children && n.children.length) ? toTreeNodes(n.children, [...path, n.name]) : [],
    };
    return tn;
  });
}

function toRootTree(psdTree: NodeRaw[]): TreeNode {
  const root: TreeNode = { id: 'psd-root', label: 'PSD 結構 (完整)', children: [] };
  root.children = toTreeNodes(psdTree, []);
  return root;
}

function findById(nodes: NodeRaw[], path: string[]): NodeRaw | null {
  if (!path.length) return null;
  const [head, ...rest] = path;
  const node = nodes.find(n => n.name === head);
  if (!node) return null;
  if (rest.length === 0) return node;
  return node.children ? findById(node.children, rest) : null;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
      <div style={{ width: 96, color: '#94a3b8' }}>{label}</div>
      <div style={{ color: '#e2e8f0' }}>{children}</div>
    </div>
  );
}

interface TreePsdStructurePageProps {
  onBackHome?: () => void;
}

export default function TreePsdStructurePage({ onBackHome }: TreePsdStructurePageProps) {
  // 1. 從原始 JSON 生成基礎樹狀結構
  const originalRootTree = useMemo(() => toRootTree(psd as NodeRaw[]), []);
  
  // 2. 載入已儲存的資料並合併
  const initialRootTree = useMemo(() => {
    const savedData = loadTreeData(PAGE_KEY);
    return mergeTreeData(originalRootTree, savedData);
  }, [originalRootTree]);
  
  const [rootTree, setRootTree] = useState<TreeNode>(initialRootTree);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    recordTreeVisit('tree-psd-structure', 'PSD 完整結構樹', '/tree-psd-structure');
  }, []);

  const selectedRaw = useMemo(() => {
    if (!selectedId) return null;
    const path = selectedId.split('/');
    // remove 'psd-root' if mistakenly included
    const normPath = path[0] === 'psd-root' ? path.slice(1) : path;
    return findById(psd as NodeRaw[], normPath);
  }, [selectedId]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    setRootTree(prevTree => {
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

    setRootTree(prevTree => {
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
    if (!nodeId || nodeId === rootTree.id) {
      return;
    }

    setRootTree(prevTree => {
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
  }, [rootTree.id]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a' }}>
      <div style={{ flex: 1, borderRight: '1px solid #334155' }}>
        <TreeDiagram
          data={rootTree}
          direction="TB"
          nodeWidth={240}
          nodeHeight={64}
          onSelectNode={(n) => setSelectedId(n.id)}
          renderNode={({ id, data }) => data.label}
          onBackHome={onBackHome}
          onNodeUpdate={handleNodeUpdate}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
        />
      </div>
      <div style={{ width: 360, padding: 12, background: '#1e293b', color: '#e2e8f0' }}>
        <h3 style={{ margin: '8px 0', color: '#f1f5f9' }}>屬性</h3>
        {selectedRaw ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <InfoRow label="名稱">{selectedRaw.name}</InfoRow>
            <InfoRow label="類型">{selectedRaw.kind}</InfoRow>
            <InfoRow label="可見">{String(selectedRaw.visible ?? true)}</InfoRow>
            <InfoRow label="透明度">{(selectedRaw.opacity ?? 1) * 100}%</InfoRow>
            <InfoRow label="混合模式">{selectedRaw.blend_mode ?? 'normal'}</InfoRow>
            <InfoRow label="裁切(Clipping)">{String(selectedRaw.clipping ?? false)}</InfoRow>
            <InfoRow label="遮罩(Mask)">{String(selectedRaw.mask ?? false)}</InfoRow>
            <InfoRow label="Bounds">
              {`(${selectedRaw.bounds.left}, ${selectedRaw.bounds.top}) - (${selectedRaw.bounds.right}, ${selectedRaw.bounds.bottom}) ${selectedRaw.bounds.width}×${selectedRaw.bounds.height}`}
            </InfoRow>
            {selectedRaw.text ? <InfoRow label="文字">JSON</InfoRow> : null}
            {selectedRaw.smart_object ? <InfoRow label="SmartObj">JSON</InfoRow> : null}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>點選左側樹節點以查看詳細屬性</div>
        )}
      </div>
    </div>
  );
}
