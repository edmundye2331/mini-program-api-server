/**
 * 会员控制器
 * 处理会员相关的HTTP请求
 */

const memberService = require('../services/memberService');
const userService = require('../services/userService');
const { generateId, formatDate } = require('../config/mysql');

/**
 * @swagger
 * tags:
 *   name: 会员管理
 *   description: 会员相关API
 */

/**
 * @swagger
 * /api/v1/member/info:
 *   get:
 *     summary: 获取会员信息
 *     tags: [会员管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取会员信息成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const getMemberInfo = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 检查用户是否存在
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    const member = await memberService.getOrCreateMember(userId);

    res.success(member, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('获取会员信息错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/member/balance:
 *   get:
 *     summary: 获取会员余额
 *     tags: [会员管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取余额成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const getBalance = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 检查用户是否存在
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    const balance = await memberService.getBalance(userId);

    res.success({ balance }, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('获取余额错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/member/recharge:
 *   post:
 *     summary: 会员充值
 *     tags: [会员管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 required: true
 *                 description: 用户ID
 *               amount:
 *                 type: number
 *                 required: true
 *                 description: 充值金额
 *               bonusAmount:
 *                 type: number
 *                 description: 赠送金额（可选）
 *     responses:
 *       200:
 *         description: 充值成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const recharge = async (req, res) => {
  try {
    const { userId, amount, bonusAmount } = req.body;

    if (!userId || !amount) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 检查用户是否存在
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    const result = await memberService.recharge(
      userId,
      amount,
      bonusAmount || 0
    );

    res.success(
      {
        balance: result.member.balance,
        rechargeRecord: result.rechargeRecord,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('充值错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/member/recharge-records:
 *   get:
 *     summary: 获取充值记录
 *     tags: [会员管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         required: true
 *         description: 用户ID
 *       - in: query
 *         name: page
 *         type: integer
 *         description: 页码（默认1）
 *       - in: query
 *         name: limit
 *         type: integer
 *         description: 每页数量（默认20）
 *     responses:
 *       200:
 *         description: 获取充值记录成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const getRechargeRecords = async (req, res) => {
  try {
    // 使用认证后的用户ID，而不是从查询参数获取
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // 检查用户是否存在
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    // 这里需要在memberService中添加获取充值记录的方法
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await require('../config/mysql').db.count(
      'recharge_records',
      { user_id: userId }
    );
    const offset = (pageNum - 1) * limitNum;
    const records = await require('../config/mysql').db.findMany(
      'recharge_records',
      { user_id: userId },
      {
        orderBy: 'created_at',
        order: 'DESC',
        limit: limitNum,
        offset,
      }
    );

    // 转换字段名为驼峰式
    const formattedRecords = records.map((record) => ({
      id: record.id,
      userId: record.user_id,
      amount: parseFloat(record.amount),
      bonusAmount: parseFloat(record.bonus_amount),
      totalAmount: parseFloat(record.total_amount),
      balanceBefore: parseFloat(record.balance_before),
      balanceAfter: parseFloat(record.balance_after),
      paymentMethod: record.payment_method,
      transactionId: record.transaction_id,
      status: record.status,
      paidAt: record.paid_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));

    res.success(
      {
        list: formattedRecords,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取充值记录错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/member/balance-records:
 *   get:
 *     summary: 获取余额记录
 *     tags: [会员管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         required: true
 *         description: 用户ID
 *       - in: query
 *         name: page
 *         type: integer
 *         description: 页码（默认1）
 *       - in: query
 *         name: limit
 *         type: integer
 *         description: 每页数量（默认20）
 *     responses:
 *       200:
 *         description: 获取余额记录成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const getBalanceRecords = async (req, res) => {
  try {
    // 使用认证后的用户ID，而不是从查询参数获取
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // 检查用户是否存在
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await require('../config/mysql').db.count('balance_records', {
      user_id: userId,
    });
    const offset = (pageNum - 1) * limitNum;
    const records = await require('../config/mysql').db.findMany(
      'balance_records',
      { user_id: userId },
      {
        orderBy: 'created_at',
        order: 'DESC',
        limit: limitNum,
        offset,
      }
    );

    // 转换字段名为驼峰式
    const formattedRecords = records.map((record) => ({
      id: record.id,
      userId: record.user_id,
      type: record.type,
      amount: parseFloat(record.amount),
      balance: parseFloat(record.balance),
      description: record.description,
      relatedOrderId: record.related_order_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));

    res.success(
      {
        list: formattedRecords,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取余额记录错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

module.exports = {
  getMemberInfo,
  getBalance,
  recharge,
  getRechargeRecords,
  getBalanceRecords,
};
