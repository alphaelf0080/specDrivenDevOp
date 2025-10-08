/**
 * SQL 生成器
 * 
 * 根據 table config 自動生成 SQL 語句
 */

import {
  TableDefinition,
  ColumnDefinition,
  IndexDefinition,
  ColumnType,
  tableConfigs,
  getTableConfig,
} from '../config/table.config.js';

/**
 * 生成欄位的 SQL 定義
 */
function generateColumnSQL(column: ColumnDefinition): string {
  let sql = `${column.name} `;

  // 資料型別
  if (column.type === ColumnType.VARCHAR && column.length) {
    sql += `VARCHAR(${column.length})`;
  } else if (column.type === ColumnType.CHAR && column.length) {
    sql += `CHAR(${column.length})`;
  } else if (column.type === ColumnType.DECIMAL && column.precision) {
    sql += column.scale
      ? `DECIMAL(${column.precision}, ${column.scale})`
      : `DECIMAL(${column.precision})`;
  } else {
    sql += column.type;
  }

  // 主鍵
  if (column.primaryKey) {
    sql += ' PRIMARY KEY';
  }

  // UNIQUE
  if (column.unique && !column.primaryKey) {
    sql += ' UNIQUE';
  }

  // NOT NULL
  if (column.notNull && !column.primaryKey) {
    sql += ' NOT NULL';
  }

  // DEFAULT
  if (column.default !== undefined) {
    if (typeof column.default === 'string') {
      // 如果是函數調用（如 CURRENT_TIMESTAMP），不加引號
      if (
        column.default.includes('(') ||
        column.default === 'CURRENT_TIMESTAMP' ||
        column.default === 'NOW()'
      ) {
        sql += ` DEFAULT ${column.default}`;
      } else {
        sql += ` DEFAULT ${column.default}`;
      }
    } else {
      sql += ` DEFAULT ${column.default}`;
    }
  }

  // 外鍵參考
  if (column.references) {
    sql += ` REFERENCES ${column.references.table}(${column.references.column})`;
    if (column.references.onDelete) {
      sql += ` ON DELETE ${column.references.onDelete}`;
    }
    if (column.references.onUpdate) {
      sql += ` ON UPDATE ${column.references.onUpdate}`;
    }
  }

  return sql;
}

/**
 * 生成 CREATE TABLE 語句
 */
export function generateCreateTableSQL(tableName: string): string {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const schema = table.schema || 'public';
  let sql = `-- 建立 ${table.comment || table.name} 資料表\n`;
  sql += `CREATE TABLE IF NOT EXISTS ${schema}.${table.name} (\n`;

  // 欄位定義
  const columnSQLs = table.columns.map(col => `    ${generateColumnSQL(col)}`);
  sql += columnSQLs.join(',\n');

  sql += '\n);\n';

  // 欄位註解
  const columnsWithComments = table.columns.filter(col => col.comment);
  if (columnsWithComments.length > 0) {
    sql += '\n';
    columnsWithComments.forEach(col => {
      sql += `COMMENT ON COLUMN ${schema}.${table.name}.${col.name} IS '${col.comment}';\n`;
    });
  }

  // 資料表註解
  if (table.comment) {
    sql += `COMMENT ON TABLE ${schema}.${table.name} IS '${table.comment}';\n`;
  }

  return sql;
}

/**
 * 生成索引的 CREATE INDEX 語句
 */
export function generateCreateIndexSQL(
  tableName: string,
  index: IndexDefinition
): string {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const schema = table.schema || 'public';
  let sql = `CREATE`;

  if (index.unique) {
    sql += ' UNIQUE';
  }

  sql += ` INDEX IF NOT EXISTS ${index.name} ON ${schema}.${table.name}`;

  if (index.type) {
    sql += ` USING ${index.type}`;
  }

  sql += ` (${index.columns.join(', ')})`;

  if (index.where) {
    sql += ` WHERE ${index.where}`;
  }

  sql += ';\n';

  return sql;
}

/**
 * 生成所有索引的 SQL
 */
export function generateAllIndexesSQL(tableName: string): string {
  const table = getTableConfig(tableName);
  if (!table || !table.indexes) {
    return '';
  }

  let sql = `-- 建立 ${table.name} 的索引\n`;
  table.indexes.forEach(index => {
    sql += generateCreateIndexSQL(tableName, index);
  });

  return sql;
}

/**
 * 生成完整的資料表建立 SQL（包含索引）
 */
