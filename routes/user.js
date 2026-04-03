/**
 * 用户路由
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { loginLimiter, generalLimiter } = require('../middleware/rateLimiter');

// 手机号登录 - 应用登录速率限制
router.post('/login/phone', loginLimiter, userController.phoneLogin);

// 微信登录 - 应用登录速率限制
router.post('/login/wechat', loginLimiter, userController.wechatLogin);

// 获取用户信息 - 需要认证
router.get('/info', authMiddleware, generalLimiter, userController.getUserInfo);

// 更新用户信息 - 需要认证
router.post('/update', authMiddleware, generalLimiter, userController.updateUserInfo);

// 上传头像 - 需要认证
router.post('/avatar/upload', authMiddleware, generalLimiter, userController.uploadAvatar);

// 解密微信手机号 - 需要认证
router.post('/phone/decrypt', authMiddleware, generalLimiter, userController.decryptWechatPhone);

module.exports = router;
