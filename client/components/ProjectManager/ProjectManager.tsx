import { useState, useEffect } from 'react';
import './ProjectManager.css';

interface Project {
  id: number;
  name: string;
  name_zh: string;
  name_en: string;
  game_type: string;
  description: string | null;
  status: string;
  owner_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ProjectFormData {
  name: string;
  name_zh: string;
  name_en: string;
  game_type: string;
  description: string;
  status: string;
}

type SortField = 'name' | 'created_at' | 'updated_at' | 'status' | 'game_type';
type SortOrder = 'asc' | 'desc';

interface ProjectManagerProps {
  onClose: () => void;
}

export default function ProjectManager({ onClose }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 排序狀態
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // 編輯/新建狀態
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    name_zh: '',
    name_en: '',
    game_type: '',
    description: '',
    status: 'active',
  });

  // 刪除確認
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // 載入專案列表
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      // 使用 /api/projects 獲取所有專案（無限制）
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('載入專案失敗');
      const data = await response.json();
      setProjects(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // 排序專案
  const sortedProjects = [...projects].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // 處理日期
    if (sortField === 'created_at' || sortField === 'updated_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // 處理字串
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 切換排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 開啟新建表單
  const handleCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      name_zh: '',
      name_en: '',
      game_type: '',
      description: '',
      status: 'active',
    });
    setShowForm(true);
  };

  // 開啟編輯表單
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      name_zh: project.name_zh,
      name_en: project.name_en,
      game_type: project.game_type,
      description: project.description || '',
      status: project.status,
    });
    setShowForm(true);
  };

  // 儲存專案
  const handleSave = async () => {
    try {
      const url = editingProject
        ? `/api/projects/${editingProject.id}`
        : '/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('儲存失敗');

      setShowForm(false);
      await loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : '儲存失敗');
    }
  };

  // 刪除專案
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('刪除失敗');

      setDeleteConfirm(null);
      await loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : '刪除失敗');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="project-manager-overlay">
      <div className="project-manager">
        {/* 標題列 */}
        <div className="pm-header">
          <h1>📊 專案管理視窗</h1>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 工具列 */}
        <div className="pm-toolbar">
          <button className="create-btn" onClick={handleCreate}>
            ➕ 新建專案
          </button>
          
          <div className="sort-controls">
            <label>排序：</label>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
            >
              <option value="name">名稱</option>
              <option value="created_at">建立時間</option>
              <option value="updated_at">更新時間</option>
              <option value="status">狀態</option>
              <option value="game_type">遊戲類型</option>
            </select>
            
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? '升序' : '降序'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="project-count">
            共 {projects.length} 個專案
          </div>
        </div>

        {/* 內容區 */}
        <div className="pm-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>載入中...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">❌</div>
              <p>{error}</p>
              <button onClick={loadProjects}>重試</button>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>尚無專案</p>
              <p className="empty-hint">點擊「新建專案」開始建立</p>
            </div>
          ) : (
            <div className="project-table-container">
              <table className="project-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>
                      名稱 {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('game_type')}>
                      遊戲類型 {sortField === 'game_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('status')}>
                      狀態 {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('created_at')}>
                      建立時間 {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('updated_at')}>
                      更新時間 {sortField === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div className="project-name">
                          <div className="name-main">{project.name}</div>
                          <div className="name-sub">
                            {project.name_zh} / {project.name_en}
                          </div>
                        </div>
                      </td>
                      <td>{project.game_type}</td>
                      <td>
                        <span className={`status-badge status-${project.status}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(project.created_at)}</td>
                      <td className="date-cell">{formatDate(project.updated_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(project)}
                            title="編輯"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => setDeleteConfirm(project.id)}
                            title="刪除"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 編輯/新建表單 */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="form-header">
                <h2>{editingProject ? '編輯專案' : '新建專案'}</h2>
                <button className="close-btn" onClick={() => setShowForm(false)}>
                  ✕
                </button>
              </div>

              <div className="form-content">
                <div className="form-group">
                  <label>專案名稱 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="輸入專案名稱"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>中文名稱 *</label>
                    <input
                      type="text"
                      value={formData.name_zh}
                      onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                      placeholder="輸入中文名稱"
                    />
                  </div>

                  <div className="form-group">
                    <label>英文名稱 *</label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      placeholder="Enter English name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>遊戲類型 *</label>
                    <input
                      type="text"
                      value={formData.game_type}
                      onChange={(e) => setFormData({ ...formData, game_type: e.target.value })}
                      placeholder="例如：Slot, Card, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>狀態</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>專案描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="輸入專案描述"
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button className="cancel-btn" onClick={() => setShowForm(false)}>
                  取消
                </button>
                <button className="save-btn" onClick={handleSave}>
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 刪除確認對話框 */}
        {deleteConfirm !== null && (
          <div className="form-overlay">
            <div className="confirm-modal">
              <div className="confirm-icon">⚠️</div>
              <h2>確認刪除</h2>
              <p>確定要刪除此專案嗎？此操作無法復原。</p>
              <div className="confirm-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => setDeleteConfirm(null)}
                >
                  取消
                </button>
                <button
                  className="delete-confirm-btn"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
