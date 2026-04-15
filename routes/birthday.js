const express = require('express');
const router = express.Router();
const birthdayController = require('../controllers/birthdayController');
const { authMiddleware } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { validate, claimBirthdayGiftSchema } = require('../middleware/validationMiddleware');

// 获取生日礼信息 - 需要认证
router.get('/gift', authMiddleware, generalLimiter, birthdayController.getBirthdayGift);

// 领取生日礼 - 需要认证
router.post('/gift/claim', authMiddleware, generalLimiter, validate(claimBirthdayGiftSchema), birthdayController.claimBirthdayGift);

// 获取生日礼领取记录 - 需要认证
router.get('/gift/records', authMiddleware, generalLimiter, birthdayController.getBirthdayGiftRecords);

module.exports = router;
