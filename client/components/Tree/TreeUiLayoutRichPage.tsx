import React, { useMemo, useState } from 'react';
import TreeDiagram, { TreeNode } from './TreeDiagram';
// @ts-ignore
import uiLayout from '../../../docs/layout/ui_layout.json';

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

export default function TreeUiLayoutRichPage() {
  const [defaultCollapsed] = useState<string[]>(['buttons']);
  const tree = useMemo(() => buildTree(uiLayout as UILayout), []);
  return (
    <TreeDiagram
      data={tree}
      direction="LR"
      nodeWidth={260}
      defaultCollapsedIds={defaultCollapsed}
      renderNode={({ data }) => <div style={{ padding: 4 }}>{data.label}</div>}
    />
  );
}
