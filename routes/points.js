/**
 * 积分路由
 */

const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const { authMiddleware } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { validate, exchangeGoodsSchema } = require('../middleware/validationMiddleware');

// 获取积分余额 - 需要认证
router.get('/balance', authMiddleware, generalLimiter, pointsController.getPointsBalance);

// 获取积分商城商品列表
router.get('/goods', pointsController.getPointsGoods);

// 积分兑换 - 需要认证
router.post('/exchange', authMiddleware, generalLimiter, validate(exchangeGoodsSchema), pointsController.exchangeGoods);

// 获取积分明细 - 需要认证
router.get('/records', authMiddleware, generalLimiter, pointsController.getPointsRecords);

// 获取兑换记录 - 需要认证
router.get('/exchange-records', authMiddleware, generalLimiter, pointsController.getExchangeRecords);

module.exports = router;
