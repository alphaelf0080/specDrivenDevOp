import React, { useEffect } from 'react';
import MindMapCanvas from './MindMapCanvas';
import { useMindMap } from '../../hooks/useMindMap';
import { MindMapData } from '../../types/mindmap';
import './MindMapDemo.css';

/**
 * 心智圖示範元件
 */
const MindMapDemo: React.FC = () => {
  const {
    nodes,
    edges,
    addNode,
    exportData,
    initializeData,
    relayout,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useMindMap(undefined, {
    layout: 'horizontal',
    animated: true,
    minimap: true,
    controls: true,
  });

  // 示範資料
  useEffect(() => {
    const demoData: MindMapData = {
      title: 'Spec-Driven Development 心智圖',
      nodes: [
        {
          id: 'root',
          label: 'SDD 開發流程',
          type: 'root',
          data: { description: '規格驅動開發核心概念' },
        },
        {
          id: 'spec',
          label: '規格定義',
          type: 'branch',
          data: { description: 'JSON Schema + Zod' },
        },
        {
          id: 'engine',
          label: '引擎開發',
          type: 'branch',
          data: { description: '核心邏輯實作' },
        },
        {
          id: 'test',
          label: '測試驗證',
          type: 'branch',
          data: { description: '自動化測試' },
        },
        {
          id: 'deploy',
          label: '部署發布',
          type: 'branch',
          data: { description: 'CI/CD Pipeline' },
        },
        {
          id: 'spec-schema',
          label: 'Schema 設計',
          type: 'leaf',
        },
        {
          id: 'spec-validate',
          label: '規格驗證',
          type: 'leaf',
        },
        {
          id: 'engine-rng',
          label: 'RNG 隨機數',
          type: 'leaf',
        },
        {
          id: 'engine-payout',
          label: 'Payout 計算',
          type: 'leaf',
        },
        {
          id: 'test-unit',
          label: '單元測試',
          type: 'leaf',
        },
        {
          id: 'test-sim',
          label: '模擬測試',
          type: 'leaf',
        },
      ],
      edges: [
        { id: 'e1', source: 'root', target: 'spec' },
        { id: 'e2', source: 'root', target: 'engine' },
        { id: 'e3', source: 'root', target: 'test' },
        { id: 'e4', source: 'root', target: 'deploy' },
        { id: 'e5', source: 'spec', target: 'spec-schema' },
        { id: 'e6', source: 'spec', target: 'spec-validate' },
        { id: 'e7', source: 'engine', target: 'engine-rng' },
        { id: 'e8', source: 'engine', target: 'engine-payout' },
        { id: 'e9', source: 'test', target: 'test-unit' },
        { id: 'e10', source: 'test', target: 'test-sim' },
      ],
    };

    initializeData(demoData);
  }, [initializeData]);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddNode = () => {
    if (nodes.length > 0) {
      // 隨機選擇一個父節點
      const randomParent = nodes[Math.floor(Math.random() * nodes.length)];
      addNode(randomParent.id, {
        label: `新節點 ${Date.now()}`,
        type: 'leaf',
      });
    }
  };

  return (
    <div className="mindmap-demo">
      <div className="mindmap-toolbar">
        <h2>🧠 心智圖示範</h2>
        
        <div className="mindmap-toolbar-actions">
          <button onClick={handleAddNode} disabled={nodes.length === 0}>
            ➕ 新增節點
          </button>
          
          <button onClick={relayout}>
            🔄 重新布局
          </button>
          
          <div className="mindmap-toolbar-divider" />
          
          <button onClick={undo} disabled={!canUndo}>
            ↶ 復原
          </button>
          
          <button onClick={redo} disabled={!canRedo}>
            ↷ 重做
          </button>
          
          <div className="mindmap-toolbar-divider" />
          
          <button onClick={handleExport} disabled={nodes.length === 0}>
            💾 匯出 JSON
          </button>
          
          <button onClick={reset} className="mindmap-toolbar-danger">
            🗑️ 清空
          </button>
        </div>
      </div>

      <div className="mindmap-demo-canvas">
        <MindMapCanvas
          initialNodes={nodes}
          initialEdges={edges}
          config={{
            layout: 'horizontal',
            animated: true,
            minimap: true,
            controls: true,
          }}
        />
      </div>

      <div className="mindmap-info">
        <p>
          ✨ <strong>操作提示：</strong>
          拖曳節點移動 | 滾輪縮放 | 點擊節點連接 | 框選多個節點
        </p>
        <p>
          📊 <strong>節點數量：</strong>{nodes.length} | 
          <strong>連接數量：</strong>{edges.length}
        </p>
      </div>
    </div>
  );
};

export default MindMapDemo;
