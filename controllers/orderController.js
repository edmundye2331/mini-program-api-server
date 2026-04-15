/**
 * 订单控制器
 */

const { db, generateId, formatDate } = require('../config/mysql');

/**
 * 创建订单
 */
const createOrder = async (req, res) => {
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
      order_no: orderNo,
      user_id: userId,
      order_type: orderType,
      total_amount: totalAmount,
      discount_amount: 0.00,
      actual_amount: totalAmount, // 实际支付金额，默认等于总金额
      status: 'pending',
      status_text: '待付款',
      remark: remark || '',
      created_at: formatDate(),
      updated_at: formatDate()
    };

    await db.insert('orders', order);

    // 插入订单商品项
    for (const item of items) {
      await db.insert('order_items', {
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        created_at: formatDate()
      });
    }

    res.success(order, '订单创建成功');
  } catch (error) {
    console.error('创建订单错误:', error);
    res.error('创建订单失败', 500, error);
  }
};

/**
 * 蛇形命名转驼峰命名
 */
const snakeToCamel = (str) => {
  return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
};

/**
 * 将对象的蛇形键名转换为驼峰键名
 */
const convertKeysToCamelCase = (obj) => {
  // 处理Date对象，直接返回
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  // 处理null或undefined
  if (obj === null || typeof obj !== 'object') return obj;
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  // 处理普通对象
  const result = {};
  for (let key in obj) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = convertKeysToCamelCase(obj[key]);
  }
  return result;
};

/**
 * 获取订单列表
 */
const getOrderList = async (req, res) => {
  try {
    const { userId, orderType, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 构建查询条件
    const where = { user_id: userId };
    if (orderType) {
      where.order_type = orderType;
    }

    // 分页查询
    const offset = (page - 1) * limit;
    const orders = await db.findMany('orders', where, {
      orderBy: 'created_at',
      order: 'DESC',
      limit: parseInt(limit),
      offset: offset
    });

    // 转换字段名从蛇形到驼峰
    const camelCaseOrders = convertKeysToCamelCase(orders);

    // 获取总数量
    const total = await db.count('orders', where);

    res.success({
      list: camelCaseOrders,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.error('获取订单列表失败', 500, error);
  }
};

/**
 * 获取订单详情
 */
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '缺少订单ID'
      });
    }

    const order = await db.findOne('orders', { id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.success(order);
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.error('获取订单详情失败', 500, error);
  }
};

/**
 * 取消订单
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '缺少订单ID'
      });
    }

    const order = await db.findOne('orders', { id: orderId });

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
    await db.update('orders', {
      status: 'cancelled',
      status_text: '已取消',
      updated_at: formatDate()
    }, { id: orderId });

    const updatedOrder = {
      ...order,
      status: 'cancelled',
      status_text: '已取消',
      updated_at: formatDate()
    };

    res.success(updatedOrder, '订单已取消');
  } catch (error) {
    console.error('取消订单错误:', error);
    res.error('取消订单失败', 500, error);
  }
};

/**
 * 支付订单
 */
const payOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod = 'wechat' } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '缺少订单ID'
      });
    }

    const order = await db.findOne('orders', { id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.status !== 'pending') {
      return res.error('订单状态不允许支付', 400);
    }

    // 处理余额支付
    if (paymentMethod === 'balance') {
      // 获取用户会员信息
      const member = await db.findOne('members', { user_id: order.user_id });

      if (!member) {
        return res.error('会员信息不存在，无法使用余额支付', 400);
      }

      // 检查余额是否足够
      const currentBalance = parseFloat(member.balance);
      const orderAmount = parseFloat(order.actual_amount);

      if (currentBalance < orderAmount) {
        return res.error('余额不足', 400);
      }

      // 扣除余额
      const newBalance = currentBalance - orderAmount;
      await db.update('members', {
        balance: newBalance.toFixed(2),
        total_consumption: parseFloat(member.total_consumption) + orderAmount,
        total_orders: parseInt(member.total_orders) + 1,
        updated_at: formatDate()
      }, { user_id: order.user_id });

      // 记录余额变动
      await db.insert('balance_records', {
        id: generateId(),
        user_id: order.user_id,
        type: 'consumption',
        amount: -orderAmount,
        balance: newBalance.toFixed(2),
        description: `支付订单 ${order.order_no}`,
        related_order_id: orderId,
        created_at: formatDate()
      });

      // 更新订单状态为待使用
      await db.update('orders', {
        status: 'paid',
        status_text: '待使用',
        payment_method: paymentMethod,
        paid_at: formatDate(),
        updated_at: formatDate()
      }, { id: orderId });

      const updatedOrder = {
        ...order,
        status: 'paid',
        status_text: '待使用',
        payment_method: paymentMethod,
        paid_at: formatDate(),
        updated_at: formatDate()
      };

      return res.success(updatedOrder, '订单支付成功');
    }

    // 微信支付 - 创建预支付订单
    if (paymentMethod === 'wechat') {
      // 检查是否开启模拟支付模式
      if (process.env.PAYMENT_SIMULATE === 'true' || !process.env.WX_PAY_MCH_ID) {
        console.log('[模拟支付] 跳过真实微信支付，直接返回模拟参数');
        // 生成模拟支付参数
        const mockPrepayId = `prepay_id_test_${Date.now()}`;
        const mockTimestamp = Math.floor(Date.now() / 1000).toString();
        const mockNonceStr = require('crypto').randomBytes(16).toString('hex');
        const mockSign = require('crypto').createHash('sha256').update(`${mockTimestamp}\n${mockNonceStr}\nprepay_id=${mockPrepayId}\n`).digest('base64');

        // 模拟延迟（模拟真实网络请求）
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 直接更新订单状态为已支付（模拟支付成功）
        await db.update('orders', {
          status: 'paid',
          status_text: '待使用',
          payment_method: paymentMethod,
          paid_at: formatDate(),
          updated_at: formatDate()
        }, { id: orderId });

        const updatedOrder = {
          ...order,
          status: 'paid',
          status_text: '待使用',
          payment_method: paymentMethod,
          paid_at: formatDate(),
          updated_at: formatDate()
        };

        return res.success({
        timeStamp: mockTimestamp,
        nonceStr: mockNonceStr,
        package: `prepay_id=${mockPrepayId}`,
        signType: 'SHA256',
        paySign: mockSign,
        prepay_id: mockPrepayId,
        order: updatedOrder // 直接返回已支付的订单信息
      }, '预支付订单创建成功（模拟支付）');
      }

      // 真实微信支付（保留原有逻辑）
      try {
        const WXPay = require('wechatpay-node-v3');
        const fs = require('fs');
        const path = require('path');

        // 检查必要的支付配置
        if (!process.env.WX_PAY_MCH_ID || !process.env.WX_PAY_SERIAL_NO || !process.env.WX_PAY_APIV3_KEY) {
          return res.error('微信支付配置未完成，请开启模拟支付或配置真实支付参数', 500);
        }

        // 初始化微信支付客户端
        const pay = new WXPay({
          mchid: process.env.WX_PAY_MCH_ID,
          serial_no: process.env.WX_PAY_SERIAL_NO,
          private_key: fs.readFileSync(path.join(__dirname, '../cert/apiclient_key.pem')),
          apiv3_private_key: process.env.WX_PAY_APIV3_KEY
        });

        // 获取用户openid（从认证后的用户信息）
        // 注意：如果用户信息中没有openid字段，说明是测试环境或其他登录方式
        const user = req.user;
        if (!user.openid) {
          console.log('[支付警告] 用户未绑定微信账号，使用默认openid');
          // 测试环境下可以使用默认openid
          user.openid = `test_openid_${user.id}`;
        }

        // 生成商户订单号
        const out_trade_no = order.order_no;
        // 订单金额（分）
        const total = parseInt(parseFloat(order.actual_amount) * 100);

        // 构建预支付订单
        const params = {
          appid: process.env.WX_PAY_APPID,
          mchid: process.env.WX_PAY_MCH_ID,
          description: `订单${order.order_no}`,
          out_trade_no: out_trade_no,
          notify_url: process.env.WX_PAY_NOTIFY_URL || 'https://your-api-domain.com/api/order/pay/notify',
          amount: {
            total: total,
            currency: 'CNY'
          },
          payer: {
            openid: user.openid
          },
          scene_info: {
            payer_client_ip: req.ip || '127.0.0.1'
          }
        };

        // 调用微信支付统一下单接口
        const result = await pay.transactions_jsapi(params);

        // 生成前端需要的支付参数（使用SDK）
        const payParams = pay.getJsApiParams(result.prepay_id);

        return res.success({
          ...payParams,
          prepay_id: result.prepay_id
        }, '预支付订单创建成功');
      } catch (payError) {
        console.error('微信支付统一下单失败:', payError);
        return res.error('微信支付创建失败: ' + payError.message, 500, payError);
      }
    }

    res.error('不支持的支付方式', 400);
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
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const order = await db.findOne('orders', { id: orderId });

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
    await db.update('orders', {
      status: status,
      status_text: statusMap[status],
      updated_at: formatDate()
    }, { id: orderId });

    const updatedOrder = {
      ...order,
      status: status,
      status_text: statusMap[status],
      updated_at: formatDate()
    };

    res.success(updatedOrder, '订单状态更新成功');
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.error('更新订单状态失败', 500, error);
  }
};

