/**
 * 資料庫初始化 Hook
 * 
 * 用於在首頁載入時自動檢查和初始化資料庫
 */

import { useState, useEffect } from 'react';

export interface Project {
  id: number;
  uuid: string;
  name: string;
  name_zh: string;
  name_en: string;
  game_type: string;
  description?: string;
  status: string;
  owner_id?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DbInitResponse {
  success: boolean;
  message?: string;
  data?: {
    projects: Project[];
    count: number;
  };
  error?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data?: Project[];
  count?: number;
  error?: string;
}

export interface UseDbInitResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  refetch: () => Promise<void>;
}

/**
 * 使用資料庫初始化 Hook
 * 
 * 自動在組件掛載時：
 * 1. 檢查 projects 資料表是否存在
 * 2. 如果不存在則自動建立
 * 3. 載入 projects 資料
 * 
 * @param autoInit - 是否自動初始化（預設 true）
 * @returns 初始化狀態和 projects 資料
 */
export function useDbInit(autoInit: boolean = true): UseDbInitResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const initDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗄️ 開始資料庫初始化...');

      // 呼叫資料庫初始化 API（確保資料表存在）
      const initResponse = await fetch('/api/db/init');
      const initData: DbInitResponse = await initResponse.json();

      if (!initData.success) {
        throw new Error(initData.error || '資料庫初始化失敗');
      }

      console.log('✅ 資料庫初始化成功');
      setInitialized(true);

      // 初始化成功後,載入最新編輯的專案
      await loadProjects();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      console.error('❌ 資料庫初始化失敗:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 載入 projects 資料...');

      // 首頁只載入最新編輯的 5 個專案
      const response = await fetch('/api/projects?limit=5&orderBy=updated_at DESC');
      const data: ProjectsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || '載入專案失敗');
      }

      console.log(`✅ 載入 ${data.count || 0} 個專案`);

      setProjects(data.data || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      console.error('❌ 載入專案失敗:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await loadProjects();
  };

  useEffect(() => {
    if (autoInit) {
      initDatabase();
    }
  }, [autoInit]);

  return {
    projects,
    loading,
    error,
    initialized,
    refetch,
  };
}

/**
 * 僅載入 projects 的簡化 Hook
 * 不執行初始化，只查詢現有資料
 */
export function useProjects(): UseDbInitResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects');
      const data: ProjectsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || '載入專案失敗');
      }

      setProjects(data.data || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    initialized: true,
    refetch: loadProjects,
  };
}
