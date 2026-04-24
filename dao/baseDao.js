/**
 * 基础数据访问对象
 * 封装通用数据库操作
 */

const { db } = require('../config/mysql');

class BaseDao {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * 根据ID查询单条记录
   * @param {String} id - 记录ID
   * @returns {Object} 记录
   */
  async findById(id) {
    return await db.findOne(this.tableName, { id });
  }

  /**
   * 根据条件查询单条记录
   * @param {Object} where - 查询条件
   * @param {String} fields - 查询字段
   * @returns {Object} 记录
   */
  async findOne(where, fields = '*') {
    return await db.findOne(this.tableName, where, fields);
  }

  /**
   * 查询多条记录
   * @param {Object} where - 查询条件
   * @param {Object} options - 查询选项
   * @returns {Array} 记录列表
   */
  async findMany(where = {}, options = {}) {
    return await db.findMany(this.tableName, where, options);
  }

  /**
   * 插入记录
   * @param {Object} data - 插入数据
   * @returns {Object} 插入结果
   */
  async insert(data) {
    return await db.insert(this.tableName, data);
  }

  /**
   * 批量插入记录
   * @param {Array} dataArray - 数据数组
   * @returns {Object} 插入结果
   */
  async insertMany(dataArray) {
    return await db.insertMany(this.tableName, dataArray);
  }

  /**
   * 更新记录
   * @param {Object} data - 更新数据
   * @param {Object} where - 更新条件
   * @returns {Object} 更新结果
   */
  async update(data, where) {
    return await db.update(this.tableName, data, where);
  }

  /**
   * 删除记录
   * @param {Object} where - 删除条件
   * @returns {Object} 删除结果
   */
  async delete(where) {
    return await db.delete(this.tableName, where);
  }

  /**
   * 计数
   * @param {Object} where - 查询条件
   * @returns {Number} 记录数
   */
  async count(where = {}) {
    return await db.count(this.tableName, where);
  }
}

module.exports = BaseDao;
