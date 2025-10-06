/**
 * 心智圖元數據類型定義
 */

export interface MindMapMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  thumbnail?: string;
}

export interface MindMapListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
}

export interface CreateMindMapRequest {
  name: string;
  description?: string;
  template?: 'blank' | 'basic' | 'sdd';
}

export interface UpdateMindMapRequest {
  name?: string;
  description?: string;
}
