import React, { useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import './ContextMenu.css';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  position: ContextMenuPosition | null;
  selectedNode?: Node | null;
  selectedEdge?: Edge | null;
  onClose: () => void;
  onAddNode?: (parentId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onEditNodeStyle?: (nodeId: string) => void;
  onEditEdgeStyle?: (edgeId: string) => void;
  onDisconnectNodes?: (edgeId: string) => void;
  onAddConnection?: (nodeId: string) => void;
}

/**
 * 右鍵選單元件
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  selectedNode,
  selectedEdge,
  onClose,
  onAddNode,
  onDeleteNode,
  onDeleteEdge,
  onEditNodeStyle,
  onEditEdgeStyle,
  onDisconnectNodes,
  onAddConnection,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as HTMLElement)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position, onClose]);

  if (!position) return null;

  const handleMenuClick = (action: () => void) => {
    action();
    onClose();
  };

  // 節點選單
  if (selectedNode) {
    return (
      <div
        ref={menuRef}
        className="context-menu"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="context-menu-header">
          <span className="context-menu-title">節點操作</span>
          <span className="context-menu-node-id">{selectedNode.data.label}</span>
        </div>
        <div className="context-menu-divider" />
        
        {onAddNode && (
          <button
            className="context-menu-item"
            onClick={() => handleMenuClick(() => onAddNode(selectedNode.id))}
          >
            <span className="context-menu-icon">➕</span>
            <span>新增子節點</span>
          </button>
        )}
        
        {onAddConnection && (
          <button
            className="context-menu-item"
            onClick={() => handleMenuClick(() => onAddConnection(selectedNode.id))}
          >
            <span className="context-menu-icon">🔗</span>
            <span>連接到其他節點</span>
          </button>
        )}
        
        <div className="context-menu-divider" />
        
        {onEditNodeStyle && (
          <button
            className="context-menu-item"
            onClick={() => handleMenuClick(() => onEditNodeStyle(selectedNode.id))}
          >
            <span className="context-menu-icon">🎨</span>
            <span>編輯節點樣式</span>
          </button>
        )}
        
        <div className="context-menu-divider" />
        
        {onDeleteNode && (
          <button
            className="context-menu-item context-menu-item-danger"
            onClick={() => handleMenuClick(() => onDeleteNode(selectedNode.id))}
          >
            <span className="context-menu-icon">🗑️</span>
            <span>刪除節點</span>
          </button>
        )}
      </div>
    );
  }

  // 連接線選單
  if (selectedEdge) {
    return (
      <div
        ref={menuRef}
        className="context-menu"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="context-menu-header">
          <span className="context-menu-title">連接線操作</span>
          <span className="context-menu-node-id">
            {selectedEdge.source} → {selectedEdge.target}
          </span>
        </div>
        <div className="context-menu-divider" />
        
        {onEditEdgeStyle && (
          <button
            className="context-menu-item"
            onClick={() => handleMenuClick(() => onEditEdgeStyle(selectedEdge.id))}
          >
            <span className="context-menu-icon">🎨</span>
            <span>編輯連接線樣式</span>
          </button>
        )}
        
        <div className="context-menu-divider" />
        
        {onDisconnectNodes && (
          <button
            className="context-menu-item context-menu-item-warning"
            onClick={() => handleMenuClick(() => onDisconnectNodes(selectedEdge.id))}
          >
            <span className="context-menu-icon">🔓</span>
            <span>解除連接</span>
          </button>
        )}
        
        {onDeleteEdge && (
          <button
            className="context-menu-item context-menu-item-danger"
            onClick={() => handleMenuClick(() => onDeleteEdge(selectedEdge.id))}
          >
            <span className="context-menu-icon">🗑️</span>
            <span>刪除連接線</span>
          </button>
        )}
      </div>
    );
  }

  // 空白區域選單
  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">畫布操作</span>
      </div>
      <div className="context-menu-divider" />
      <button
        className="context-menu-item"
        onClick={onClose}
      >
        <span className="context-menu-icon">✖️</span>
        <span>取消</span>
      </button>
    </div>
  );
};

export default ContextMenu;
