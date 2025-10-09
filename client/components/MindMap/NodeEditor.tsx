import React, { useState } from 'react';
import { Node } from 'reactflow';
import './NodeEditor.css';

export interface NodeEditorProps {
  node: Node;
  onSave: (nodeId: string, updates: { 
    label?: string; 
    description?: string; 
    style?: any; 
    type?: 'branch' | 'leaf' | 'root';
    enableAiAgent?: boolean;
    aiAgentType?: string;
    aiAgentPrompt?: string;
  }) => void;
  onClose: () => void;
}

/**
 * 節點編輯器 - 支援編輯文字和樣式
 */
const NodeEditor: React.FC<NodeEditorProps> = ({ node, onSave, onClose }) => {
  const currentStyle = node.data.style || {};
  const currentType: 'branch' | 'leaf' | 'root' = (node.data.type as any) || 'branch';
  const isRoot = currentType === 'root';
  
  // 文字內容
  const [label, setLabel] = useState(node.data.label || '');
  const [description, setDescription] = useState(
    node.data.description || node.data.data?.description || ''
  );
  
  // AI Agent 相關狀態
  const [enableAiAgent, setEnableAiAgent] = useState(
    node.data.enableAiAgent || false
  );
  const [aiAgentType, setAiAgentType] = useState(
    node.data.aiAgentType || 'claude'
  );
  const [aiAgentPrompt, setAiAgentPrompt] = useState(
    node.data.aiAgentPrompt || ''
  );
  
  // 樣式設定
  const [backgroundColor, setBackgroundColor] = useState(
    currentStyle.backgroundColor || 
    (node.data.type === 'root' ? '#dbeafe' : 
     node.data.type === 'branch' ? '#dcfce7' : '#fef3c7')
  );
  const [borderColor, setBorderColor] = useState(
    currentStyle.borderColor || 
    (node.data.type === 'root' ? '#3b82f6' : 
     node.data.type === 'branch' ? '#22c55e' : '#f59e0b')
  );
  const [borderWidth, setBorderWidth] = useState(
    currentStyle.borderWidth || 2
  );
  const [textColor, setTextColor] = useState(
    currentStyle.textColor || '#1f2937'
  );
  const [fontSize, setFontSize] = useState(
    currentStyle.fontSize || (node.data.type === 'root' ? 18 : 14)
  );
  const [borderRadius, setBorderRadius] = useState(
    currentStyle.borderRadius || 8
  );
  const [fontWeight, setFontWeight] = useState(
    currentStyle.fontWeight || (node.data.type === 'root' ? 'bold' : 'normal')
  );
  const [type, setType] = useState<'branch' | 'leaf' | 'root'>(currentType);

  const handleSave = () => {
    onSave(node.id, {
      label,
      description,
      enableAiAgent,
      aiAgentType,
      aiAgentPrompt,
      style: {
        backgroundColor,
        borderColor,
        borderWidth: Number(borderWidth),
        textColor,
        fontSize: Number(fontSize),
        borderRadius: Number(borderRadius),
        fontWeight,
      },
      type: isRoot ? undefined : type,
    });
  };

  const presetColors = [
    { name: '藍色 (根節點)', bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    { name: '綠色 (分支)', bg: '#dcfce7', border: '#22c55e', text: '#166534' },
    { name: '黃色 (葉節點)', bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    { name: '紅色 (重點)', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    { name: '紫色 (特殊)', bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
    { name: '灰色 (一般)', bg: '#f3f4f6', border: '#6b7280', text: '#1f2937' },
    { name: '青色', bg: '#cffafe', border: '#06b6d4', text: '#164e63' },
    { name: '橙色', bg: '#fed7aa', border: '#fb923c', text: '#7c2d12' },
  ];

  const applyPreset = (preset: typeof presetColors[0]) => {
    setBackgroundColor(preset.bg);
    setBorderColor(preset.border);
    setTextColor(preset.text);
  };

  return (
    <div className="node-editor-overlay" onClick={onClose}>
      <div className="node-editor" onClick={(e) => e.stopPropagation()}>
        <div className="node-editor-header">
          <h3>編輯節點</h3>
          <button className="node-editor-close" onClick={onClose}>✕</button>
        </div>

        <div className="node-editor-body">
          {/* 預覽 */}
          <div className="node-editor-section">
            <label className="node-editor-label">預覽</label>
            <div
              className="node-editor-preview"
              style={{
                backgroundColor,
                borderColor,
                borderWidth: `${borderWidth}px`,
                borderStyle: 'solid',
                color: textColor,
                fontSize: `${fontSize}px`,
                borderRadius: `${borderRadius}px`,
                fontWeight,
                padding: '12px 16px',
                textAlign: 'center',
              }}
            >
              <div className="preview-label">{label || '節點標題'}</div>
              {description && (
                <div className="preview-description" style={{ fontSize: `${fontSize - 2}px`, opacity: 0.7, marginTop: '4px' }}>
                  {description}
                </div>
              )}
            </div>
          </div>

          {/* 文字內容 */}
          <div className="node-editor-section">
            <label className="node-editor-label">標題</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="node-editor-text-input"
              placeholder="請輸入節點標題"
              autoFocus
            />
          </div>

          <div className="node-editor-section">
            <label className="node-editor-label">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="node-editor-textarea"
              placeholder="請輸入節點描述（選填）"
              rows={3}
            />
          </div>

          {/* AI Agent 設定 */}
          <div className="node-editor-section">
            <div className="node-editor-ai-header">
              <label className="node-editor-label">AI Agent</label>
              <label className="node-editor-switch">
                <input
                  type="checkbox"
                  checked={enableAiAgent}
                  onChange={(e) => setEnableAiAgent(e.target.checked)}
                />
                <span className="node-editor-switch-slider"></span>
              </label>
            </div>
            
            {enableAiAgent && (
              <div className="node-editor-ai-content">
                <div className="node-editor-field" style={{ marginTop: '12px' }}>
                  <label className="node-editor-sublabel">AI Agent 類型</label>
                  <select
                    value={aiAgentType}
                    onChange={(e) => setAiAgentType(e.target.value)}
                    className="node-editor-select"
                  >
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="gpt-4">GPT-4 (OpenAI)</option>
                    <option value="gemini">Gemini (Google)</option>
                    <option value="copilot">GitHub Copilot</option>
                    <option value="custom">自訂 Agent</option>
                  </select>
                </div>
                
                <div className="node-editor-field" style={{ marginTop: '12px' }}>
                  <label className="node-editor-sublabel">AI Prompt</label>
                  <textarea
                    value={aiAgentPrompt}
                    onChange={(e) => setAiAgentPrompt(e.target.value)}
                    className="node-editor-textarea"
                    placeholder="請輸入 AI Agent 的 Prompt 指令..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 快速配色 */}
          <div className="node-editor-section">
            <label className="node-editor-label">快速配色</label>
            <div className="node-editor-presets">
              {presetColors.map((preset) => (
                <button
                  key={preset.name}
                  className="node-editor-preset"
                  style={{
                    backgroundColor: preset.bg,
                    borderColor: preset.border,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                  }}
                  onClick={() => applyPreset(preset)}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* 樣式設定 */}
          <div className="node-editor-section">
            <label className="node-editor-label">樣式設定</label>
            {!isRoot && (
              <div className="node-editor-row">
                <div className="node-editor-field">
                  <label className="node-editor-sublabel">節點類型</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="node-editor-select"
                  >
                    <option value="branch">分支（branch）</option>
                    <option value="leaf">葉節點（leaf）</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="node-editor-row">
              <div className="node-editor-field">
                <label className="node-editor-sublabel">
                  背景顏色
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="node-editor-color-input"
                  />
                </label>
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="node-editor-small-input"
                />
              </div>

              <div className="node-editor-field">
                <label className="node-editor-sublabel">
                  邊框顏色
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="node-editor-color-input"
                  />
                </label>
                <input
                  type="text"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="node-editor-small-input"
                />
              </div>

              <div className="node-editor-field">
                <label className="node-editor-sublabel">
                  文字顏色
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="node-editor-color-input"
                  />
                </label>
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="node-editor-small-input"
                />
              </div>
            </div>

            <div className="node-editor-row">
              <div className="node-editor-field">
                <label className="node-editor-sublabel">
                  邊框寬度
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="node-editor-range"
                />
                <span className="node-editor-value">{borderWidth}px</span>
              </div>

              <div className="node-editor-field">
                <label className="node-editor-sublabel">
                  圓角半徑
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="node-editor-range"
                />
                <span className="node-editor-value">{borderRadius}px</span>
              </div>

              <div className="node-editor-field">
                <label className="node-editor-sublabel">
                  文字大小
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="node-editor-range"
                />
                <span className="node-editor-value">{fontSize}px</span>
              </div>
            </div>

            <div className="node-editor-row">
              <div className="node-editor-field">
                <label className="node-editor-sublabel">
                  文字粗細
                </label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(e.target.value)}
                  className="node-editor-select"
                >
                  <option value="normal">一般</option>
                  <option value="bold">粗體</option>
                  <option value="600">半粗體</option>
                  <option value="300">細體</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="node-editor-footer">
          <button className="node-editor-button node-editor-button-cancel" onClick={onClose}>
            取消
          </button>
          <button className="node-editor-button node-editor-button-save" onClick={handleSave}>
            儲存
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
