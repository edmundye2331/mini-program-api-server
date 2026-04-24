/**
 * 会员数据访问对象
 * 继承基础数据访问对象，封装会员表操作
 */

const BaseDao = require('./baseDao');

class MemberDao extends BaseDao {
  constructor() {
    super('members');
  }

  /**
   * 根据用户ID查询会员
   * @param {String} userId - 用户ID
   * @returns {Object} 会员信息
   */
  async findByUserId(userId) {
    return await this.findOne({ user_id: userId });
  }

  /**
   * 更新用户余额
   * @param {String} userId - 用户ID
   * @param {String} balance - 新余额
   * @returns {Object} 更新结果
   */
  async updateBalance(userId, balance) {
    return await this.update({ balance }, { user_id: userId });
  }

  /**
   * 更新用户积分
   * @param {String} userId - 用户ID
   * @param {Number} points - 新积分
   * @returns {Object} 更新结果
   */
  async updatePoints(userId, points) {
    return await this.update({ points }, { user_id: userId });
  }

  /**
   * 更新用户优惠券数量
   * @param {String} userId - 用户ID
   * @param {Number} coupons - 新优惠券数量
   * @returns {Object} 更新结果
   */
  async updateCoupons(userId, coupons) {
    return await this.update({ coupons }, { user_id: userId });
  }
}

module.exports = new MemberDao();
