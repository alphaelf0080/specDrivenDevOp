import React, { useState } from 'react';
import './TreeCard.css';

interface TreeCardProps {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  projectId?: number;
  projectName?: string;
  nodeCount: number;
  maxDepth: number;
  updatedAt: string;
  onOpen: (id: number, uuid: string) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const TreeCard: React.FC<TreeCardProps> = ({
  id,
  uuid,
  name,
  description,
  projectId,
  projectName,
  nodeCount,
  maxDepth,
  updatedAt,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffHours < 24) return `${diffHours} 小時前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-TW');
  };

  return (
    <div 
      className="tree-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="tree-card-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11V3H15V6H9V3H2V11H9V8H11V18H15V21H22V13H15V16H13V8H15V11H22Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div className="tree-card-content">
        <div className="tree-card-header">
          <h3 className="tree-card-title">{name}</h3>
          {showActions && (
            <div className="tree-card-actions">
              <button 
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                title="編輯"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                </svg>
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`確定要刪除「${name}」嗎?`)) {
                    onDelete(id);
                  }
                }}
                title="刪除"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {description && (
          <p className="tree-card-description">{description}</p>
        )}
        
        <div className="tree-card-meta">
          <span className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            {nodeCount} 個節點
          </span>
          <span className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V12L12 17L22 12V7L12 2Z" fill="currentColor"/>
            </svg>
            深度 {maxDepth}
          </span>
          {projectName && (
            <span className="meta-item project-badge">
              📁 {projectName}
            </span>
          )}
        </div>
        
        <div className="tree-card-footer">
          <span className="tree-card-time">{formatRelativeTime(updatedAt)}</span>
          <button 
            className="open-tree-btn"
            onClick={() => onOpen(id, uuid)}
          >
            開啟
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="tree-card-uuid" title={`UUID: ${uuid}`}>
        🔑 {uuid.slice(0, 8)}...
      </div>
    </div>
  );
};

export default TreeCard;
