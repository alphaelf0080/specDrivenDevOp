import React, { useState } from 'react';
import { Edge } from 'reactflow';
import './StyleEditor.css';

export interface EdgeStyleEditorProps {
  edge: Edge;
  onSave: (edgeId: string, style: any) => void;
  onClose: () => void;
}

/**
 * 連接線樣式編輯器
 */
const EdgeStyleEditor: React.FC<EdgeStyleEditorProps> = ({ edge, onSave, onClose }) => {
  const currentStyle = edge.style || {};
  
  const [strokeColor, setStrokeColor] = useState(
    currentStyle.stroke || '#94a3b8'
  );
  const [strokeWidth, setStrokeWidth] = useState(
    currentStyle.strokeWidth || 2
  );
  const [strokeDasharray, setStrokeDasharray] = useState(
    currentStyle.strokeDasharray || ''
  );
  const [animated, setAnimated] = useState(
    edge.animated || false
  );
  const [edgeType, setEdgeType] = useState(
    edge.type || 'default'
  );

  const handleSave = () => {
    onSave(edge.id, {
      stroke: strokeColor,
      strokeWidth: Number(strokeWidth),
      strokeDasharray: strokeDasharray || undefined,
    });
  };

  const dashPatterns = [
    { name: '實線', value: '' },
    { name: '虛線', value: '5 5' },
    { name: '點線', value: '2 4' },
    { name: '長虛線', value: '10 5' },
    { name: '點劃線', value: '10 5 2 5' },
  ];

  const edgeTypes = [
    { name: '預設', value: 'default' },
    { name: '平滑', value: 'smoothstep' },
    { name: '直線', value: 'straight' },
    { name: '階梯', value: 'step' },
  ];

  return (
    <div className="style-editor-overlay" onClick={onClose}>
      <div className="style-editor" onClick={(e) => e.stopPropagation()}>
        <div className="style-editor-header">
          <h3>編輯連接線樣式</h3>
          <button className="style-editor-close" onClick={onClose}>✕</button>
        </div>

        <div className="style-editor-body">
          {/* 預覽 */}
          <div className="style-editor-section">
            <label className="style-editor-label">預覽</label>
            <svg className="style-editor-edge-preview" width="100%" height="60">
              <line
                x1="20"
                y1="30"
                x2="280"
                y2="30"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
              />
              {animated && (
                <line
                  x1="20"
                  y1="30"
                  x2="280"
                  y2="30"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray="5 5"
                  className="animated-edge"
                />
              )}
            </svg>
          </div>

          {/* 顏色設定 */}
          <div className="style-editor-section">
            <label className="style-editor-label">
              線條顏色
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="style-editor-color-input"
              />
            </label>
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="style-editor-text-input"
            />
          </div>

          {/* 線條寬度 */}
          <div className="style-editor-section">
            <label className="style-editor-label">
              線條寬度 ({strokeWidth}px)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="style-editor-range"
            />
          </div>

          {/* 線條樣式 */}
          <div className="style-editor-section">
            <label className="style-editor-label">線條樣式</label>
            <div className="style-editor-options">
              {dashPatterns.map((pattern) => (
                <button
                  key={pattern.name}
                  className={`style-editor-option ${strokeDasharray === pattern.value ? 'active' : ''}`}
                  onClick={() => setStrokeDasharray(pattern.value)}
                >
                  {pattern.name}
                </button>
              ))}
            </div>
          </div>

          {/* 連接線類型 */}
          <div className="style-editor-section">
            <label className="style-editor-label">連接線類型</label>
            <div className="style-editor-options">
              {edgeTypes.map((type) => (
                <button
                  key={type.name}
                  className={`style-editor-option ${edgeType === type.value ? 'active' : ''}`}
                  onClick={() => setEdgeType(type.value)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* 動畫效果 */}
          <div className="style-editor-section">
            <label className="style-editor-checkbox">
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
              />
              <span>啟用動畫效果</span>
            </label>
          </div>
        </div>

        <div className="style-editor-footer">
          <button className="style-editor-button style-editor-button-secondary" onClick={onClose}>
            取消
          </button>
          <button className="style-editor-button style-editor-button-primary" onClick={handleSave}>
            儲存
          </button>
        </div>
      </div>
    </div>
  );
};

export default EdgeStyleEditor;
