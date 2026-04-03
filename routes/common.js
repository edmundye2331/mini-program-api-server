/**
 * 通用路由
 */

const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

// 获取优惠券列表
router.get('/coupons', commonController.getCoupons);

// 获取门店列表
router.get('/stores', commonController.getStores);

// 获取协议内容
router.get('/protocol', commonController.getProtocol);

// 发送验证码
router.post('/sms/send', commonController.sendSmsCode);

module.exports = router;
