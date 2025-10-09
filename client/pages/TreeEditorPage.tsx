import React, { useEffect, useState } from 'react';
import './TreeEditorPage.css';

interface TreeEditorPageProps {
  treeId?: number;
  uuid?: string;
  onClose?: () => void;
}

interface TreeData {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  project_id?: number;
  project_name?: string;
  tree_type: string;
  data: any;
  config: any;
  node_count: number;
  max_depth: number;
  version: number;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = '/api';

const TreeEditorPage: React.FC<TreeEditorPageProps> = ({ treeId: propTreeId, uuid: propUuid, onClose }) => {
  const [treeId, setTreeId] = useState<number | null>(propTreeId || null);
  const [uuid, setUuid] = useState<string | null>(propUuid || null);
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 從 URL 參數獲取 ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTreeId = params.get('treeId');
    const urlUuid = params.get('uuid');

    if (urlTreeId) {
      setTreeId(parseInt(urlTreeId, 10));
    }
    if (urlUuid) {
      setUuid(urlUuid);
    }
  }, []);

  // 載入樹狀圖資料
  useEffect(() => {
    const loadTreeData = async () => {
      if (!treeId && !uuid) {
        setError('缺少樹狀圖 ID 或 UUID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let response;
        if (treeId) {
          response = await fetch(`${API_BASE_URL}/trees/${treeId}`);
        } else if (uuid) {
          response = await fetch(`${API_BASE_URL}/trees/uuid/${uuid}`);
        }

        if (!response) {
          throw new Error('無法發送請求');
        }

        const data = await response.json();

        if (data.success && data.data) {
          console.log('✅ 載入樹狀圖成功:', data.data);
          setTreeData(data.data);
          setTreeId(data.data.id);
          setUuid(data.data.uuid);
        } else {
          throw new Error(data.error || '載入失敗');
        }
      } catch (err) {
        console.error('❌ 載入樹狀圖失敗:', err);
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    };

    if (treeId || uuid) {
      loadTreeData();
    }
  }, [treeId, uuid]);

  const handleSave = async () => {
    if (!treeId || !treeData) return;

    try {
      const response = await fetch(`${API_BASE_URL}/trees/${treeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: treeData.name,
          description: treeData.description,
          data: treeData.data,
          config: treeData.config,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ 儲存成功');
        alert('儲存成功!');
      } else {
        throw new Error(data.error || '儲存失敗');
      }
    } catch (err) {
      console.error('❌ 儲存失敗:', err);
      alert('儲存失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
    }
  };

  const handleBackToHome = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.href = '/?view=home';
    }
  };

  if (loading) {
    return (
      <div className="tree-editor-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !treeData) {
    return (
      <div className="tree-editor-page">
        <div className="error-container">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#f44336"/>
          </svg>
          <h1>載入失敗</h1>
          <p>{error || '無法載入樹狀圖資料'}</p>
          <div className="error-actions">
            <button onClick={handleBackToHome} className="primary-btn">
              返回首頁
            </button>
            <button onClick={() => window.location.reload()} className="secondary-btn">
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-editor-page">
      <header className="tree-editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToHome} title="返回首頁">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
            </svg>
          </button>
          <div className="header-info">
            <h1>{treeData.name}</h1>
            {treeData.description && (
              <p className="tree-description">{treeData.description}</p>
            )}
            <div className="tree-meta">
              <span className="meta-badge">
                🔑 {treeData.uuid.slice(0, 8)}...
              </span>
              <span className="meta-badge">
                🔵 {treeData.node_count} 個節點
              </span>
              <span className="meta-badge">
                🔷 深度 {treeData.max_depth}
              </span>
              <span className="meta-badge">
                📌 版本 {treeData.version}
              </span>
              {treeData.project_name && (
                <span className="meta-badge project-badge">
                  📁 {treeData.project_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="save-btn" onClick={handleSave}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM15 9H5V5H15V9Z" fill="currentColor"/>
            </svg>
            儲存
          </button>
          <button className="close-btn" onClick={handleBackToHome}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="tree-editor-content">
        <div className="editor-placeholder">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11V3H15V6H9V3H2V11H9V8H11V18H15V21H22V13H15V16H13V8H15V11H22Z" fill="currentColor" opacity="0.3"/>
          </svg>
          <h2>樹狀圖編輯器</h2>
          <p>🚧 編輯器功能開發中...</p>
          <div className="tree-info-panel">
            <h3>樹狀圖資訊</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>ID:</label>
                <span>{treeData.id}</span>
              </div>
              <div className="info-item">
                <label>UUID:</label>
                <span>{treeData.uuid}</span>
              </div>
              <div className="info-item">
                <label>類型:</label>
                <span>{treeData.tree_type}</span>
              </div>
              <div className="info-item">
                <label>節點數:</label>
                <span>{treeData.node_count}</span>
              </div>
              <div className="info-item">
                <label>最大深度:</label>
                <span>{treeData.max_depth}</span>
              </div>
              <div className="info-item">
                <label>版本:</label>
                <span>{treeData.version}</span>
              </div>
              <div className="info-item">
                <label>建立時間:</label>
                <span>{new Date(treeData.created_at).toLocaleString('zh-TW')}</span>
              </div>
              <div className="info-item">
                <label>更新時間:</label>
                <span>{new Date(treeData.updated_at).toLocaleString('zh-TW')}</span>
              </div>
            </div>
          </div>
          <p className="hint">💡 提示: 您可以整合 ReactFlow 或其他樹狀圖庫來實現完整的編輯功能</p>
        </div>
      </main>
    </div>
  );
};

export default TreeEditorPage;
