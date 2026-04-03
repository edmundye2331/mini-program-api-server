/**
 * 订单控制器
 */

const { database, generateId, formatDate } = require('../config/database');

/**
 * 创建订单
 */
const createOrder = (req, res) => {
  try {
    const { userId, orderType, items, totalAmount, remark } = req.body;

    if (!userId || !orderType || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '订单商品不能为空'
      });
    }

    // 生成订单号
    const orderTypeMap = {
      'dian': 'DD',
      'shang': 'SC',
      'hui': 'HY',
      'pin': 'PT',
      'li': 'LP'
    };
    const prefix = orderTypeMap[orderType] || 'DD';
    const orderNo = prefix + Date.now();

    // 创建订单
    const order = {
      id: generateId(),
      orderNo: orderNo,
      userId: userId,
      orderType: orderType,
      items: items,
      totalAmount: totalAmount,
      status: 'pending',
      statusText: '待付款',
      remark: remark || '',
      createdAt: formatDate(),
      updatedAt: formatDate()
    };

    database.orders.set(order.id, order);

    res.json({
      success: true,
      message: '订单创建成功',
      data: order
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败'
    });
  }
};

/**
 * 获取订单列表
 */
const getOrderList = (req, res) => {
  try {
    const { userId, orderType, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 过滤用户的订单
    let orders = Array.from(database.orders.values()).filter(o => o.userId === userId);

    // 按订单类型过滤
    if (orderType) {
      orders = orders.filter(o => o.orderType === orderType);
    }

    // 按创建时间倒序排序
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        list: paginatedOrders,
        total: orders.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
};

/**
 * 获取订单详情
 */
const getOrderDetail = (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '缺少订单ID'
      });
    }

    const order = database.orders.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
};

/**
 * 取消订单
 */
const cancelOrder = (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '缺少订单ID'
      });
    }

    const order = database.orders.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '该订单状态不允许取消'
      });
    }

    // 更新订单状态
    order.status = 'cancelled';
    order.statusText = '已取消';
    order.updatedAt = formatDate();
    database.orders.set(orderId, order);

    res.json({
      success: true,
      message: '订单已取消',
      data: order
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      success: false,
      message: '取消订单失败'
    });
  }
};

/**
 * 支付订单
 */
const payOrder = (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod = 'wechat' } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '缺少订单ID'
      });
    }

    const order = database.orders.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '订单状态不允许支付'
      });
    }

    // 更新订单状态为待使用
    order.status = 'paid';
    order.statusText = '待使用';
    order.paymentMethod = paymentMethod;
    order.paidAt = formatDate();
    order.updatedAt = formatDate();

    database.orders.set(orderId, order);

    console.log(`订单支付成功: ${orderId}, 支付方式: ${paymentMethod}`);

    res.json({
      success: true,
      message: '订单支付成功',
      data: order
    });
  } catch (error) {
    console.error('支付订单错误:', error);
    res.status(500).json({
      success: false,
      message: '支付订单失败'
    });
  }
};

/**
 * 更新订单状态
 */
const updateOrderStatus = (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const order = database.orders.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 状态映射
    const statusMap = {
      'paid': '待使用',
      'using': '使用中',
      'completed': '已完成',
      'cancelled': '已取消',
      'refunded': '已退款'
    };

    if (!statusMap[status]) {
      return res.status(400).json({
        success: false,
        message: '无效的订单状态'
      });
    }

    // 更新状态
    order.status = status;
    order.statusText = statusMap[status];
    order.updatedAt = formatDate();

    database.orders.set(orderId, order);

    res.json({
      success: true,
      message: '订单状态更新成功',
      data: order
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新订单状态失败'
    });
  }
};

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  cancelOrder,
  payOrder,
  updateOrderStatus
};
