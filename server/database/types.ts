/**
 * 資料庫相關型別定義
 */

import { QueryResult, QueryResultRow } from 'pg';

/**
 * 資料庫查詢選項
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * 分頁結果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 通用資料表欄位
 */
export interface BaseEntity {
  id: number;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

/**
 * 資料庫操作結果
 */
export interface DbOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rowCount?: number;
}

/**
 * WHERE 條件建構器
 */
export interface WhereCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL';
  value?: any;
}

/**
 * JOIN 條件
 */
export interface JoinCondition {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  on: string;
}

/**
 * 查詢建構器選項
 */
export interface QueryBuilderOptions {
  select?: string[];
  from: string;
  where?: WhereCondition[];
  joins?: JoinCondition[];
  groupBy?: string[];
  having?: string;
  orderBy?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
  limit?: number;
  offset?: number;
}
