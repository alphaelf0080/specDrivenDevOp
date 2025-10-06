import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MindMapNode as MindMapNodeType } from '../../types/mindmap';
import './MindMapNode.css';

/**
 * 自訂心智圖節點元件
 */
const MindMapNode: React.FC<NodeProps<MindMapNodeType>> = ({ data, isConnectable }) => {
  const nodeType = data.type || 'branch';
  
  return (
    <div className={`mindmap-node mindmap-node-${nodeType}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="mindmap-handle"
      />
      
      <div className="mindmap-node-content">
        <div className="mindmap-node-label">{data.label}</div>
        {data.data?.description && (
          <div className="mindmap-node-description">{data.data.description}</div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="mindmap-handle"
      />
    </div>
  );
};

export default memo(MindMapNode);
