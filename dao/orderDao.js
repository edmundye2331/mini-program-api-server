/**
 * 订单数据访问对象
 * 继承基础数据访问对象，封装订单表操作
 */

const BaseDao = require('./baseDao');

class OrderDao extends BaseDao {
  constructor() {
    super('orders');
  }

  /**
   * 根据用户ID查询订单列表
   * @param {String} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Array} 订单列表
   */
  async findByUserId(userId, options = {}) {
    return await this.findMany({ user_id: userId }, options);
  }

  /**
   * 根据订单号查询订单
   * @param {String} orderNo - 订单号
   * @returns {Object} 订单信息
   */
  async findByOrderNo(orderNo) {
    return await this.findOne({ order_no: orderNo });
  }

  /**
   * 根据订单类型查询订单
   * @param {String} userId - 用户ID
   * @param {String} orderType - 订单类型
   * @param {Object} options - 查询选项
   * @returns {Array} 订单列表
   */
  async findByType(userId, orderType, options = {}) {
    return await this.findMany(
      { user_id: userId, order_type: orderType },
      options
    );
  }

  /**
   * 更新订单状态
   * @param {String} orderId - 订单ID
   * @param {String} status - 订单状态
   * @param {String} statusText - 状态文本
   * @returns {Object} 更新结果
   */
  async updateStatus(orderId, status, statusText) {
    return await this.update(
      { status, status_text: statusText, updated_at: new Date() },
      { id: orderId }
    );
  }

  /**
   * 更新订单支付信息
   * @param {String} orderId - 订单ID
   * @param {String} paymentMethod - 支付方式
   * @param {Date} paidAt - 支付时间
   * @returns {Object} 更新结果
   */
  async updatePayment(orderId, paymentMethod, paidAt) {
    const updateData = {
      payment_method: paymentMethod,
      status: 'paid',
      status_text: '已支付',
      updated_at: new Date(),
    };

    if (paidAt) {
      updateData.paid_at = paidAt;
    }

    return await this.update(updateData, { id: orderId });
  }

  /**
   * 删除订单（硬删除）
   * @param {String} orderId - 订单ID
   * @returns {Object} 删除结果
   */
  async deleteOrder(orderId) {
    return await this.delete({ id: orderId });
  }
}

module.exports = new OrderDao();
