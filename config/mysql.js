/**
 * MySQL数据库配置和连接管理
 * 用于替代内存数据库，提供持久化存储
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'miniprogram_db',
  charset: 'utf8mb4',
  timezone: '+08:00',
  connectionLimit: parseInt(process.env.DB_POOL_SIZE || '20', 10),
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000', 10),
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// 创建连接池
let pool = null;

/**
 * 初始化MySQL连接池
 */
const initPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL连接池已创建，最大连接数:', dbConfig.connectionLimit);

    // 监听连接池事件
    pool.on('connection', (connection) => {
      // 生产环境移除console.log
      if (process.env.NODE_ENV === 'production') {
        console.log('✅ 新的数据库连接已建立');
      }
    });

    pool.on('acquire', (connection) => {
      // 生产环境移除console.log
      if (process.env.NODE_ENV === 'production') {
        console.log('🔌 从连接池获取连接');
      }
    });

    pool.on('release', (connection) => {
      // 生产环境移除console.log
      if (process.env.NODE_ENV === 'production') {
        console.log('🔌 连接已释放回连接池');
      }
    });

    pool.on('error', (err) => {
      console.error('❌ 数据库连接池错误:', err);
    });
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
 * 驼峰式转蛇形命名
 */
const camelToSnake = (str) =>
  str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');

/**
 * 将对象的驼峰式键名转换为蛇形键名
 */
const convertKeysToSnakeCase = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) =>
      // 特殊处理嵌套对象？不，目前只处理一级对象
      [camelToSnake(key), value]
    )
  );

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
const generateId = () => crypto.randomBytes(16).toString('hex');

/**
 * 生成订单号
 */
const generateOrderNo = (prefix = 'DD') => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
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
    // 确保参数都是正确的类型
    const processedParams = params.map((param) => {
      // 只有纯数字字符串才会被转换为数字类型，避免将UUID等包含字母的字符串错误转换
      if (typeof param === 'string' && /^-?\d+(\.\d+)?$/.test(param.trim())) {
        const num = parseFloat(param);
        return Number.isInteger(num) ? parseInt(param, 10) : num;
      }
      return param;
    });
    const [results] = await currentPool.execute(sql, processedParams);
    return results;
  } catch (error) {
    // 生产环境移除console.error
    if (process.env.NODE_ENV !== 'production') {
      console.error('数据库查询错误:', error);
      console.error('SQL:', sql);
      console.error('参数:', params);
    }
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
    const snakeCaseWhere = convertKeysToSnakeCase(where);
    const conditions = Object.keys(snakeCaseWhere)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const values = Object.values(snakeCaseWhere);
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
      offset = 0,
    } = options;

    const intLimit = Number.isInteger(limit) ? limit : parseInt(limit, 10);
    const intOffset = Number.isInteger(offset) ? offset : parseInt(offset, 10);

    // 转换orderBy为蛇形命名
    const snakeCaseOrderBy = camelToSnake(orderBy);

    let sql = `SELECT ${fields} FROM ${table}`;
    const values = [];

    if (Object.keys(where).length > 0) {
      const snakeCaseWhere = convertKeysToSnakeCase(where);
      const conditions = Object.keys(snakeCaseWhere)
        .map((key) => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${conditions}`;
      values.push(...Object.values(snakeCaseWhere));
    }

    sql += ` ORDER BY ${snakeCaseOrderBy} ${order}`;
    sql += ` LIMIT ${intLimit} OFFSET ${intOffset}`;

    return query(sql, values);
  }

  /**
   * 插入记录
   * @param {String} table - 表名
   * @param {Object} data - 数据对象
   * @returns {Promise} 插入结果
   */
  async insert(table, data) {
    const snakeCaseData = convertKeysToSnakeCase(data);
    const fields = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    const placeholders = fields.map(() => '?').join(', ');

    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

    const results = await query(sql, values);
    return {
      insertId: results.insertId,
      affectedRows: results.affectedRows,
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

      // 使用Promise.all批量处理插入操作
      await Promise.all(
        dataArray.map(async (data) => {
          const values = Object.values(data);
          await connection.execute(sql, values);
        })
      );

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
    const snakeCaseData = convertKeysToSnakeCase(data);
    const snakeCaseWhere = convertKeysToSnakeCase(where);

    const fields = Object.keys(snakeCaseData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const conditions = Object.keys(snakeCaseWhere)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const values = [
      ...Object.values(snakeCaseData),
      ...Object.values(snakeCaseWhere),
    ];

    const sql = `UPDATE ${table} SET ${fields} WHERE ${conditions}`;

    const results = await query(sql, values);
    return {
      affectedRows: results.affectedRows,
      changedRows: results.changedRows,
    };
  }

  /**
   * 删除记录
   * @param {String} table - 表名
   * @param {Object} where - WHERE条件
   * @returns {Promise} 删除结果
   */
  async delete(table, where) {
    const snakeCaseWhere = convertKeysToSnakeCase(where);
    const conditions = Object.keys(snakeCaseWhere)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const values = Object.values(snakeCaseWhere);

    const sql = `DELETE FROM ${table} WHERE ${conditions}`;

    const results = await query(sql, values);
    return {
      affectedRows: results.affectedRows,
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
      const snakeCaseWhere = convertKeysToSnakeCase(where);
      const conditions = Object.keys(snakeCaseWhere)
        .map((key) => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${conditions}`;
      values.push(...Object.values(snakeCaseWhere));
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
      pageSize = 10,
    } = options;

    const total = await this.count(table, where);
    const offset = (page - 1) * pageSize;

    const data = await this.findMany(table, where, {
      fields,
      orderBy,
      order,
      limit: pageSize,
      offset,
    });

    return {
      data,
      total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      totalPages: Math.ceil(total / pageSize),
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ MySQL数据库连接成功');
    }
    connection.release();
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ MySQL数据库连接失败:', error.message);
      console.error('请检查：');
      console.error('1. MySQL是否已安装和启动');
      console.error('2. 数据库配置是否正确');
      console.error('3. 数据库是否已创建');
    }
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
      if (process.env.NODE_ENV !== 'production') {
        console.log('MySQL连接池已关闭');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('关闭连接池时出错:', error);
      }
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
  getPool,
};
