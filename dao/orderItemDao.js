/**
 * 订单商品项数据访问对象
 * 继承基础数据访问对象，封装订单商品项表操作
 */

const BaseDao = require('./baseDao');

class OrderItemDao extends BaseDao {
  constructor() {
    super('order_items');
  }

  /**
   * 根据订单ID查询订单商品项
   * @param {String} orderId - 订单ID
   * @returns {Array} 订单商品项列表
   */
  async findByOrderId(orderId) {
    return await this.findMany({ order_id: orderId });
  }

  /**
   * 批量插入订单商品项
   * @param {Array} items - 订单商品项数组
   * @returns {Object} 插入结果
   */
  async insertMany(items) {
    return await this.insertMany(items);
  }

  /**
   * 根据订单ID删除订单商品项
   * @param {String} orderId - 订单ID
   * @returns {Object} 删除结果
   */
  async deleteByOrderId(orderId) {
    return await this.delete({ order_id: orderId });
  }
}

module.exports = new OrderItemDao();
