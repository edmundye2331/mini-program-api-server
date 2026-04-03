/**
 * MySQL数据库连接和操作类
 * 使用连接池管理数据库连接
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * 数据库配置
 */
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'miniprogram_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+08:00', // 设置时区为中国时区
  charset: 'utf8mb4'
};

/**
 * 创建连接池
 */
const pool = mysql.createPool(dbConfig);

/**
 * 数据库操作类
 */
class Database {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * 执行查询
   * @param {string} sql - SQL语句
   * @param {Array} params - 参数数组
   * @returns {Promise<Array>} 查询结果
   */
  async query(sql, params = []) {
    const connection = await this.pool.getConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error('数据库查询错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 插入数据
   * @param {string} table - 表名
   * @param {Object} data - 数据对象
   * @returns {Promise<Object>} 插入结果
   */
  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

    try {
      const result = await this.query(sql, values);
      return {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('插入数据错误:', error);
      throw error;
    }
  }

  /**
   * 批量插入数据
   * @param {string} table - 表名
   * @param {Array} dataList - 数据数组
   * @returns {Promise<Object>} 插入结果
   */
  async batchInsert(table, dataList) {
    if (dataList.length === 0) {
      return { affectedRows: 0 };
    }

    const keys = Object.keys(dataList[0]);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const data of dataList) {
        const values = keys.map(key => data[key]);
        await connection.execute(sql, values);
      }

      await connection.commit();
      return { affectedRows: dataList.length };
    } catch (error) {
      await connection.rollback();
      console.error('批量插入错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 更新数据
   * @param {string} table - 表名
   * @param {Object} data - 更新的数据
   * @param {Object} where - WHERE条件
   * @returns {Promise<Object>} 更新结果
   */
  async update(table, data, where) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    const values = [...Object.values(data), ...Object.values(where)];

    try {
      const result = await this.query(sql, values);
      return {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      };
    } catch (error) {
      console.error('更新数据错误:', error);
      throw error;
    }
  }

  /**
   * 删除数据
   * @param {string} table - 表名
   * @param {Object} where - WHERE条件
   * @returns {Promise<Object>} 删除结果
   */
  async delete(table, where) {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

    const values = Object.values(where);

    try {
      const result = await this.query(sql, values);
      return {
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('删除数据错误:', error);
      throw error;
    }
  }

  /**
   * 查询单条数据
   * @param {string} table - 表名
   * @param {Object} where - WHERE条件
   * @param {Array} fields - 要查询的字段（默认查所有）
   * @returns {Promise<Object|null>} 查询结果
   */
  async findOne(table, where, fields = ['*']) {
    const fieldStr = Array.isArray(fields) ? fields.join(', ') : fields;
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const sql = `SELECT ${fieldStr} FROM ${table} WHERE ${whereClause} LIMIT 1`;

    const values = Object.values(where);

    try {
      const results = await this.query(sql, values);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('查询单条数据错误:', error);
      throw error;
    }
  }

  /**
   * 查询多条数据
   * @param {string} table - 表名
   * @param {Object} where - WHERE条件（可选）
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 查询结果
   */
  async findMany(table, where = {}, options = {}) {
    const {
      fields = ['*'],
      orderBy = null,
      order = 'ASC',
      limit = null,
      offset = 0
    } = options;

    const fieldStr = Array.isArray(fields) ? fields.join(', ') : fields;
    let sql = `SELECT ${fieldStr} FROM ${table}`;
    const values = [];

    if (Object.keys(where).length > 0) {
      const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(where));
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy} ${order}`;
    }

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      values.push(limit, offset);
    }

    try {
      return await this.query(sql, values);
    } catch (error) {
      console.error('查询多条数据错误:', error);
      throw error;
    }
  }

  /**
   * 查询数据总数
   * @param {string} table - 表名
   * @param {Object} where - WHERE条件（可选）
   * @returns {Promise<Number>} 总数
   */
  async count(table, where = {}) {
    let sql = `SELECT COUNT(*) as total FROM ${table}`;
    const values = [];

    if (Object.keys(where).length > 0) {
      const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(where));
    }

    try {
      const results = await this.query(sql, values);
      return results[0].total;
    } catch (error) {
      console.error('查询总数错误:', error);
      throw error;
    }
  }

  /**
   * 执行事务
   * @param {Function} callback - 事务回调函数
   * @returns {Promise<any>} 事务结果
   */
  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('事务执行错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 测试数据库连接
   * @returns {Promise<Boolean>} 连接是否成功
   */
  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ MySQL数据库连接成功');
      return true;
    } catch (error) {
      console.error('❌ MySQL数据库连接失败:', error.message);
      return false;
    }
  }

  /**
   * 关闭连接池
   */
  async close() {
    await this.pool.end();
    console.log('数据库连接池已关闭');
  }
}

// 创建单例实例
const db = new Database(pool);

/**
 * 导出数据库实例和配置
 */
module.exports = {
  db,
  pool,
  dbConfig
};
