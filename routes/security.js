const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

// 修改密码
router.post('/password/change', securityController.changePassword);

// 绑定/更换手机号
router.post('/phone/bind', securityController.bindPhone);

// 获取登录记录
router.get('/login-logs', securityController.getLoginLogs);

// 注销账号
router.delete('/account', securityController.deleteAccount);

module.exports = router;
