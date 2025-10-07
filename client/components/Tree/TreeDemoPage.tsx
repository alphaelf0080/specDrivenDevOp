import React from 'react';
import TreeDiagram, { TreeNode } from './TreeDiagram';

const demoData: TreeNode = {
  id: 'root',
  label: '專案規格',
  children: [
    { id: 'ui', label: 'UI', children: [
      { id: 'ui-buttons', label: 'Buttons' },
      { id: 'ui-bfg', label: 'BFG' },
    ]},
    { id: 'reel', label: 'Reel', children: [
      { id: 'reel-grid', label: 'Grid 5x4' },
      { id: 'symbols', label: 'Symbols' },
    ]},
    { id: 'docs', label: 'Docs', children: [
      { id: 'manifest', label: 'manifest.json' },
      { id: 'psd', label: 'psd_structure.json' },
    ]},
  ]
};

export default function TreeDemoPage() {
  return <TreeDiagram data={demoData} />;
}
