/**
 * MySQL数据库配置和连接管理
 * 用于替代内存数据库，提供持久化存储
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'miniprogram_db',
  charset: 'utf8mb4',
  timezone: '+08:00',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};

// 创建连接池
let pool = null;

/**
 * 初始化MySQL连接池
 */
const initPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL连接池已创建');
  }
  return pool;
};

/**
 * 获取连接池
 */
const getPool = () => {
  if (!pool) {
    initPool();
  }
  return pool;
};

/**
 * 格式化日期为MySQL格式
 */
const formatDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 生成UUID
 */
const generateId = () => {
  return require('crypto').randomBytes(16).toString('hex');
};

/**
 * 生成订单号
 */
const generateOrderNo = (prefix = 'DD') => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

/**
 * 执行查询
 * @param {String} sql - SQL语句
 * @param {Array} params - 参数数组
 * @returns {Promise} 查询结果
 */
const query = async (sql, params = []) => {
  try {
    const currentPool = getPool();
    const [results] = await currentPool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    console.error('SQL:', sql);
    console.error('参数:', params);
    throw error;
  }
};

/**
 * 执行事务
 * @param {Function} callback - 事务回调函数
 * @returns {Promise} 事务结果
 */
const transaction = async (callback) => {
  const currentPool = getPool();
  const connection = await currentPool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * 数据库操作辅助类
 */
class Database {
  /**
   * 查询单条记录
   * @param {String} table - 表名
   * @param {Object} where - WHERE条件
   * @param {String} fields - 查询字段，默认*
   */
  async findOne(table, where, fields = '*') {
    const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(where);
    const sql = `SELECT ${fields} FROM ${table} WHERE ${conditions} LIMIT 1`;

    const results = await query(sql, values);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 查询多条记录
   * @param {String} table - 表名
   * @param {Object} where - WHERE条件
   * @param {Object} options - 查询选项
   */
  async findMany(table, where = {}, options = {}) {
    const {
      fields = '*',
      orderBy = 'created_at',
      order = 'DESC',
      limit = 100,
      offset = 0
    } = options;

    let sql = `SELECT ${fields} FROM ${table}`;
    const values = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${conditions}`;
      values.push(...Object.values(where));
    }

    sql += ` ORDER BY ${orderBy} ${order}`;
    sql += ` LIMIT ? OFFSET ?`;
    values.push(parseInt(limit), parseInt(offset));

    return await query(sql, values);
  }

  /**
   * 插入记录
   * @param {String} table - 表名
   * @param {Object} data - 数据对象
   * @returns {Promise} 插入结果
   */
  async insert(table, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

    const results = await query(sql, values);
    return {
      insertId: results.insertId,
      affectedRows: results.affectedRows
    };
  }

  /**
   * 批量插入记录
   * @param {String} table - 表名
   * @param {Array} dataArray - 数据数组
   * @returns {Promise} 插入结果
   */
  async insertMany(table, dataArray) {
    if (dataArray.length === 0) {
      return { affectedRows: 0 };
    }

    const fields = Object.keys(dataArray[0]);
    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

    const currentPool = getPool();
    const connection = await currentPool.getConnection();

    try {
      await connection.beginTransaction();

      for (const data of dataArray) {
        const values = Object.values(data);
        await connection.execute(sql, values);
      }

      await connection.commit();
      return { affectedRows: dataArray.length };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 更新记录
   * @param {String} table - 表名
   * @param {Object} data - 更新数据
   * @param {Object} where - WHERE条件
   * @returns {Promise} 更新结果
   */
  async update(table, data, where) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];

    const sql = `UPDATE ${table} SET ${fields} WHERE ${conditions}`;

    const results = await query(sql, values);
    return {
      affectedRows: results.affectedRows,
      changedRows: results.changedRows
    };
  }

  /**
   * 删除记录
   * @param {String} table - 表名
   * @param {Object} where - WHERE条件
   * @returns {Promise} 删除结果
   */
  async delete(table, where) {
    const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(where);

    const sql = `DELETE FROM ${table} WHERE ${conditions}`;

    const results = await query(sql, values);
    return {
      affectedRows: results.affectedRows
    };
  }

  /**
   * 计数
   * @param {String} table - 表名
   * @param {Object} where - WHERE条件
   * @returns {Promise} 记录数
   */
  async count(table, where = {}) {
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    const values = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${conditions}`;
      values.push(...Object.values(where));
    }

    const results = await query(sql, values);
    return results[0].count;
  }

  /**
   * 检查记录是否存在
   * @param {String} table - 表名
   * @param {Object} where - WHERE条件
   * @returns {Promise} 是否存在
   */
  async exists(table, where) {
    const count = await this.count(table, where);
    return count > 0;
  }

  /**
   * 分页查询
   * @param {String} table - 表名
   * @param {Object} options - 查询选项
   * @returns {Promise} 分页结果
   */
  async paginate(table, options = {}) {
    const {
      where = {},
      fields = '*',
      orderBy = 'created_at',
      order = 'DESC',
      page = 1,
      pageSize = 10
    } = options;

    const total = await this.count(table, where);
    const offset = (page - 1) * pageSize;

    const data = await this.findMany(table, where, {
      fields,
      orderBy,
      order,
      limit: pageSize,
      offset
    });

    return {
      data,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    };
  }
}

// 创建数据库实例
const mysqlDb = new Database();

/**
 * 测试数据库连接
 */
const testConnection = async () => {
  try {
    const currentPool = getPool();
    const connection = await currentPool.getConnection();
    await connection.ping();
    console.log('✅ MySQL数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL数据库连接失败:', error.message);
    console.error('请检查：');
    console.error('1. MySQL是否已安装和启动');
    console.error('2. 数据库配置是否正确');
    console.error('3. 数据库是否已创建');
    return false;
  }
};

/**
 * 关闭连接池
 */
const closePool = async () => {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('MySQL连接池已关闭');
    } catch (error) {
      console.error('关闭连接池时出错:', error);
    }
  }
};

module.exports = {
  pool: getPool,
  query,
  transaction,
  db: mysqlDb,
  formatDate,
  generateId,
  generateOrderNo,
  testConnection,
  closePool,
  dbConfig,
  initPool,
  getPool
};
