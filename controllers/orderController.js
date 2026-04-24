/**
 * 订单控制器
 * 处理订单相关的HTTP请求
 */

const orderService = require('../services/orderService');
const userService = require('../services/userService');
const memberService = require('../services/memberService');
const { generateId, formatDate } = require('../config/mysql');

/**
 * @swagger
 * tags:
 *   name: 订单管理
 *   description: 订单相关API
 */

/**
 * @swagger
 * /api/v1/order/create:
 *   post:
 *     summary: 创建订单
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderType:
 *                 type: string
 *                 description: 订单类型（dian/shang/hui/pin/li）
 *                 required: true
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *                 required: true
 *                 description: 订单商品列表
 *               totalAmount:
 *                 type: number
 *                 required: true
 *                 description: 总金额
 *               remark:
 *                 type: string
 *                 description: 订单备注
 *     responses:
 *       200:
 *         description: 订单创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
const createOrder = async (req, res) => {
  try {
    const { orderType, items, totalAmount, remark } = req.validatedData;
    const userId = req.user.id;

    const order = await orderService.createOrder({
      userId,
      orderType,
      totalAmount,
      actualAmount: totalAmount,
      items,
      remark,
    });

    res.success(order, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('创建订单错误:', error);
    res.error('ORDER.ORDER_CREATE_FAILED', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/order/list:
 *   get:
 *     summary: 获取订单列表
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderType
 *         type: string
 *         description: 订单类型（dian/shang/hui/pin/li）
 *       - in: query
 *         name: page
 *         type: integer
 *         description: 页码（默认1）
 *       - in: query
 *         name: limit
 *         type: integer
 *         description: 每页数量（默认20）
 *     responses:
 *       200:
 *         description: 订单列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
const getOrderList = async (req, res) => {
  try {
    const { orderType, page = 1, limit = 20 } = req.validatedData;
    const userId = req.user.id;

    const result = await orderService.getOrderList(
      userId,
      orderType,
      parseInt(page),
      parseInt(limit)
    );

    res.success(
      {
        list: result.list,
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/order/detail:
 *   get:
 *     summary: 获取订单详情
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         type: string
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 订单详情获取成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器内部错误
 */
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.validatedData;
    const userId = req.user.id;

    const order = await orderService.getOrderDetail(orderId, userId);

    if (!order) {
      return res.error('ORDER.ORDER_NOT_EXIST', 404, null, req);
    }

    res.success(order, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/order/cancel:
 *   post:
 *     summary: 取消订单
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 required: true
 *                 description: 订单ID
 *     responses:
 *       200:
 *         description: 订单取消成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器内部错误
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.validatedData;
    const userId = req.user.id;

    const order = await orderService.getOrderDetail(orderId, userId);

    if (!order) {
      return res.error('ORDER.ORDER_NOT_EXIST', 404, null, req);
    }

    const result = await orderService.cancelOrder(orderId);

    res.success(result, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('取消订单错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/order/pay:
 *   post:
 *     summary: 支付订单
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 required: true
 *                 description: 订单ID
 *               paymentMethod:
 *                 type: string
 *                 description: 支付方式（wechat/balance，默认wechat）
 *     responses:
 *       200:
 *         description: 支付成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: 请求参数错误或订单状态不允许支付
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器内部错误或支付失败
 */
const payOrder = async (req, res) => {
  try {
    const { orderId } = req.validatedData;
    const { paymentMethod = 'wechat' } = req.validatedData;
    const userId = req.user.id;

    const order = await orderService.getOrderDetail(orderId, userId);

    if (!order) {
      return res.error('ORDER.ORDER_NOT_EXIST', 404, null, req);
    }

    if (order.status !== 'pending') {
      return res.error('ORDER.ORDER_STATUS_ERROR', 400, null, req);
    }

    // 处理余额支付
    if (paymentMethod === 'balance') {
      const paymentResult = await memberService.payWithBalance(
        order.user_id,
        parseFloat(order.actual_amount)
      );

      // 更新订单状态
      await orderService.payOrder(orderId, paymentMethod);

      return res.success(paymentResult, 'COMMON.SUCCESS', 200, req);
    }

    // 微信支付 - 创建预支付订单
    if (paymentMethod === 'wechat') {
      // 检查是否开启模拟支付模式
      if (
        process.env.PAYMENT_SIMULATE === 'true' ||
        !process.env.WX_PAY_MCH_ID
      ) {
        console.log('[模拟支付] 跳过真实微信支付，直接返回模拟参数');
        // 生成模拟支付参数
        const mockPrepayId = `prepay_id_test_${Date.now()}`;
        const mockTimestamp = Math.floor(Date.now() / 1000).toString();
        const mockNonceStr = require('crypto').randomBytes(16).toString('hex');
        const packageStr = `prepay_id=${mockPrepayId}`;
        const mockSign = require('crypto')
          .createHash('sha256')
          .update(
            `${process.env.WX_PAY_APPID || 'wxcc4248914666b416'}\n${mockTimestamp}\n${mockNonceStr}\n${packageStr}\n`
          )
          .digest('base64');

        // 模拟延迟（模拟真实网络请求）
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 计算订单金额（分）
        const totalAmount = parseInt(parseFloat(order.actual_amount) * 100);

        // 构建完整的支付参数对象
        const paymentData = {
          appId: process.env.WX_PAY_APPID || 'wxcc4248914666b416', // 确保appId始终存在
          timeStamp: mockTimestamp,
          nonceStr: mockNonceStr,
          package: packageStr,
          signType: 'SHA256',
          paySign: mockSign,
          prepay_id: mockPrepayId,
          total_fee: totalAmount,
          totalFee: totalAmount,
          total_amount: order.actual_amount, // 额外兼容可能的其他前端实现
          totalAmount: order.actual_amount,
          // 在模拟模式下，我们不预先更新订单状态
          // 订单状态将在支付成功回调后更新
          order,
        };

        return res.success(paymentData, 'COMMON.SUCCESS', 200, req);
      }

      // 真实微信支付（保留原有逻辑）
      try {
        const WXPay = require('wechatpay-node-v3');
        const fs = require('fs');
        const path = require('path');

        // 检查必要的支付配置
        if (
          !process.env.WX_PAY_MCH_ID ||
          !process.env.WX_PAY_SERIAL_NO ||
          !process.env.WX_PAY_APIV3_KEY
        ) {
          return res.error('PAYMENT.PAYMENT_FAILED', 500, null, req);
        }

        // 初始化微信支付客户端
        const pay = new WXPay({
          mchid: process.env.WX_PAY_MCH_ID,
          serial_no: process.env.WX_PAY_SERIAL_NO,
          private_key: fs.readFileSync(
            path.join(__dirname, '../cert/apiclient_key.pem')
          ),
          apiv3_private_key: process.env.WX_PAY_APIV3_KEY,
        });

        // 获取用户openid（从认证后的用户信息）
        // 注意：如果用户信息中没有openid字段，说明是测试环境或其他登录方式
        const { user } = req;
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
          out_trade_no,
          notify_url:
            process.env.WX_PAY_NOTIFY_URL ||
            'https://your-api-domain.com/api/order/pay/notify',
          amount: {
            total,
            currency: 'CNY',
          },
          payer: {
            openid: user.openid,
          },
          scene_info: {
            payer_client_ip: req.ip || '127.0.0.1',
          },
        };

        // 调用微信支付统一下单接口
        const result = await pay.transactions_jsapi(params);

        // 微信支付v3需要手动生成JSAPI支付参数
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonceStr = require('crypto').randomBytes(16).toString('hex');
        const packageStr = `prepay_id=${result.prepay_id}`;

        // 生成签名 - 格式为：appId + "\n" + timeStamp + "\n" + nonceStr + "\n" + package + "\n"
        const signStr = `${process.env.WX_PAY_APPID}\n${timestamp}\n${nonceStr}\n${packageStr}\n`;
        const sign = require('crypto').createSign('SHA256');
        sign.update(signStr);
        sign.end();
        const paySign = sign.sign(
          fs.readFileSync(path.join(__dirname, '../cert/apiclient_key.pem')),
          'base64'
        );

        const payParams = {
          appId: process.env.WX_PAY_APPID,
          timeStamp: timestamp,
          nonceStr,
          package: packageStr,
          signType: 'SHA256',
          paySign,
          prepay_id: result.prepay_id,
          total_fee: parseInt(parseFloat(order.actual_amount) * 100), // 兼容旧版前端代码
          totalFee: parseInt(parseFloat(order.actual_amount) * 100), // 驼峰式命名兼容不同前端
          total_amount: order.actual_amount, // 额外兼容可能的其他前端实现
          totalAmount: order.actual_amount,
          order,
        };

        return res.success(payParams, 'COMMON.SUCCESS', 200, req);
      } catch (payError) {
        console.error('微信支付统一下单失败:', payError);
        // 支付失败，更新订单状态为失败
        await orderService.updateStatus(orderId, 'failed', '支付失败');
        return res.error('PAYMENT.PAYMENT_FAILED', 500, payError, req);
      }
    }

    res.error('COMMON.BAD_REQUEST', 400, null, req);
  } catch (error) {
    console.error('支付订单错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/order/{orderId}/status:
 *   put:
 *     summary: 更新订单状态
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         type: string
 *         required: true
 *         description: 订单ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 required: true
 *                 description: 新状态（paid/using/completed/cancelled/refunded）
 *     responses:
 *       200:
 *         description: 订单状态更新成功
 *       400:
 *         description: 请求参数错误或无效的订单状态
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器内部错误
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 先尝试通过订单ID查找，找不到再尝试通过订单号查找
    let order = await orderService.getOrderDetail(orderId, req.user.id);

    if (!order) {
      // 尝试通过订单号查找
      const orderByNo = await orderService.getOrderByNo(orderId, req.user.id);
      if (!orderByNo) {
        return res.error('ORDER.ORDER_NOT_EXIST', 404, null, req);
      }
      order = orderByNo;
    }

    // 状态映射
    const statusMap = {
      paid: '待使用',
      using: '使用中',
      completed: '已完成',
      cancelled: '已取消',
      refunded: '已退款',
    };

    if (!statusMap[status]) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 更新状态 - 使用实际的订单ID
    await orderService.updateStatus(order.id, status, statusMap[status]);

    const updatedOrder = await orderService.getOrderDetail(
      order.id,
      req.user.id
    );

    res.success(updatedOrder, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/order/pay/notify:
 *   post:
 *     summary: 微信支付回调通知
 *     tags: [订单管理]
 *     description: 微信支付结果回调接口，不需要认证
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 回调处理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: SUCCESS
 *                 message:
 *                   type: string
 *                   example: 支付成功
 *       500:
 *         description: 回调处理失败
 */
const paymentNotify = async (req, res) => {
  try {
    const WXPay = require('wechatpay-node-v3');
    const fs = require('fs');
    const path = require('path');

    // 初始化微信支付客户端
    const pay = new WXPay({
      mchid: process.env.WX_PAY_MCH_ID,
      serial_no: process.env.WX_PAY_SERIAL_NO,
      private_key: fs.readFileSync(
        path.join(__dirname, '../cert/apiclient_key.pem')
      ),
      apiv3_private_key: process.env.WX_PAY_APIV3_KEY,
    });

    // 验证回调签名
    const result = await pay.verifySign(req.headers, req.body);
    if (!result) {
      console.error('微信支付回调签名验证失败');
      return res.json({ code: 'FAIL', message: '签名验证失败' });
    }

    // 解析支付通知
    const notifyData = JSON.parse(req.body.toString('utf8'));

    if (notifyData.event_type === 'TRANSACTIONS.SUCCESS') {
      const outTradeNo = notifyData.resource?.ciphertext?.out_trade_no;
      const transactionId = notifyData.resource?.ciphertext?.transaction_id;
      const totalAmount = notifyData.resource?.ciphertext?.amount?.total;

      if (!outTradeNo) {
        console.error('微信支付回调缺少订单号');
        return res.json({ code: 'FAIL', message: '缺少订单号' });
      }

      // 根据订单号查找订单
      const order = await orderService.findByOrderNo(outTradeNo);
      if (!order) {
        console.error(`微信支付回调找不到订单: ${outTradeNo}`);
        return res.json({ code: 'FAIL', message: '订单不存在' });
      }

      // 检查订单状态，避免重复处理
      if (order.status === 'paid' || order.status === 'completed') {
        return res.json({ code: 'SUCCESS', message: '订单已处理' });
      }

      // 更新订单状态为已支付
      await orderService.updatePayment(order.id, 'wechat', formatDate());

      // 记录支付记录
      await require('../config/mysql').db.insert('payment_records', {
        id: generateId(),
        order_id: order.id,
        order_no: order.order_no,
        payment_no: transactionId,
        payment_method: 'wechat',
        total_amount: (totalAmount / 100).toFixed(2),
        paid_at: formatDate(),
        created_at: formatDate(),
      });

      console.log(`微信支付回调处理成功，订单号: ${outTradeNo}`);
      return res.json({ code: 'SUCCESS', message: '支付成功' });
    }
    console.log(`微信支付回调事件类型不匹配: ${notifyData.event_type}`);
    return res.json({ code: 'FAIL', message: '支付未成功' });
  } catch (error) {
    console.error('微信支付回调处理错误:', error);
    return res.json({ code: 'FAIL', message: '服务器内部错误' });
  }
};

/**
 * @swagger
 * /api/v1/order/delete:
 *   delete:
 *     summary: 删除订单
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         type: string
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 订单删除成功
 *       400:
 *         description: 请求参数错误或订单状态不允许删除
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器内部错误
 */
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.validatedData;
    const userId = req.user.id;

    const result = await orderService.deleteOrder(orderId, userId);

    if (!result.success) {
      return res.error('ORDER.ORDER_NOT_DELETABLE', 400, null, req);
    }

    res.success(result, 'ORDER.ORDER_DELETED', 200, req);
  } catch (error) {
    console.error('删除订单错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  cancelOrder,
  payOrder,
  updateOrderStatus,
  paymentNotify,
  deleteOrder,
};
