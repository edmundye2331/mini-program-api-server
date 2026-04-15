const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { validate, changePasswordSchema, bindPhoneSchema } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

// 修改密码
router.post('/password/change', authMiddleware, generalLimiter, validate(changePasswordSchema), securityController.changePassword);

// 绑定/更换手机号
router.post('/phone/bind', authMiddleware, generalLimiter, validate(bindPhoneSchema), securityController.bindPhone);

// 获取登录记录
router.get('/login-logs', authMiddleware, generalLimiter, securityController.getLoginLogs);

// 注销账号
router.delete('/account', authMiddleware, generalLimiter, securityController.deleteAccount);

module.exports = router;
