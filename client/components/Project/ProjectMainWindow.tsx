import React, { useEffect, useState } from 'react';
import './ProjectMainWindow.css';
import TreeDiagram, { TreeNode } from '../Tree/TreeDiagram';

interface ProjectMainWindowProps {
  projectId: number;
  onClose?: () => void;
}

interface Project {
  id: number;
  uuid: string;
  name: string;
  name_zh: string;
  name_en: string;
  game_type: string;
  description: string;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  main_tree_id?: number | null; // 關聯到 trees 表的 ID
  tree_data?: TreeNode | null; // 舊資料(備用)
  tree_config?: Record<string, unknown> | null;
  tree_version?: number;
  tree_updated_at?: string;
}

const ProjectMainWindow: React.FC<ProjectMainWindowProps> = ({ projectId, onClose }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [treeId, setTreeId] = useState<number | null>(null); // 樹狀圖 ID
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('無法載入專案資料');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setProject(result.data);
        
        // 優先使用新的 main_tree_id 載入樹狀圖
        if (result.data.main_tree_id) {
          await loadTreeFromDatabase(result.data.main_tree_id);
        } else if (result.data.tree_data) {
          // 回退到舊的 tree_data (遷移前的資料)
          console.log('[ProjectMainWindow] 使用舊的 tree_data');
          setTreeData(result.data.tree_data);
        } else {
          // 沒有樹狀圖資料時，建立預設根節點並保存到資料庫
          await createDefaultTree(result.data);
        }
      } else {
        throw new Error(result.error || '專案資料格式錯誤');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadTreeFromDatabase = async (treeIdToLoad: number) => {
    try {
      const response = await fetch(`/api/trees/${treeIdToLoad}`);
      if (!response.ok) {
        throw new Error('無法載入樹狀圖資料');
      }
      const result = await response.json();
      if (result.success && result.data) {
        console.log('[ProjectMainWindow] 載入樹狀圖:', result.data);
        setTreeData(result.data.data); // result.data.data 是 TreeNode
        setTreeId(result.data.id);
      }
    } catch (err) {
      console.error('載入樹狀圖失敗:', err);
      // 如果載入失敗,創建新的樹狀圖
      if (project) {
        await createDefaultTree(project);
      }
    }
  };

  const createDefaultTree = async (projectData: Project) => {
    const defaultTree = {
      id: 'root',
      label: projectData.name || '專案根節點',
      children: [],
      metadata: {
        nodeId: 0,
        description: '專案的根節點',
      },
    };
    
    console.log('[ProjectMainWindow] 創建新的根節點:', defaultTree);
    
    try {
      // 創建新的樹狀圖記錄
      const response = await fetch('/api/trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${projectData.name_zh || projectData.name} - 專案樹狀圖`,
          description: `專案 "${projectData.name}" 的樹狀結構`,
          projectId: projectData.id,
          treeType: 'ui_layout',
          data: defaultTree,
          direction: 'LR',
          setAsMain: true, // 設定為專案的主要樹狀圖
        }),
      });

      if (!response.ok) {
        throw new Error('創建樹狀圖失敗');
      }

      const result = await response.json();
      if (result.success && result.data) {
        console.log('[ProjectMainWindow] 樹狀圖創建成功:', result.data);
        setTreeData(result.data.data);
        setTreeId(result.data.id);
        
        // 更新專案資料
        setProject(prev => prev ? { ...prev, main_tree_id: result.data.id } : null);
      }
    } catch (err) {
      console.error('創建樹狀圖錯誤:', err);
      // 失敗時至少顯示預設樹狀圖
      setTreeData(defaultTree);
    }
  };

  const handleTreeChange = async (nodeId: string, updates: Partial<TreeNode>) => {
    if (!treeData) return;

    // 更新本地樹狀圖狀態
    const updateNodeRecursive = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeRecursive),
        };
      }
      return node;
    };

    const updatedTree = updateNodeRecursive(treeData);
    await saveTreeData(updatedTree);
  };

  const handleAddNode = async (parentNodeId: string) => {
    if (!treeData) return;

    const newNodeId = `node-${Date.now()}`;
    const newNode: TreeNode = {
      id: newNodeId,
      label: '新節點',
      children: [],
    };

    // 找到父節點並新增子節點
    const addNodeRecursive = (node: TreeNode): TreeNode => {
      if (node.id === parentNodeId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addNodeRecursive),
        };
      }
      return node;
    };

    const updatedTree = addNodeRecursive(treeData);
    await saveTreeData(updatedTree);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!treeData || nodeId === treeData.id) return;

    // 刪除指定節點
    const deleteNodeRecursive = (node: TreeNode): TreeNode => {
      if (node.children) {
        return {
          ...node,
          children: node.children
            .filter(child => child.id !== nodeId)
            .map(deleteNodeRecursive),
        };
      }
      return node;
    };

    const updatedTree = deleteNodeRecursive(treeData);
    await saveTreeData(updatedTree);
  };

  const saveTreeData = async (updatedTree: TreeNode, updateState = true) => {
    if (updateState) {
      setTreeData(updatedTree);
    }
    
    // 如果沒有 treeId,先創建新的樹狀圖
    if (!treeId) {
      console.warn('[ProjectMainWindow] 沒有 treeId,無法儲存');
      return;
    }
    
    // 儲存到資料庫 (使用新的 trees API)
    try {
      setSaving(true);
      const response = await fetch(`/api/trees/${treeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: updatedTree, // 更新樹狀圖資料
        }),
      });

      if (!response.ok) {
        throw new Error('儲存樹狀圖失敗');
      }

      const result = await response.json();
      if (result.success && result.data) {
        console.log('[ProjectMainWindow] 樹狀圖已儲存 (版本:', result.data.version, ')');
      }
    } catch (err) {
      console.error('儲存樹狀圖錯誤:', err);
      // 可以在這裡加入錯誤提示
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="project-main-window loading">
        <div className="loading-spinner">⏳ 載入中...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-main-window error">
        <div className="error-message">
          <span>❌</span>
          <p>{error || '專案不存在'}</p>
          {onClose && <button onClick={onClose}>返回</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="project-main-window">
      <header className="project-header">
        <div className="header-left">
          <div className="project-icon-header">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="project-header-info">
            <h1 className="project-header-title">{project.name}</h1>
            <div className="project-header-meta">
              <span className="project-header-type">{project.game_type}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="header-action-btn">Save</button>
          {onClose && <button className="header-close-btn" onClick={onClose}>X</button>}
        </div>
      </header>

      <div className="project-body">
        <aside className="sidebar-narrow">
          <div className="nav-icons">
            {/* 導航按鈕待定義 */}
          </div>
        </aside>
        <aside className="sidebar-medium">
          <div className="sidebar-header">
            <h1>{project.name}</h1>
            <p>{project.game_type}</p>
          </div>
          <nav className="sidebar-nav">
            <h3>{activeSection}</h3>
          </nav>
        </aside>
        <main className="main-content-area">
          <div className="content-header">
            <div className="breadcrumb">{project.name} / 樹狀圖編輯器</div>
            {saving && <span className="saving-indicator">⏳ 儲存中...</span>}
          </div>
          <div className="content-body tree-diagram-container">
            {treeData && (
              <TreeDiagram 
                data={treeData} 
                direction="LR"
                viewportKeyPrefix={`project-${projectId}`}
                embedded={true}
                onNodeUpdate={handleTreeChange}
                onAddNode={handleAddNode}
                onDeleteNode={handleDeleteNode}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectMainWindow;