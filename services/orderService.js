/**
 * 订单服务层
 * 处理订单相关业务逻辑
 */

const orderDao = require('../dao/orderDao');
const orderItemDao = require('../dao/orderItemDao');
const { generateId, formatDate } = require('../config/mysql');

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @returns {Object} 订单信息
 */
const createOrder = async (orderData) => {
  // 订单类型前缀映射
  const orderTypeMap = {
    dian: 'DD',
    shang: 'SC',
    hui: 'HY',
    pin: 'PT',
    li: 'LP',
  };
  const prefix = orderTypeMap[orderData.orderType] || 'DD';
  const orderNo = prefix + Date.now();

  const order = {
    id: generateId(),
    order_no: orderNo,
    user_id: orderData.userId,
    order_type: orderData.orderType,
    total_amount: orderData.totalAmount,
    discount_amount: 0.0,
    actual_amount: orderData.totalAmount,
    status: 'pending',
    status_text: '待付款',
    remark: orderData.remark || '',
    created_at: formatDate(),
    updated_at: formatDate(),
  };

  await orderDao.insert(order);

  // 插入订单商品项
  for (const item of orderData.items) {
    await orderItemDao.insert({
      order_id: order.id,
      product_id: item.id || item.goodsId,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      created_at: formatDate(),
    });
  }

  return order;
};

/**
 * 获取用户订单列表
 * @param {String} userId - 用户ID
 * @param {String} [orderType] - 订单类型
 * @param {Number} [page=1] - 页码
 * @param {Number} [limit=20] - 每页数量
 * @returns {Object} 订单列表及分页信息
 */
const getOrderList = async (userId, orderType = null, page = 1, limit = 20) => {
  const where = { user_id: userId };
  if (orderType) {
    where.order_type = orderType;
  }

  const offset = (page - 1) * limit;
  const orders = await orderDao.findMany(where, {
    orderBy: 'created_at',
    order: 'DESC',
    limit: parseInt(limit),
    offset,
  });

  const total = await orderDao.count(where);

  // 获取每个订单的商品项
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await orderItemDao.findByOrderId(order.id);
      return {
        ...order,
        items,
      };
    })
  );

  return {
    list: ordersWithItems,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

/**
 * 获取订单详情
 * @param {String} orderId - 订单ID
 * @param {String} userId - 用户ID
 * @returns {Object} 订单详情
 */
const getOrderDetail = async (orderId, userId) => {
  const order = await orderDao.findById(orderId);
  if (!order || order.user_id !== userId) {
    return null;
  }

  const orderItems = await orderItemDao.findByOrderId(orderId);

  return {
    ...order,
    items: orderItems,
  };
};

/**
 * 通过订单号获取订单详情
 * @param {String} orderNo - 订单号
 * @param {String} userId - 用户ID
 * @returns {Object} 订单信息
 */
const getOrderByNo = async (orderNo, userId) => {
  const order = await orderDao.findByOrderNo(orderNo);
  if (!order || order.user_id !== userId) {
    return null;
  }

  const orderItems = await orderItemDao.findByOrderId(order.id);

  return {
    ...order,
    items: orderItems,
  };
};

/**
 * 取消订单
 * @param {String} orderId - 订单ID
 * @returns {Object} 取消后的订单信息
 */
const cancelOrder = async (orderId) => {
  const order = await orderDao.findById(orderId);
  if (!order || order.status !== 'pending') {
    return null;
  }

  await orderDao.updateStatus(orderId, 'cancelled', '已取消');

  return {
    ...order,
    status: 'cancelled',
    status_text: '已取消',
    updated_at: formatDate(),
  };
};

/**
 * 支付订单
 * @param {String} orderId - 订单ID
 * @param {String} paymentMethod - 支付方式
 * @returns {Object} 支付后的订单信息
 */
const payOrder = async (orderId, paymentMethod = 'wechat') => {
  const order = await orderDao.findById(orderId);
  if (!order || order.status !== 'pending') {
    return null;
  }

  await orderDao.updatePayment(orderId, paymentMethod, formatDate());

  return {
    ...order,
    status: 'paid',
    status_text: '待使用',
    payment_method: paymentMethod,
    paid_at: formatDate(),
    updated_at: formatDate(),
  };
};

/**
 * 根据订单号查询订单
 * @param {String} orderNo - 订单号
 * @returns {Object} 订单信息
 */
const findByOrderNo = async (orderNo) =>
  await orderDao.findOne({ order_no: orderNo });

/**
 * 更新订单支付状态
 * @param {String} orderId - 订单ID
 * @param {String} paymentMethod - 支付方式
 * @param {String} paidAt - 支付时间
 * @returns {Object} 更新结果
 */
const updatePayment = async (orderId, paymentMethod, paidAt) =>
  await orderDao.update(
    {
      status: 'paid',
      status_text: '待使用',
      payment_method: paymentMethod,
      paid_at: paidAt,
      updated_at: formatDate(),
    },
    { id: orderId }
  );

/**
 * 更新订单状态
 * @param {String} orderId - 订单ID
 * @param {String} status - 订单状态
 * @param {String} statusText - 状态文本
 * @returns {Object} 更新结果
 */
const updateStatus = async (orderId, status, statusText) =>
  await orderDao.updateStatus(orderId, status, statusText);

/**
 * 删除订单
 * @param {String} orderId - 订单ID
 * @param {String} userId - 用户ID
 * @returns {Object} 删除结果
 */
const deleteOrder = async (orderId, userId) => {
  const order = await orderDao.findById(orderId);

  // 验证订单是否存在且属于当前用户
  if (!order || order.user_id !== userId) {
    return { success: false, message: '订单不存在' };
  }

  // 验证订单状态，只有已完成、已取消、已退款的订单可以删除
  const deletableStatuses = ['completed', 'cancelled', 'refunded'];
  if (!deletableStatuses.includes(order.status)) {
    return { success: false, message: '当前订单状态不允许删除' };
  }

  // 先删除订单商品记录
  await orderItemDao.deleteByOrderId(orderId);

  // 删除订单记录
  await orderDao.deleteOrder(orderId);

  return { success: true, message: '订单已删除' };
};

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  getOrderByNo,
  cancelOrder,
  payOrder,
  findByOrderNo,
  updatePayment,
  updateStatus,
  deleteOrder,
};
