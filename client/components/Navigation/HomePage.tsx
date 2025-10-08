import React, { useEffect, useState } from 'react';
import { getTreeHistory, formatRelativeTime, TreeHistoryItem } from '../../utils/treeHistory';
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
          <span className="nav-icon">🏠</span>
          <span className="nav-label">首頁</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">📊</span>
          <span className="nav-label">專案</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-demo')}>
          <span className="nav-icon">🌿</span>
          <span className="nav-label">樹枝圖</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-ui-layout')}>
          <span className="nav-icon">🗂️</span>
          <span className="nav-label">UI 樹枝圖</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-ui-layout-rich')}>
          <span className="nav-icon">🧾</span>
          <span className="nav-label">UI 樹枝圖(完整資訊)</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate('tree-psd-structure')}>
          <span className="nav-icon">🧩</span>
          <span className="nav-label">PSD 全結構樹</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">設定</span>
        </div>
      </aside>

      {/* 中間主要內容區 */}
      <main className="main-content">
        <header className="page-header">
          <h1>📋 規格驅動開發平台</h1>
          <p className="subtitle">Specification-Driven Development Platform</p>
        </header>

        {/* 心智圖區塊 */}
        <section className="mindmap-section">
          <div className="section-header">
            <h2>🧠 心智圖</h2>
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
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8ZM6 8C7.1 8 8 8.9 8 10C8 11.1 7.1 12 6 12C4.9 12 4 11.1 4 10C4 8.9 4.9 8 6 8ZM18 8C19.1 8 20 8.9 20 10C20 11.1 19.1 12 18 12C16.9 12 16 11.1 16 10C16 8.9 16.9 8 18 8ZM12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14ZM6 14C7.1 14 8 14.9 8 16C8 17.1 7.1 18 6 18C4.9 18 4 17.1 4 16C4 14.9 4.9 14 6 14ZM18 14C19.1 14 20 14.9 20 16C20 17.1 19.1 18 18 18C16.9 18 16 17.1 16 16C16 14.9 16.9 14 18 14ZM3 20C4.1 20 5 20.9 5 22H19C19 20.9 19.9 20 21 20V8H19V6H21V4C19.9 4 19 3.1 19 2H5C5 3.1 4.1 4 3 4V6H5V8H3V20Z" fill="url(#mindmap-gradient)"/>
                      <defs>
                        <linearGradient id="mindmap-gradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#667eea"/>
                          <stop offset="100%" stopColor="#764ba2"/>
                        </linearGradient>
                      </defs>
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
            <h2>🌳 最近查看的樹狀圖</h2>
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
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#tree-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="url(#tree-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="url(#tree-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="tree-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#22c55e"/>
                          <stop offset="100%" stopColor="#15803d"/>
                        </linearGradient>
                      </defs>
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
