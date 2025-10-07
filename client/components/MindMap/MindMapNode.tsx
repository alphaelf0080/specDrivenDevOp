import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MindMapNode as MindMapNodeType } from '../../types/mindmap';
import './MindMapNode.css';

/**
 * 自訂心智圖節點元件
 * 根據節點位置動態調整連接點方向，避免連接線打結
 */
const MindMapNode: React.FC<NodeProps<MindMapNodeType>> = ({ data, isConnectable, xPos, yPos }) => {
  const nodeType = data.type || 'branch';
  const isRoot = nodeType === 'root' || data.id === 'root';
  // 從資料或依類型給預設樣式（避免外層 React Flow 容器產生第二層邊框）
  const defaultStyleByType = {
    root: {
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      borderWidth: 2,
      textColor: '#1e40af',
      fontSize: 16,
      borderRadius: 12,
      fontWeight: 'bold',
    },
    branch: {
      backgroundColor: '#dcfce7',
      borderColor: '#22c55e',
      borderWidth: 2,
      textColor: '#065f46',
      fontSize: 14,
      borderRadius: 8,
      fontWeight: 600,
    },
    leaf: {
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      borderWidth: 2,
      textColor: '#92400e',
      fontSize: 14,
      borderRadius: 8,
      fontWeight: 600,
    },
  } as const;

  const s = { ...(defaultStyleByType as any)[nodeType], ...(data.style || {}) };
  const inlineStyle: React.CSSProperties = {
    backgroundColor: s.backgroundColor,
    borderColor: s.borderColor,
    borderWidth: `${s.borderWidth ?? 2}px`,
    borderStyle: 'solid',
    color: s.textColor,
    fontSize: `${s.fontSize ?? 14}px`,
    borderRadius: `${s.borderRadius ?? 8}px`,
    fontWeight: s.fontWeight as React.CSSProperties['fontWeight'],
  };
  
  // 根據節點的 x 座標判斷它在根節點的左側還是右側
  // xPos < 0 表示在左側，xPos > 0 表示在右側
  const isLeftSide = (xPos ?? 0) < 0;
  
  // 動態決定連接點位置
  // 左側節點：target 在右邊（接收來自右邊根節點的連線），source 在左邊（發出到左邊的子節點）
  // 右側節點：target 在左邊（接收來自左邊根節點的連線），source 在右邊（發出到右邊的子節點）
  const targetPosition = isLeftSide ? Position.Right : Position.Left;
  const sourcePosition = isLeftSide ? Position.Left : Position.Right;
  
  // 調試輸出
  React.useEffect(() => {
    if (!isRoot) {
      console.log('🔵 MindMapNode:', {
        id: data.id,
        label: data.label,
        xPos,
        isLeftSide,
        target: targetPosition,
        source: sourcePosition
      });
    }
  }, [data.label, data.id, nodeType, xPos, isLeftSide, targetPosition, sourcePosition, isRoot]);
  
  return (
    <div className={`mindmap-node mindmap-node-${nodeType}`} style={inlineStyle}>
      {/* 舊版相容：保留一個隱藏的 fallback target handle，id='target' */}
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        className="mindmap-handle mindmap-handle-target mindmap-handle-fallback"
        id="target"
      />
      {/* Target handles - 接收來自父節點的連線（四個方向） */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="mindmap-handle mindmap-handle-target"
        id="target-top"
      />
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
        className="mindmap-handle mindmap-handle-target"
        id="target-right"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="mindmap-handle mindmap-handle-target"
        id="target-bottom"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="mindmap-handle mindmap-handle-target"
        id="target-left"
      />
      
      <div className="mindmap-node-content">
        <div className="mindmap-node-label">{data.label}</div>
        {data.data?.description && typeof data.data.description === 'string' ? (
          <div className="mindmap-node-description">{data.data.description}</div>
        ) : null}
      </div>
      
      {/* Source handles - 連接到子節點 */}
      {/* 所有節點提供四個方向的 source handles；保留隱藏的 'source' 以相容舊資料 */}
      {isRoot ? (
        <>
          <Handle
            type="source"
            position={Position.Top}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-top"
          />
          <Handle
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-right"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-bottom"
          />
          <Handle
            type="source"
            position={Position.Left}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-left"
          />
          <Handle
            type="source"
            position={sourcePosition}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source mindmap-handle-fallback"
            id="source"
          />
        </>
      ) : (
        <>
          <Handle
            type="source"
            position={Position.Top}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-top"
          />
          <Handle
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-right"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-bottom"
          />
          <Handle
            type="source"
            position={Position.Left}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source"
            id="source-left"
          />
          <Handle
            type="source"
            position={sourcePosition}
            isConnectable={isConnectable}
            className="mindmap-handle mindmap-handle-source mindmap-handle-fallback"
            id="source"
          />
        </>
      )}
    </div>
  );
};

export default memo(MindMapNode);
