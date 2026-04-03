/**
 * 会员路由
 */

const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// 获取会员信息
router.get('/info', memberController.getMemberInfo);

// 获取余额
router.get('/balance', memberController.getBalance);

// 充值
router.post('/recharge', memberController.recharge);

// 获取充值记录
router.get('/recharge-records', memberController.getRechargeRecords);

// 获取余额记录
router.get('/balance-records', memberController.getBalanceRecords);

module.exports = router;