export function generateFullTableSQL(tableName: string): string {
  let sql = generateCreateTableSQL(tableName);
  sql += '\n';
  sql += generateAllIndexesSQL(tableName);
  return sql;
}

/**
 * 生成所有資料表的建立 SQL
 */
export function generateAllTablesSQL(): string {
  const tableNames = Object.keys(tableConfigs);
  let sql = '-- PostgreSQL 資料庫結構自動生成\n';
  sql += '-- 生成時間: ' + new Date().toISOString() + '\n\n';
  sql += '-- 啟用 UUID 擴展\n';
  sql += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n';

  tableNames.forEach(tableName => {
    sql += generateFullTableSQL(tableName);
    sql += '\n';
  });

  return sql;
}

/**
 * 生成 SELECT 查詢語句
 */
export function generateSelectSQL(
  tableName: string,
  options?: {
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
    offset?: number;
  }
): { sql: string; params: any[] } {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const columns = options?.columns || table.columns.map(col => col.name);
  let sql = `SELECT ${columns.join(', ')} FROM ${table.name}`;

  const params: any[] = [];
  let paramIndex = 1;

  // WHERE 子句
  if (options?.where) {
    const whereClauses: string[] = [];
    Object.entries(options.where).forEach(([key, value]) => {
      if (value === null) {
        whereClauses.push(`${key} IS NULL`);
      } else {
        whereClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }
  }

  // ORDER BY
  if (options?.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }

  // LIMIT
  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`;
  }

  // OFFSET
  if (options?.offset) {
    sql += ` OFFSET ${options.offset}`;
  }

  return { sql, params };
}

/**
 * 生成 INSERT 語句
 */
export function generateInsertSQL(
  tableName: string,
  data: Record<string, any>,
  returning: boolean = true
): { sql: string; params: any[] } {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`);

  let sql = `INSERT INTO ${table.name} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`;

  if (returning) {
    sql += ' RETURNING *';
  }

  return { sql, params: values };
}

/**
 * 生成 UPDATE 語句
 */
export function generateUpdateSQL(
  tableName: string,
  data: Record<string, any>,
  where: Record<string, any>
): { sql: string; params: any[] } {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const setKeys = Object.keys(data);
  const setValues = Object.values(data);
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);

  const setClause = setKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const whereClause = whereKeys
    .map((key, i) => `${key} = $${i + 1 + setKeys.length}`)
    .join(' AND ');

  const sql = `UPDATE ${table.name} SET ${setClause} WHERE ${whereClause} RETURNING *`;
  const params = [...setValues, ...whereValues];

  return { sql, params };
}

/**
 * 生成 DELETE 語句
 */
export function generateDeleteSQL(
  tableName: string,
  where: Record<string, any>
): { sql: string; params: any[] } {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  const whereClause = whereKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

  const sql = `DELETE FROM ${table.name} WHERE ${whereClause}`;

  return { sql, params: whereValues };
}

/**
 * 生成 DROP TABLE 語句
 */
export function generateDropTableSQL(tableName: string, cascade: boolean = false): string {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const schema = table.schema || 'public';
  let sql = `DROP TABLE IF EXISTS ${schema}.${table.name}`;

  if (cascade) {
    sql += ' CASCADE';
  }

  sql += ';\n';

  return sql;
}

/**
 * 生成 ALTER TABLE 語句（新增欄位）
 */
export function generateAddColumnSQL(
  tableName: string,
  column: ColumnDefinition
): string {
  const table = getTableConfig(tableName);
  if (!table) {
    throw new Error(`找不到資料表配置: ${tableName}`);
  }

  const schema = table.schema || 'public';
  const columnSQL = generateColumnSQL(column);

  return `ALTER TABLE ${schema}.${table.name} ADD COLUMN IF NOT EXISTS ${columnSQL};\n`;
}

/**
 * 驗證資料是否符合資料表定義
 */
export function validateData(tableName: string, data: Record<string, any>): {
  valid: boolean;
  errors: string[];
} {
  const table = getTableConfig(tableName);
  if (!table) {
    return { valid: false, errors: [`找不到資料表配置: ${tableName}`] };
  }

  const errors: string[] = [];

  // 檢查必填欄位
  table.columns.forEach(col => {
    if (col.notNull && !col.default && !(col.name in data)) {
      errors.push(`缺少必填欄位: ${col.name}`);
    }
  });

  // 檢查欄位是否存在於定義中
  Object.keys(data).forEach(key => {
    const column = table.columns.find(col => col.name === key);
    if (!column) {
      errors.push(`未定義的欄位: ${key}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
