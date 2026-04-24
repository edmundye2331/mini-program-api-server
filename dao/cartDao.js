/**
 * 购物车数据访问对象
 * 继承基础数据访问对象，封装购物车表操作
 */

const BaseDao = require('./baseDao');

class CartDao extends BaseDao {
  constructor() {
    super('carts');
  }

  /**
   * 根据用户ID查询购物车
   * @param {String} userId - 用户ID
   * @returns {Object} 购物车信息
   */
  async findByUserId(userId) {
    return await this.findOne({ user_id: userId });
  }

  /**
   * 根据用户ID删除购物车
   * @param {String} userId - 用户ID
   * @returns {Object} 删除结果
   */
  async deleteByUserId(userId) {
    return await this.delete({ user_id: userId });
  }
}

module.exports = new CartDao();
