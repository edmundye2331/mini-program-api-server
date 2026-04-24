/**
 * 积分记录数据访问对象
 * 继承基础数据访问对象，封装积分记录表操作
 */

const BaseDao = require('./baseDao');

class PointsRecordDao extends BaseDao {
  constructor() {
    super('points_records');
  }

  /**
   * 根据用户ID查询积分记录
   * @param {String} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Array} 积分记录列表
   */
  async findByUserId(userId, options = {}) {
    const defaultOptions = {
      orderBy: 'created_at',
      order: 'DESC',
      limit: 50,
    };

    return await this.findMany(
      { user_id: userId },
      { ...defaultOptions, ...options }
    );
  }

  /**
   * 根据记录类型查询积分记录
   * @param {String} userId - 用户ID
   * @param {String} type - 记录类型
   * @param {Object} options - 查询选项
   * @returns {Array} 积分记录列表
   */
  async findByType(userId, type, options = {}) {
    const defaultOptions = {
      orderBy: 'created_at',
      order: 'DESC',
      limit: 50,
    };

    return await this.findMany(
      { user_id: userId, type },
      { ...defaultOptions, ...options }
    );
  }
}

module.exports = new PointsRecordDao();