const paymentNotify = async (req, res) => {
  try {
    const WXPay = require('wechatpay-node-v3');
    const fs = require('fs');
    const path = require('path');

    // 初始化微信支付客户端
    const pay = new WXPay({
      mchid: process.env.WX_PAY_MCH_ID,
      serial_no: process.env.WX_PAY_SERIAL_NO,
      private_key: fs.readFileSync(path.join(__dirname, '../cert/apiclient_key.pem')),
      apiv3_private_key: process.env.WX_PAY_APIV3_KEY
    });

    // 验证回调签名
    const result = await pay.verifySign(req.headers, req.body);
    if (!result) {
      return res.json({
        code: 'FAIL',
        message: '签名验证失败'
      });
    }

    // 解析支付通知
    const notifyData = JSON.parse(req.body.toString('utf8'));

    if (notifyData.event_type === 'TRANSACTIONS.SUCCESS') {
      const outTradeNo = notifyData.resource?.ciphertext?.out_trade_no;
      const transactionId = notifyData.resource?.ciphertext?.transaction_id;
      const totalAmount = notifyData.resource?.ciphertext?.amount?.total;

      if (!outTradeNo) {
        return res.json({
          code: 'FAIL',
          message: '缺少订单号'
        });
      }

      // 根据订单号查找订单
      const order = await db.findOne('orders', { order_no: outTradeNo });
      if (!order) {
        return res.json({
          code: 'FAIL',
          message: '订单不存在'
        });
      }

      // 更新订单状态为已支付
      await db.update('orders', {
        status: 'paid',
        status_text: '待使用',
        payment_method: 'wechat',
        paid_at: formatDate(),
        payment_no: transactionId,
        updated_at: formatDate()
      }, { id: order.id });

      // 记录支付记录
      await db.insert('payment_records', {
        id: generateId(),
        order_id: order.id,
        order_no: order.order_no,
        payment_no: transactionId,
        payment_method: 'wechat',
        total_amount: (totalAmount / 100).toFixed(2),
        paid_at: formatDate(),
        created_at: formatDate()
      });

      return res.json({
        code: 'SUCCESS',
        message: '支付成功'
      });
    } else {
      return res.json({
        code: 'FAIL',
        message: '支付未成功'
      });
    }
  } catch (error) {
    console.error('微信支付回调处理错误:', error);
    return res.json({
      code: 'FAIL',
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  cancelOrder,
  payOrder,
  updateOrderStatus,
  paymentNotify
};
