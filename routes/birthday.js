const express = require('express');
const router = express.Router();
const birthdayController = require('../controllers/birthdayController');

// 获取生日礼信息
router.get('/gift', birthdayController.getBirthdayGift);

// 领取生日礼
router.post('/gift/claim', birthdayController.claimBirthdayGift);

// 获取生日礼领取记录
router.get('/gift/records', birthdayController.getBirthdayGiftRecords);

module.exports = router;
