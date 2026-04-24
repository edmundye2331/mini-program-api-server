/**
 * 生日礼数据访问对象
 * 封装 birthday_gifts 表操作
 */

const BaseDao = require('./baseDao');

class BirthdayDao extends BaseDao {
  constructor() {
    super('birthday_gifts');
  }

  /**
   * 根据用户ID和年份查询生日礼
   * @param {String} userId - 用户ID
   * @param {Number} year - 年份
   * @returns {Object} 生日礼信息
   */
  async findByUserIdAndYear(userId, year) {
    return await this.findOne({
      user_id: userId,
      year,
    });
  }

  /**
   * 根据用户ID查询所有生日礼记录
   * @param {String} userId - 用户ID
   * @returns {Array} 生日礼记录列表
   */
  async findByUserId(userId) {
    return await this.findMany(
      {
        user_id: userId,
      },
      {
        orderBy: 'year',
        order: 'DESC',
      }
    );
  }

  /**
   * 插入生日礼记录
   * @param {Object} data - 生日礼数据
   * @returns {Object} 插入结果
   */
  async insert(data) {
    return await this.insert(data);
  }

  /**
   * 更新生日礼记录
   * @param {Object} data - 更新数据
   * @param {Object} where - 更新条件
   * @returns {Object} 更新结果
   */
  async update(data, where) {
    return await this.update(data, where);
  }

  /**
   * 删除生日礼记录
   * @param {Object} where - 删除条件
   * @returns {Object} 删除结果
   */
  async delete(where) {
    return await this.delete(where);
  }
}

module.exports = new BirthdayDao();
