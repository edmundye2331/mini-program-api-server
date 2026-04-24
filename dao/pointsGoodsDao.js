/**
 * 积分商品数据访问对象
 * 继承基础数据访问对象，封装积分商品表操作
 */

const BaseDao = require('./baseDao');

class PointsGoodsDao extends BaseDao {
  constructor() {
    super('points_goods');
  }

  /**
   * 查询所有活跃积分商品
   * @param {Object} options - 查询选项
   * @returns {Array} 积分商品列表
   */
  async findActive(options = {}) {
    return await this.findMany({ is_active: true }, options);
  }

  /**
   * 扣减商品库存
   * @param {String} goodsId - 商品ID
   * @param {Number} quantity - 扣减数量
   * @returns {Object} 更新结果
   */
  async reduceStock(goodsId, quantity) {
    // 使用直接SQL语句来更新库存，避免函数参数的问题
    const { query } = require('../config/mysql');
    const sql = `UPDATE points_goods SET stock = stock - ? WHERE id = ?`;
    const params = [quantity, goodsId];
    const results = await query(sql, params);
    return results;
  }

  /**
   * 获取库存大于0的商品
   * @param {Object} options - 查询选项
   * @returns {Array} 有库存的积分商品列表
   */
  async findInStock(options = {}) {
    return await this.findMany({ is_active: true, stock: { $gt: 0 } }, options);
  }
}

module.exports = new PointsGoodsDao();
