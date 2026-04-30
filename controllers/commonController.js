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
const { isConfigured, verifyCaptcha } = require('../config/tencentCaptcha');

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
 * /api/v1/common/sms/send:
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
 *               captchaTicket:
 *                 type: string
 *                 description: 腾讯云验证码ticket（生产环境必传）
 *                 example: "t03Q38t_2C44..."
 *               captchaRandstr:
 *                 type: string
 *                 description: 腾讯云验证码randstr（生产环境必传）
 *                 example: "@g3G"
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
 *                   type: object
 *                   properties:
 *                     mock:
 *                       type: boolean
 *                       example: true
 *                     captchaConfigured:
 *                       type: boolean
 *                       example: false
 *                     code:
 *                       type: string
 *                       example: "123456"
 *                     expireMinutes:
 *                       type: integer
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *       400:
 *         description: 请求参数错误或验证码验证失败
 *       500:
 *         description: 服务器内部错误
 */
const sendSmsCode = async (req, res) => {
  try {
    const { phone, type = 'default', captchaTicket, captchaRandstr } = req.validatedData;

    // 如果配置了验证码服务，先验证验证码
    const captchaConfigured = isConfigured();
    if (captchaConfigured) {
      if (!captchaTicket || !captchaRandstr) {
        return res.error(
          'COMMON.BAD_REQUEST',
          400,
          new Error('缺少验证码参数'),
          req
        );
      }

      // 验证腾讯云验证码
      const userIp = req.ip || req.ips?.[0] || '127.0.0.1';
      const captchaResult = await verifyCaptcha(captchaTicket, captchaRandstr, userIp);

      if (!captchaResult.success) {
        return res.error(
          'COMMON.CAPTCHA_FAILED',
          400,
          new Error(captchaResult.message || '验证码验证失败'),
          req
        );
      }
    }

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

    // 记录日志
    console.log(
      `[短信验证码] 手机号: ${phone}, 验证码: ${code}, 类型: ${type} (${captchaConfigured ? '已验证' : '无验证'})`
    );

    res.success(
      {
        mock: true,
        captchaConfigured,
        // 开发环境返回验证码，生产环境不返回
        ...(process.env.NODE_ENV !== 'production' && { code }),
        expireMinutes: 5,
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

/**
 * @swagger
 * /api/v1/common/captcha/verify:
 *   post:
 *     summary: 验证腾讯云验证码
 *     tags: [通用管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticket
 *               - randstr
 *             properties:
 *               ticket:
 *                 type: string
 *                 description: 验证码票据
 *                 example: "t03Q38t_2C44..."
 *               randstr:
 *                 type: string
 *                 description: 随机字符串
 *                 example: "@g3G"
 *     responses:
 *       200:
 *         description: 验证成功
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
 *                     mock:
 *                       type: boolean
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: "验证成功"
 *       400:
 *         description: 验证失败
 */
const verifyCaptchaCode = async (req, res) => {
  try {
    const { ticket, randstr } = req.validatedData;
    const userIp = req.ip || req.ips?.[0] || '127.0.0.1';

    const result = await verifyCaptcha(ticket, randstr, userIp);

    if (result.success) {
      res.success(
        { mock: result.mock },
        'COMMON.SUCCESS',
        200,
        req
      );
    } else {
      res.error(
        'COMMON.CAPTCHA_FAILED',
        400,
        new Error(result.message || '验证失败'),
        req
      );
    }
  } catch (error) {
    console.error('验证验证码错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

module.exports = {
  getStores,
  getProtocol,
  sendSmsCode,
  verifyCaptchaCode,
};
