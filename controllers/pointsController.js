/**
 * 积分控制器
 * 处理积分相关的HTTP请求
 */

const pointsService = require('../services/pointsService');
const userService = require('../services/userService');
const memberService = require('../services/memberService');

/**
 * @swagger
 * tags:
 *   name: 积分管理
 *   description: 积分相关API
 */

/**
 * @swagger
 * /api/v1/points/balance:
 *   get:
 *     summary: 获取积分余额
 *     tags: [积分管理]
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
 *         description: 获取积分余额成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
const getPointsBalance = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const member = await memberService.getOrCreateMember(userId);

    res.success(
      {
        points: member.points,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取积分余额错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/points/goods:
 *   get:
 *     summary: 获取积分商城商品列表
 *     tags: [积分管理]
 *     responses:
 *       200:
 *         description: 获取积分商城商品列表成功
 *       500:
 *         description: 服务器内部错误
 */
const getPointsGoods = async (req, res) => {
  try {
    const goods = await pointsService.getPointsGoodsList();
    res.success(
      {
        list: goods,
        total: goods.length,
        page: 1,
        limit: goods.length,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取积分商品错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/points/exchange:
 *   post:
 *     summary: 积分兑换
 *     tags: [积分管理]
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
 *               goodsId:
 *                 type: string
 *                 required: true
 *                 description: 商品ID
 *               quantity:
 *                 type: integer
 *                 description: 兑换数量（默认1）
 *     responses:
 *       200:
 *         description: 积分兑换成功
 *       400:
 *         description: 请求参数错误或积分不足
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器内部错误
 */
const exchangeGoods = async (req, res) => {
  try {
    const { userId, goodsId, quantity = 1 } = req.body;

    if (!userId || !goodsId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const result = await pointsService.exchangePointsGoods(
      userId,
      goodsId,
      quantity
    );

    res.success(
      {
        points: result.remainingPoints,
        exchangeRecord: result,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('积分兑换错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/points/records:
 *   get:
 *     summary: 获取积分明细
 *     tags: [积分管理]
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
 *         description: 获取积分明细成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
const getPointsRecords = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const records = await pointsService.getPointsRecords(
      userId,
      parseInt(limit)
    );

    // 转换数据库下划线字段为驼峰式
    const formattedRecords = records.map((record) => ({
      id: record.id,
      userId: record.user_id,
      type: record.type,
      amount: record.amount,
      balance: record.balance,
      description: record.description,
      relatedOrderId: record.related_order_id,
      relatedGoodsId: record.related_goods_id,
      createdAt: record.created_at,
      timestamp: new Date(record.created_at).getTime(),
    }));

    res.success(
      {
        list: formattedRecords,
        total: formattedRecords.length,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取积分明细错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/points/exchange-records:
 *   get:
 *     summary: 获取兑换记录
 *     tags: [积分管理]
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
 *         description: 获取兑换记录成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
const getExchangeRecords = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 从数据库查询兑换记录
    const { db } = require('../config/mysql');
    const total = await db.count('exchange_records', { user_id: userId });
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const records = await db.findMany(
      'exchange_records',
      { user_id: userId },
      {
        orderBy: 'created_at',
        order: 'DESC',
        limit: limitNum,
        offset,
      }
    );

    // 转换数据库下划线字段为驼峰式
    const formattedRecords = records.map((record) => ({
      id: record.id,
      userId: record.user_id,
      goodsId: record.goods_id,
      goodsName: record.goods_name,
      points: record.points, // 添加积分字段
      quantity: 1, // 积分商品默认数量为1
      status: record.status,
      statusText:
        record.status === 'success'
          ? '已完成'
          : record.status === 'pending'
            ? '待领取'
            : record.status === 'failed'
              ? '已失败'
              : '未知状态',
      redemptionCode: record.redemption_code,
      createdAt: record.created_at,
      timestamp: new Date(record.created_at).getTime(),
      description: record.description || `兑换商品: ${record.goods_name}`,
    }));

    res.success(
      {
        list: formattedRecords,
        total,
        page: parseInt(page),
        limit: limitNum,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取兑换记录错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

module.exports = {
  getPointsBalance,
  getPointsGoods,
  exchangeGoods,
  getPointsRecords,
  getExchangeRecords,
};
