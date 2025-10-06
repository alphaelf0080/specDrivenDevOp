import React, { useState, useEffect } from 'react';
import { MindMapListItem } from '../../types/mindmap-manager';
import './MindMapManager.css';

interface MindMapManagerProps {
  apiBaseUrl: string;
  onSelectMindMap: (id: string, name: string) => void;
  onClose: () => void;
  currentMindMapId?: string;
}

/**
 * 心智圖管理器 - 列表、建立、開啟、重新命名
 */
const MindMapManager: React.FC<MindMapManagerProps> = ({
  apiBaseUrl,
  onSelectMindMap,
  onClose,
  currentMindMapId,
}) => {
  const [mindMaps, setMindMaps] = useState<MindMapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newMindMapName, setNewMindMapName] = useState('');
  const [newMindMapDescription, setNewMindMapDescription] = useState('');
  const [template, setTemplate] = useState<'blank' | 'basic' | 'sdd'>('blank');

  // 載入心智圖列表
  useEffect(() => {
    loadMindMaps();
  }, []);

  const loadMindMaps = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/mindmap/list`);
      const data = await response.json();
      if (data.success) {
        setMindMaps(data.mindmaps || []);
      }
    } catch (error) {
      console.error('Failed to load mindmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  // 建立新心智圖
  const handleCreate = async () => {
    if (!newMindMapName.trim()) {
      alert('請輸入心智圖名稱');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/mindmap/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newMindMapName,
          description: newMindMapDescription,
          template,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ MindMapManager: Mind map created:', data.id, data.name);
        setShowCreateDialog(false);
        setNewMindMapName('');
        setNewMindMapDescription('');
        setTemplate('blank');
        await loadMindMaps();
        // 自動開啟新建立的心智圖
        console.log('🎯 MindMapManager: Auto-opening new mindmap');
        onSelectMindMap(data.id, data.name);
      } else {
        alert(`建立失敗：${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create mindmap:', error);
      alert('建立失敗，請稍後再試');
    }
  };

  // 重新命名心智圖
  const handleRename = async (id: string) => {
    if (!editingName.trim()) {
      alert('請輸入新名稱');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/mindmap/metadata/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Mind map renamed:', id);
        setEditingId(null);
        setEditingName('');
        await loadMindMaps();
        
        // 如果是當前開啟的心智圖，更新名稱
        if (id === currentMindMapId) {
          onSelectMindMap(id, editingName);
        }
      } else {
        alert(`重新命名失敗：${data.error}`);
      }
    } catch (error) {
      console.error('Failed to rename mindmap:', error);
      alert('重新命名失敗，請稍後再試');
    }
  };

  // 刪除心智圖
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/mindmap/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Mind map deleted:', id);
        await loadMindMaps();
      } else {
        alert(`刪除失敗：${data.error}`);
      }
    } catch (error) {
      console.error('Failed to delete mindmap:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mindmap-manager-overlay" onClick={onClose}>
      <div className="mindmap-manager" onClick={(e) => e.stopPropagation()}>
        <div className="mindmap-manager-header">
          <h2>心智圖管理器</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="mindmap-manager-actions">
          <button
            className="btn-primary"
            onClick={() => setShowCreateDialog(true)}
          >
            ➕ 建立新心智圖
          </button>
        </div>

        <div className="mindmap-manager-body">
          {loading ? (
            <div className="loading">載入中...</div>
          ) : mindMaps.length === 0 ? (
            <div className="empty-state">
              <p>📋 尚未建立任何心智圖</p>
              <p>點擊上方按鈕建立你的第一個心智圖</p>
            </div>
          ) : (
            <div className="mindmap-list">
              {mindMaps.map((mindmap) => (
                <div
                  key={mindmap.id}
                  className={`mindmap-item ${
                    mindmap.id === currentMindMapId ? 'active' : ''
                  }`}
                >
                  <div className="mindmap-item-content">
                    {editingId === mindmap.id ? (
                      <div className="mindmap-item-edit">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRename(mindmap.id);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditingName('');
                            }
                          }}
                          autoFocus
                          className="edit-input"
                        />
                        <button
                          className="btn-sm btn-success"
                          onClick={() => handleRename(mindmap.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="btn-sm btn-secondary"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mindmap-item-info">
                          <h3 className="mindmap-name">{mindmap.name}</h3>
                          <div className="mindmap-meta">
                            <span className="mindmap-date">
                              📅 {formatDate(mindmap.updatedAt)}
                            </span>
                            <span className="mindmap-count">
                              📊 {mindmap.nodeCount} 個節點
                            </span>
                          </div>
                        </div>
                        <div className="mindmap-item-actions">
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => {
                              console.log('🎯 MindMapManager: Opening mindmap from list:', mindmap.id, mindmap.name);
                              onSelectMindMap(mindmap.id, mindmap.name);
                            }}
                            disabled={mindmap.id === currentMindMapId}
                          >
                            {mindmap.id === currentMindMapId ? '✓ 已開啟' : '開啟'}
                          </button>
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => {
                              setEditingId(mindmap.id);
                              setEditingName(mindmap.name);
                            }}
                          >
                            ✏️ 重新命名
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDelete(mindmap.id, mindmap.name)}
                          >
                            🗑️ 刪除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 建立對話框 */}
        {showCreateDialog && (
          <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <h3>建立新心智圖</h3>
                <button
                  className="btn-close"
                  onClick={() => setShowCreateDialog(false)}
                >
                  ✕
                </button>
              </div>
              <div className="dialog-body">
                <div className="form-group">
                  <label>名稱 *</label>
                  <input
                    type="text"
                    value={newMindMapName}
                    onChange={(e) => setNewMindMapName(e.target.value)}
                    placeholder="輸入心智圖名稱"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>描述</label>
                  <textarea
                    value={newMindMapDescription}
                    onChange={(e) => setNewMindMapDescription(e.target.value)}
                    placeholder="選填：描述這個心智圖的用途"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>範本</label>
                  <div className="template-options">
                    <label className={`template-option ${template === 'blank' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="template"
                        value="blank"
                        checked={template === 'blank'}
                        onChange={(e) => setTemplate(e.target.value as any)}
                      />
                      <div className="template-card">
                        <div className="template-icon">📄</div>
                        <div className="template-name">空白</div>
                        <div className="template-desc">從零開始</div>
                      </div>
                    </label>
                    <label className={`template-option ${template === 'basic' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="template"
                        value="basic"
                        checked={template === 'basic'}
                        onChange={(e) => setTemplate(e.target.value as any)}
                      />
                      <div className="template-card">
                        <div className="template-icon">🌳</div>
                        <div className="template-name">基本</div>
                        <div className="template-desc">含基本節點</div>
                      </div>
                    </label>
                    <label className={`template-option ${template === 'sdd' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="template"
                        value="sdd"
                        checked={template === 'sdd'}
                        onChange={(e) => setTemplate(e.target.value as any)}
                      />
                      <div className="template-card">
                        <div className="template-icon">🎰</div>
                        <div className="template-name">SDD 範本</div>
                        <div className="template-desc">預設架構</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="dialog-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowCreateDialog(false)}
                >
                  取消
                </button>
                <button className="btn-primary" onClick={handleCreate}>
                  建立
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapManager;
