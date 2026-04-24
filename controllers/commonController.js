/**
 * 通用控制器
 * 处理优惠券、门店、协议等接口
 */

/**
 * @swagger
 * tags:
 *   name: 通用管理
 *   description: 通用功能相关API
 */

const storeService = require('../services/storeService');
const protocolService = require('../services/protocolService');
const {
  generateCode,
  saveCode,
  hasCode,
  getRemainingSeconds,
} = require('../utils/verificationCode');
const {
  isConfigured,
  sendVerificationCode,
} = require('../config/tencentSms');

/**
 * @swagger
 * /api/v1/common/stores:
 *   get:
 *     summary: 获取门店列表
 *     tags: [通用管理]
 *     responses:
 *       200:
 *         description: 获取门店列表成功
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
 *                         example: "store123456"
 *                       name:
 *                         type: string
 *                         example: "北京旗舰店"
 *                       address:
 *                         type: string
 *                         example: "北京市朝阳区建国路88号"
 *                       phone:
 *                         type: string
 *                         example: "010-12345678"
 *                       latitude:
 *                         type: number
 *                         example: 39.9042
 *                       longitude:
 *                         type: number
 *                         example: 116.4074
 *                       businessHours:
 *                         type: string
 *                         example: "09:00-22:00"
 *                       distance:
 *                         type: number
 *                         example: 1200
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *       500:
 *         description: 服务器内部错误
 */
const getStores = async (req, res) => {
  try {
    const stores = await storeService.getStores();
    res.success(stores, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('获取门店列表错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/common/protocol:
 *   get:
 *     summary: 获取协议内容
 *     tags: [通用管理]
 *     parameters:
 *       - in: query
 *         name: type
 *         type: string
 *         required: true
 *         description: 协议类型（privacy/terms/about）
 *         example: "privacy"
 *     responses:
 *       200:
 *         description: 获取协议内容成功
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
 *                     type:
 *                       type: string
 *                       example: "privacy"
 *                     content:
 *                       type: string
 *                       example: "隐私政策内容..."
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 协议不存在
 *       500:
 *         description: 服务器内部错误
 */
const getProtocol = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const content = await protocolService.getProtocol(type);

    if (!content) {
      return res.error('COMMON.NOT_FOUND', 404, null, req);
    }

    res.success(
      {
        type,
        content,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('获取协议内容错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/common/send-sms:
 *   post:
 *     summary: 发送验证码
 *     tags: [通用管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               type:
 *                 type: string
 *                 description: 验证码类型（可选，login/register/reset-password）
 *                 example: "login"
 *     responses:
 *       200:
 *         description: 验证码发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "验证码发送成功"
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误
 */
const sendSmsCode = async (req, res) => {
  try {
    const { phone, type = 'default' } = req.validatedData;

    // 检查是否已有未过期的验证码
    const hasExistingCode = await hasCode(phone, type);
    if (hasExistingCode) {
      const remainingSeconds = await getRemainingSeconds(phone, type);
      return res.error(
        'COMMON.VERIFY_CODE_EXIST',
        400,
        new Error(`验证码已发送，请${remainingSeconds}秒后再试`),
        req
      );
    }

    // 生成验证码
    const code = generateCode();

    // 保存验证码（5分钟有效期）
    const saved = await saveCode(phone, code, 5, type);
    if (!saved) {
      return res.error(
        'COMMON.INTERNAL_ERROR',
        500,
        new Error('验证码保存失败'),
        req
      );
    }

    // 尝试发送短信
    let sendResult = { success: false, mock: false };
    const smsConfigured = isConfigured();

    if (smsConfigured) {
      // 配置了腾讯云短信，尝试发送
      sendResult = await sendVerificationCode(phone, code, 5);
    } else {
      // 未配置短信服务，使用模拟模式
      sendResult = { success: true, mock: true };
    }

    // 记录日志
    if (sendResult.mock) {
      console.log(
        `[短信验证码] 手机号: ${phone}, 验证码: ${code}, 类型: ${type} (模拟模式)`
      );
    } else if (sendResult.success) {
      console.log(
        `[短信验证码] 手机号: ${phone}, 验证码: ${code}, 类型: ${type} (发送成功)`
      );
    } else {
      console.error(
        `[短信验证码] 手机号: ${phone}, 验证码: ${code}, 类型: ${type} (发送失败: ${sendResult.message})`
      );
    }

    res.success(
      {
        mock: sendResult.mock,
        smsConfigured,
        // 开发环境或模拟模式返回验证码，生产环境不返回
        ...((process.env.NODE_ENV !== 'production' || sendResult.mock) && {
          code,
        }),
        expireMinutes: 5,
        message: sendResult.message,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

module.exports = {
  getStores,
  getProtocol,
  sendSmsCode,
};
