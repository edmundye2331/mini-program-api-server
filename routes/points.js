/**
 * 积分路由
 */

const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');

// 获取积分余额
router.get('/balance', pointsController.getPointsBalance);

// 获取积分商城商品列表
router.get('/goods', pointsController.getPointsGoods);

// 积分兑换
router.post('/exchange', pointsController.exchangeGoods);

// 获取积分明细
router.get('/records', pointsController.getPointsRecords);

// 获取兑换记录
router.get('/exchange-records', pointsController.getExchangeRecords);

module.exports = router;
