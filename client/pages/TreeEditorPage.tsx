import React, { useEffect, useState, useCallback, useMemo } from 'react';
import TreeDiagram, { TreeNode } from '../components/Tree/TreeDiagram';
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
  const [diagramData, setDiagramData] = useState<TreeNode | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
          
          // 轉換資料庫格式到 TreeDiagram 格式
          if (data.data.data) {
            setDiagramData(data.data.data);
          } else {
            // 創建默認樹狀圖結構
            setDiagramData({
              id: 'root',
              label: data.data.name || '根節點',
              children: [],
            });
          }
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

  // 生成節點 ID
  const generateNodeId = useCallback(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `node-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }, []);

  // 創建新節點
  const createNewTreeNode = useCallback((): TreeNode => ({
    id: generateNodeId(),
    label: '新節點',
    children: [],
    metadata: {
      nodeId: Date.now(),
      mask: {},
    },
  }), [generateNodeId]);

  // 處理節點更新
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    setDiagramData(prevTree => {
      if (!prevTree) return prevTree;
      
      const updateNodeInTree = (node: TreeNode): TreeNode => {
        if (node.id === nodeId) {
          return { ...node, ...updates };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateNodeInTree),
          };
        }
        return node;
      };
      
      setHasChanges(true);
      return updateNodeInTree(prevTree);
    });
  }, []);

  // 處理節點刪除
  const handleNodeDelete = useCallback((nodeId: string) => {
    setDiagramData(prevTree => {
      if (!prevTree) return prevTree;
      
      const deleteNodeInTree = (node: TreeNode): TreeNode | null => {
        if (node.id === nodeId) {
          return null;
        }
        if (node.children) {
          return {
            ...node,
            children: node.children
              .map(deleteNodeInTree)
              .filter((child): child is TreeNode => child !== null),
          };
        }
        return node;
      };
      
      setHasChanges(true);
      const result = deleteNodeInTree(prevTree);
      return result || prevTree;
    });
  }, []);

  // 處理新增子節點
  const handleAddChild = useCallback((parentId: string) => {
    setDiagramData(prevTree => {
      if (!prevTree) return prevTree;
      
      const addChildToNode = (node: TreeNode): TreeNode => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), createNewTreeNode()],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(addChildToNode),
          };
        }
        return node;
      };
      
      setHasChanges(true);
      return addChildToNode(prevTree);
    });
  }, [createNewTreeNode]);

  const handleSave = async () => {
    if (!treeId || !treeData || !diagramData) return;

    try {
      const response = await fetch(`${API_BASE_URL}/trees/${treeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: treeData.name,
          description: treeData.description,
          data: diagramData, // 保存樹狀圖資料
          config: treeData.config,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ 儲存成功');
        setHasChanges(false);
        alert('儲存成功!');
        // 重新載入資料
        const updatedData = { ...treeData, data: diagramData };
        setTreeData(updatedData);
      } else {
        throw new Error(data.error || '儲存失敗');
      }
    } catch (err) {
      console.error('❌ 儲存失敗:', err);
      alert('儲存失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
    }
  };

  const handleBackToHome = () => {
    if (hasChanges) {
      if (!confirm('有未儲存的變更,確定要離開嗎?')) {
        return;
      }
    }
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

  if (error || !treeData || !diagramData) {
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
        <button className="back-btn" onClick={handleBackToHome} title="返回首頁">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
          </svg>
          返回首頁
        </button>
        
        <div className="header-title">
          {treeData.project_name && (
            <span className="project-name">� {treeData.project_name}</span>
          )}
          <h1 className="tree-name">{treeData.name}</h1>
        </div>
        
        <button 
          className="save-btn" 
          onClick={handleSave} 
          disabled={!hasChanges}
          title={hasChanges ? '儲存變更' : '無變更'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM15 9H5V5H15V9Z" fill="currentColor"/>
          </svg>
          儲存
          {hasChanges && <span className="changes-dot">●</span>}
        </button>
      </header>

      <main className="tree-editor-content tree-editor-active">
        <TreeDiagram
          data={diagramData}
          onNodeUpdate={handleNodeUpdate}
          onDeleteNode={handleNodeDelete}
          onAddNode={handleAddChild}
        />
      </main>
    </div>
  );
};

export default TreeEditorPage;
