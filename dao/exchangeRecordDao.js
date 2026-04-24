/**
 * 兑换记录数据访问对象
 * 继承基础数据访问对象，封装兑换记录表操作
 */

const BaseDao = require('./baseDao');

class ExchangeRecordDao extends BaseDao {
  constructor() {
    super('exchange_records');
  }

  /**
   * 根据用户ID查询兑换记录
   * @param {String} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Array} 兑换记录列表
   */
  async findByUserId(userId, options = {}) {
    return await this.findMany({ user_id: userId }, options);
  }

  /**
   * 根据用户ID和商品ID查询兑换记录
   * @param {String} userId - 用户ID
   * @param {String} goodsId - 商品ID
   * @param {Object} options - 查询选项
   * @returns {Array} 兑换记录列表
   */
  async findByUserIdAndGoodsId(userId, goodsId, options = {}) {
    return await this.findMany({ user_id: userId, goods_id: goodsId }, options);
  }
}

module.exports = new ExchangeRecordDao();
