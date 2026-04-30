/**
 * 通用路由
 */

const express = require('express');

const router = express.Router();
const commonController = require('../controllers/commonController');
const { authMiddleware } = require('../middleware/auth');
const { generalLimiter, smsLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  sendSmsCodeSchema,
  verifyCaptchaSchema,
} = require('../middleware/validationMiddleware');

// 获取门店列表
router.get('/stores', commonController.getStores);

// 获取协议内容
router.get('/protocol', commonController.getProtocol);

// 发送验证码 - 应用短信发送速率限制
router.post(
  '/sms/send',
  smsLimiter,
  validate(sendSmsCodeSchema),
  commonController.sendSmsCode
);

// 验证腾讯云验证码
router.post(
  '/captcha/verify',
  generalLimiter,
  validate(verifyCaptchaSchema),
  commonController.verifyCaptchaCode
);

module.exports = router;
