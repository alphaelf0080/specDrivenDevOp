import { useState, useEffect } from 'react';
import MindMapDemo from './components/MindMap/MindMapDemo';
import SDDMindMap from './components/MindMap/SDDMindMap';
import MindMapManagerPage from './components/MindMap/MindMapManagerPage';
import HomePage from './components/Navigation/HomePage';
import './App.css';

type PageView = 'home' | 'mindmap-manager' | 'sdd-mindmap' | 'demo-mindmap' | 'slot-engine';

function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');

  // 檢查 URL 參數，自動開啟對應的頁面
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as PageView;
    if (view && ['mindmap-manager', 'sdd-mindmap', 'demo-mindmap', 'slot-engine'].includes(view)) {
      setCurrentPage(view);
    }
  }, []);

  // 導覽處理函數
  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageView);
    // 更新 URL 參數
    const url = new URL(window.location.href);
    url.searchParams.set('view', page);
    window.history.pushState({}, '', url);
  };

  // 返回首頁
  const handleBackToHome = () => {
    setCurrentPage('home');
    // 清除 URL 參數
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    window.history.pushState({}, '', url);
  };

  // 返回按鈕樣式
  const backButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 1000,
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
  };

  // 根據當前頁面渲染對應內容
  switch (currentPage) {
    case 'sdd-mindmap':
      return (
        <div style={{ position: 'relative' }}>
          <button onClick={handleBackToHome} style={backButtonStyle}>
            ← 返回首頁
          </button>
          <SDDMindMap />
        </div>
      );

    case 'demo-mindmap':
      return (
        <div style={{ position: 'relative' }}>
          <button onClick={handleBackToHome} style={backButtonStyle}>
            ← 返回首頁
          </button>
          <MindMapDemo />
        </div>
      );

    case 'mindmap-manager':
      // 檢查是否有指定的心智圖 ID
      const params = new URLSearchParams(window.location.search);
      const mindmapId = params.get('id');
      
      return (
        <div style={{ position: 'relative' }}>
          <button onClick={handleBackToHome} style={backButtonStyle}>
            ← 返回首頁
          </button>
          <MindMapManagerPage 
            onClose={handleBackToHome}
            initialMindMapId={mindmapId || undefined}
          />
        </div>
      );

    case 'slot-engine':
      return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={handleBackToHome} style={backButtonStyle}>
            ← 返回首頁
          </button>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>🎮 老虎機引擎</h1>
            <p style={{ fontSize: '1.2rem', color: '#718096', marginTop: '1rem' }}>功能開發中...</p>
          </div>
        </div>
      );

    case 'home':
    default:
      return <HomePage 
        onNavigate={handleNavigate}
        onOpenMindMap={(id, name) => {
          console.log('🎯 App: onOpenMindMap called with:', { id, name });
          // 設定 URL 參數並導覽到心智圖管理器
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'mindmap-manager');
          url.searchParams.set('id', id);
          console.log('🔗 App: Setting URL to:', url.toString());
          window.history.pushState({}, '', url);
          console.log('📄 App: Setting currentPage to mindmap-manager');
          setCurrentPage('mindmap-manager');
        }}
      />;
  }
}

export default App;
