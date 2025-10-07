import React, { useMemo, useState } from 'react';
import TreeDiagram, { TreeNode } from './TreeDiagram';
import './TreeDiagram.css';
// @ts-ignore
import psd from '../../../docs/psd_structure.json';

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
      <div style={{ width: 96, color: '#4a5568' }}>{label}</div>
      <div style={{ color: '#1a202c' }}>{children}</div>
    </div>
  );
}

export default function TreePsdStructurePage() {
  const rootTree = useMemo(() => toRootTree(psd as NodeRaw[]), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRaw = useMemo(() => {
    if (!selectedId) return null;
    const path = selectedId.split('/');
    // remove 'psd-root' if mistakenly included
    const normPath = path[0] === 'psd-root' ? path.slice(1) : path;
    return findById(psd as NodeRaw[], normPath);
  }, [selectedId]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, borderRight: '1px solid #e2e8f0' }}>
        <TreeDiagram
          data={rootTree}
          direction="TB"
          nodeWidth={240}
          nodeHeight={64}
          onSelectNode={(n) => setSelectedId(n.id)}
          renderNode={({ id, data }) => data.label}
        />
      </div>
      <div style={{ width: 360, padding: 12 }}>
        <h3 style={{ margin: '8px 0' }}>屬性</h3>
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
          <div style={{ color: '#718096', fontSize: 12 }}>點選左側樹節點以查看詳細屬性</div>
        )}
      </div>
    </div>
  );
}
