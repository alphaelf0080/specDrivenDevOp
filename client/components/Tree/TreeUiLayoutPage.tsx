import React, { useMemo } from 'react';
import TreeDiagram, { TreeNode } from './TreeDiagram';
// 直接匯入 JSON（Vite 支援 JSON 模組）
// 路徑：client/components/Tree -> ../../../docs/layout/ui_layout.json
// 若遇到型別告警，可將其視為 any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import uiLayout from '../../../docs/layout/ui_layout.json';

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

export default function TreeUiLayoutPage() {
  const treeData = useMemo(() => toTree(uiLayout as UILayout), []);
  return <TreeDiagram data={treeData} direction="LR" />;
}
