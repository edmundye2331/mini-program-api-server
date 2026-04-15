/**
 * 订单路由
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const { orderLimiter, paymentLimiter, generalLimiter } = require('../middleware/rateLimiter');
const { validate, createOrderSchema, payOrderSchema } = require('../middleware/validationMiddleware');

// 创建订单 - 需要认证，应用订单速率限制
router.post('/create', authMiddleware, orderLimiter, validate(createOrderSchema), orderController.createOrder);

// 获取订单列表 - 需要认证
router.get('/list', authMiddleware, generalLimiter, orderController.getOrderList);

// 获取订单详情 - 需要认证
router.get('/detail/:orderId', authMiddleware, generalLimiter, orderController.getOrderDetail);

// 支付订单 - 需要认证，应用支付速率限制
router.post('/pay/:orderId', authMiddleware, paymentLimiter, validate(payOrderSchema), orderController.payOrder);

// 取消订单 - 需要认证
router.post('/cancel/:orderId', authMiddleware, generalLimiter, orderController.cancelOrder);

// 更新订单状态 - 需要认证
router.put('/status/:orderId', authMiddleware, generalLimiter, orderController.updateOrderStatus);

// 微信支付回调接口（无需认证）
router.post('/pay/notify', orderController.paymentNotify);

module.exports = router;
