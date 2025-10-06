import React, { useState } from 'react';
import { Node } from 'reactflow';
import './StyleEditor.css';

export interface NodeStyleEditorProps {
  node: Node;
  onSave: (nodeId: string, style: any) => void;
  onClose: () => void;
}

/**
 * 節點樣式編輯器
 */
const NodeStyleEditor: React.FC<NodeStyleEditorProps> = ({ node, onSave, onClose }) => {
  const currentStyle = node.data.style || {};
  
  const [backgroundColor, setBackgroundColor] = useState(
    currentStyle.backgroundColor || '#ffffff'
  );
  const [borderColor, setBorderColor] = useState(
    currentStyle.borderColor || '#3b82f6'
  );
  const [borderWidth, setBorderWidth] = useState(
    currentStyle.borderWidth || 2
  );
  const [textColor, setTextColor] = useState(
    currentStyle.textColor || '#1f2937'
  );
  const [fontSize, setFontSize] = useState(
    currentStyle.fontSize || 14
  );
  const [borderRadius, setBorderRadius] = useState(
    currentStyle.borderRadius || 8
  );

  const handleSave = () => {
    onSave(node.id, {
      backgroundColor,
      borderColor,
      borderWidth: Number(borderWidth),
      textColor,
      fontSize: Number(fontSize),
      borderRadius: Number(borderRadius),
    });
  };

  const presetColors = [
    { name: '藍色', bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    { name: '綠色', bg: '#dcfce7', border: '#22c55e', text: '#166534' },
    { name: '黃色', bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    { name: '紅色', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    { name: '紫色', bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
    { name: '灰色', bg: '#f3f4f6', border: '#6b7280', text: '#1f2937' },
  ];

  const applyPreset = (preset: typeof presetColors[0]) => {
    setBackgroundColor(preset.bg);
    setBorderColor(preset.border);
    setTextColor(preset.text);
  };

  return (
    <div className="style-editor-overlay" onClick={onClose}>
      <div className="style-editor" onClick={(e) => e.stopPropagation()}>
        <div className="style-editor-header">
          <h3>編輯節點樣式</h3>
          <button className="style-editor-close" onClick={onClose}>✕</button>
        </div>

        <div className="style-editor-body">
          {/* 預覽 */}
          <div className="style-editor-section">
            <label className="style-editor-label">預覽</label>
            <div
              className="style-editor-preview"
              style={{
                backgroundColor,
                borderColor,
                borderWidth: `${borderWidth}px`,
                color: textColor,
                fontSize: `${fontSize}px`,
                borderRadius: `${borderRadius}px`,
              }}
            >
              {node.data.label}
            </div>
          </div>

          {/* 預設配色 */}
          <div className="style-editor-section">
            <label className="style-editor-label">快速配色</label>
            <div className="style-editor-presets">
              {presetColors.map((preset) => (
                <button
                  key={preset.name}
                  className="style-editor-preset"
                  style={{
                    backgroundColor: preset.bg,
                    borderColor: preset.border,
                  }}
                  onClick={() => applyPreset(preset)}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* 顏色設定 */}
          <div className="style-editor-section">
            <label className="style-editor-label">
              背景顏色
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="style-editor-color-input"
              />
            </label>
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="style-editor-text-input"
            />
          </div>

          <div className="style-editor-section">
            <label className="style-editor-label">
              邊框顏色
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="style-editor-color-input"
              />
            </label>
            <input
              type="text"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="style-editor-text-input"
            />
          </div>

          <div className="style-editor-section">
            <label className="style-editor-label">
              文字顏色
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="style-editor-color-input"
              />
            </label>
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="style-editor-text-input"
            />
          </div>

          {/* 數值設定 */}
          <div className="style-editor-section">
            <label className="style-editor-label">
              邊框寬度 ({borderWidth}px)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              className="style-editor-range"
            />
          </div>

          <div className="style-editor-section">
            <label className="style-editor-label">
              文字大小 ({fontSize}px)
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="style-editor-range"
            />
          </div>

          <div className="style-editor-section">
            <label className="style-editor-label">
              圓角 ({borderRadius}px)
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="style-editor-range"
            />
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

export default NodeStyleEditor;
