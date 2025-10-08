/**
 * PostgreSQL 資料庫模組
 * 
 * 提供完整的資料庫操作功能
 */

// 配置
export { 
  DatabaseConfig, 
  loadDatabaseConfig, 
  validateDatabaseConfig,
  defaultDatabaseConfig 
} from '../config/database.config.js';

// 資料庫操作
export { 
  Database, 
  getDatabase, 
  resetDatabase 
} from './db.js';

// 型別定義
export type {
  QueryOptions,
  PaginatedResult,
  BaseEntity,
  DbOperationResult,
  WhereCondition,
  JoinCondition,
  QueryBuilderOptions,
} from './types.js';

// 範例
export * as examples from './examples.js';
