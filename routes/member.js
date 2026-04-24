/**
 * 会员路由
 */

const express = require('express');

const router = express.Router();
const memberController = require('../controllers/memberController');
const {
  authMiddleware,
  optionalAuthMiddleware,
} = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  rechargeSchema,
} = require('../middleware/validationMiddleware');

// 获取会员信息 - 暂时使用可选认证，方便调试
router.get(
  '/info',
  optionalAuthMiddleware,
  generalLimiter,
  memberController.getMemberInfo
);

// 获取余额 - 需要认证
router.get(
  '/balance',
  authMiddleware,
  generalLimiter,
  memberController.getBalance
);

// 充值 - 需要认证
router.post(
  '/recharge',
  authMiddleware,
  generalLimiter,
  validate(rechargeSchema),
  memberController.recharge
);

// 获取充值记录 - 需要认证
router.get(
  '/recharge-records',
  authMiddleware,
  generalLimiter,
  memberController.getRechargeRecords
);

// 获取余额记录 - 需要认证
router.get(
  '/balance-records',
  authMiddleware,
  generalLimiter,
  memberController.getBalanceRecords
);

module.exports = router;
