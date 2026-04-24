/**
 * 生日礼控制器
 * 处理生日礼相关API
 */

const birthdayService = require('../services/birthdayService');
const userService = require('../services/userService');

/**
 * @swagger
 * tags:
 *   name: 生日礼管理
 *   description: 生日礼相关API
 */

/**
 * @swagger
 * /api/v1/birthday/gift:
 *   get:
 *     summary: 获取生日礼信息
 *     tags: [生日礼管理]
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
 *         description: 获取生日礼信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       description: 是否可以领取
 *                       example: true
 *                     giftName:
 *                       type: string
 *                       description: 礼物名称
 *                       example: "生日专属优惠券"
 *                     giftDescription:
 *                       type: string
 *                       description: 礼物描述
 *                       example: "满200减50优惠券"
 *                     giftType:
 *                       type: string
 *                       description: 礼物类型
 *                       example: "coupon"
 *                     points:
 *                       type: number
 *                       description: 积分值
 *                       example: 100
 *                     giftValue:
 *                       type: number
 *                       description: 礼物价值
 *                       example: 50
 *                     expireDate:
 *                       type: string
 *                       format: date
 *                       example: "2026-04-30"
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
exports.getBirthdayGift = async (req, res) => {
  try {
    const { userId } = req.validatedData;

    // 查找用户
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    const { canClaim, gift, reason } =
      await birthdayService.checkBirthdayGift(userId);

    // 格式化返回数据
    const responseData = {
      available: canClaim,
      giftName: gift?.gift_name || '',
      giftDescription: gift?.gift_description || '',
      giftType: gift?.gift_type || '',
      points: gift?.points || 0,
      giftValue: gift?.gift_value || 0,
      expireDate: gift?.expires_at
        ? new Date(gift.expires_at).toISOString().split('T')[0]
        : '',
    };

    // 如果不能领取，返回原因
    if (!canClaim) {
      responseData.reason = reason;
    }

    res.success(responseData, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('获取生日礼错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/birthday/gift/claim:
 *   post:
 *     summary: 领取生日礼
 *     tags: [生日礼管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *                 example: "wx_openid123456"
 *     responses:
 *       200:
 *         description: 生日礼领取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     giftName:
 *                       type: string
 *                       example: "生日专属优惠券"
 *                     giftType:
 *                       type: string
 *                       example: "coupon"
 *                     points:
 *                       type: number
 *                       example: 100
 *                     claimTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-04-01T00:00:00Z"
 *                 message:
 *                   type: string
 *                   example: "生日礼领取成功"
 *       400:
 *         description: 请求参数错误或生日礼不可领取
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
exports.claimBirthdayGift = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 领取生日礼
    const result = await birthdayService.claimBirthdayGift(userId);

    // 格式化返回数据
    const responseData = {
      giftName: result.gift_name,
      giftType: result.gift_type,
      points: result.points || 0,
      claimTime: result.claimed_at,
    };

    res.success(responseData, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('领取生日礼错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/birthday/gift/records:
 *   get:
 *     summary: 获取生日礼领取记录
 *     tags: [生日礼管理]
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
 *         description: 获取生日礼领取记录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "record123456"
 *                       user_id:
 *                         type: string
 *                         example: "wx_openid123456"
 *                       gift_name:
 *                         type: string
 *                         example: "生日专属优惠券"
 *                       gift_type:
 *                         type: string
 *                         example: "coupon"
 *                       points:
 *                         type: integer
 *                         example: 100
 *                       is_claimed:
 *                         type: boolean
 *                         example: true
 *                       claimed_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-04-01T00:00:00Z"
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *                 total:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.getBirthdayGiftRecords = async (req, res) => {
  try {
    const { userId } = req.validatedData;

    // 查找用户
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    const records = await birthdayService.getUserBirthdayGifts(userId);

    // 格式化返回数据
    const formattedRecords = records.map((record) => ({
      id: record.id,
      user_id: record.user_id,
      gift_name: record.gift_name,
      gift_type: record.gift_type,
      points: record.points || 0,
      is_claimed: record.is_claimed,
      claimed_at: record.claimed_at,
    }));

    res.success(
      {
        records: formattedRecords,
        total: formattedRecords.length,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取生日礼记录错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};
