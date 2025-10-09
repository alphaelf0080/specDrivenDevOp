import React, { useEffect, useState } from 'react';
import ProjectMainWindow from '../components/Project/ProjectMainWindow';
import '../components/Project/ProjectMainWindow.css';

const ProjectPage: React.FC = () => {
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    // 從 URL 參數獲取專案 ID
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        setProjectId(numId);
      }
    }
  }, []);

  if (projectId === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h1>無效的專案 ID</h1>
        <button onClick={() => window.close()}>關閉視窗</button>
      </div>
    );
  }

  return (
    <ProjectMainWindow 
      projectId={projectId}
      onClose={() => window.close()}
    />
  );
};

export default ProjectPage;
