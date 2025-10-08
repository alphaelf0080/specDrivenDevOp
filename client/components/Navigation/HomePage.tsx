import React, { useEffect, useState } from 'react';
import { getTreeHistory, formatRelativeTime, TreeHistoryItem } from '../../utils/treeHistory';
import { useDbInit } from '../../hooks/useDbInit';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenMindMap?: (id: string, name: string) => void;
}

interface MindMapItem {
  id: string;
  name: string;
  updatedAt: string;
  nodeCount: number;
}

const API_BASE_URL = '/api';

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenMindMap }) => {
  const [recentMindMaps, setRecentMindMaps] = useState<MindMapItem[]>([]);
  const [recentTrees, setRecentTrees] = useState<TreeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 資料庫初始化
  const { projects, loading: dbLoading, error: dbError, initialized } = useDbInit(true);

  // 載入最新的三個心智圖
  useEffect(() => {
    const loadRecentMindMaps = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mindmap/list`);
        const data = await response.json();
        
        if (data.success && data.mindmaps) {
          // 取最新的三個
          const recent = data.mindmaps.slice(0, 3);
          setRecentMindMaps(recent);
        }
      } catch (error) {
        console.error('Failed to load recent mindmaps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentMindMaps();
    
    // 載入樹狀圖歷史
    const treeHistory = getTreeHistory();
    setRecentTrees(treeHistory);
  }, []);

  // 資料庫初始化完成後的處理
  useEffect(() => {
    if (initialized && !dbLoading) {
      console.log('✅ 資料庫初始化完成');
      console.log(`📊 載入 ${projects.length} 個專案`);
      if (projects.length > 0) {
        console.log('專案列表:', projects);
      }
    }
    if (dbError) {
      console.error('❌ 資料庫初始化錯誤:', dbError);
    }
  }, [initialized, dbLoading, dbError, projects]);

  const handleOpenMindMap = (id: string, name: string) => {
    console.log('🚀 HomePage: Opening mindmap:', { id, name });
    if (onOpenMindMap) {
      onOpenMindMap(id, name);
    } else {
      console.error('❌ HomePage: onOpenMindMap callback is not provided!');
    }
  };

  const formatLastOpened = (dateString: string) => {
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
    <div className="home-page">
      {/* 左側導覽區 */}
      <aside className="sidebar-nav">
        <div className="nav-item active">
          <span className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="nav-label">首頁</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="nav-label">專案</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-demo')}>
          <span className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="nav-label">樹枝圖</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-ui-layout')}>
          <span className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="nav-label">UI 樹枝圖</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-ui-layout-rich')}>
          <span className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="nav-label">UI 樹枝圖(完整資訊)</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-psd-structure')}>
          <span className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16ZM21 19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19H21ZM21 5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5H21Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="nav-label">PSD 全結構樹</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="nav-label">設定</span>
        </div>
      </aside>

      {/* 中間主要內容區 */}
      <main className="main-content">
        <header className="page-header">
          <h1>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
              <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3Z" fill="currentColor"/>
            </svg>
            規格驅動開發平台
          </h1>
          <p className="subtitle">Specification-Driven Development Platform</p>
        </header>

        {/* 專案區塊 */}
        <section className="project-section">
          <div className="section-header">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                <path d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6Z" fill="currentColor"/>
              </svg>
              專案
            </h2>
            <button 
              className="manage-btn"
              onClick={() => {
                console.log('🔘 HomePage: 點擊開啟專案管理按鈕');
                onNavigate('project-manager');
              }}
            >
              <span>專案管理視窗</span>
              <span className="arrow">→</span>
            </button>
          </div>

          <div className="project-container">
            {dbLoading ? (
              <div className="db-status loading">
                <div className="status-icon">⏳</div>
                <div className="status-text">正在載入專案資料...</div>
              </div>
            ) : dbError ? (
              <div className="db-status error">
                <div className="status-icon">❌</div>
                <div className="status-text">
                  <div>資料庫連線錯誤</div>
                  <div className="error-detail">{dbError}</div>
                </div>
              </div>
            ) : (
              <div className="db-status success">
                <div className="status-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="status-content">
                  <div className="project-count">
                    <span className="count-number">{projects.length}</span>
                    <span className="count-label">個專案</span>
                  </div>
                  <div className="status-detail">
                    {initialized ? (
                      <span className="badge success">✓ 資料庫已連線</span>
                    ) : (
                      <span className="badge warning">初始化中...</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 心智圖區塊 */}
        <section className="mindmap-section">
          <div className="section-header">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              心智圖
            </h2>
            <button 
              className="manage-btn"
              onClick={() => {
                console.log('🔘 HomePage: 點擊開啟心智圖管理按鈕');
                onNavigate('mindmap-manager');
              }}
            >
              <span>開啟心智圖管理</span>
              <span className="arrow">→</span>
            </button>
          </div>

          {/* 最近編輯的心智圖列表 */}
          <div className="mindmap-list">
            {loading ? (
              <div className="loading-state">載入中...</div>
            ) : recentMindMaps.length > 0 ? (
              recentMindMaps.map((mm) => (
                <div
                  key={mm.id}
                  className="mindmap-card"
                  onClick={() => handleOpenMindMap(mm.id, mm.name)}
                >
                  <div className="mindmap-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7 13.5C6.17 13.5 5.5 12.83 5.5 12C5.5 11.17 6.17 10.5 7 10.5C7.83 10.5 8.5 11.17 8.5 12C8.5 12.83 7.83 13.5 7 13.5ZM12 7.5C12.83 7.5 13.5 8.17 13.5 9C13.5 9.83 12.83 10.5 12 10.5C11.17 10.5 10.5 9.83 10.5 9C10.5 8.17 11.17 7.5 12 7.5ZM12 16.5C11.17 16.5 10.5 15.83 10.5 15C10.5 14.17 11.17 13.5 12 13.5C12.83 13.5 13.5 14.17 13.5 15C13.5 15.83 12.83 16.5 12 16.5ZM17 13.5C16.17 13.5 15.5 12.83 15.5 12C15.5 11.17 16.17 10.5 17 10.5C17.83 10.5 18.5 11.17 18.5 12C18.5 12.83 17.83 13.5 17 13.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="mindmap-card-content">
                    <div className="mindmap-card-title">{mm.name}</div>
                    <div className="mindmap-card-time">
                      {formatLastOpened(mm.updatedAt)}
                    </div>
                    <div className="mindmap-card-meta">
                      <span className="node-count">{mm.nodeCount} 個節點</span>
                    </div>
                  </div>
                  <div className="mindmap-card-action">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>尚無心智圖</p>
                <button 
                  className="create-first-btn"
                  onClick={() => onNavigate('mindmap-manager')}
                >
                  建立第一個心智圖
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 樹狀圖區塊 */}
        <section className="tree-section">
          <div className="section-header">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM12 11L8 9L12 7L16 9L12 11Z" fill="currentColor"/>
              </svg>
              最近查看的樹狀圖
            </h2>
          </div>

          <div className="tree-list">
            {recentTrees.length > 0 ? (
              recentTrees.map((tree) => (
                <div
                  key={tree.id}
                  className="tree-card"
                  onClick={() => onNavigate(tree.path.replace('/', ''))}
                >
                  <div className="tree-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 11V3H15V6H9V3H2V11H9V8H11V18H15V21H22V13H15V16H13V8H15V11H22Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="tree-card-content">
                    <div className="tree-card-title">{tree.name}</div>
                    <div className="tree-card-time">
                      {formatRelativeTime(tree.visitedAt)}
                    </div>
                  </div>
                  <div className="tree-card-action">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>尚未查看任何樹狀圖</p>
                <button 
                  className="create-first-btn"
                  onClick={() => onNavigate('tree-ui-layout')}
                >
                  查看第一個樹狀圖
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 右側區域（預留） */}
      <aside className="sidebar-right">
        {/* 可以放置通知、快速操作等 */}
      </aside>
    </div>
  );
};

export default HomePage;
