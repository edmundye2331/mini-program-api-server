const securityService = require('../services/securityService');
const userService = require('../services/userService');

/**
 * @swagger
 * tags:
 *   name: 安全管理
 *   description: 用户安全相关API
 */

/**
 * @swagger
 * /api/v1/security/change-password:
 *   post:
 *     summary: 修改密码
 *     tags: [安全管理]
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
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *                 example: "wx_openid123456"
 *               oldPassword:
 *                 type: string
 *                 description: 旧密码
 *                 example: "old_password123"
 *               newPassword:
 *                 type: string
 *                 description: 新密码
 *                 example: "new_password456"
 *     responses:
 *       200:
 *         description: 密码修改成功
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
 *                   example: "密码修改成功"
 *       400:
 *         description: 请求参数错误或旧密码错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.validatedData;

    await securityService.changePassword(userId, oldPassword, newPassword);

    res.success(null, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/security/bind-phone:
 *   post:
 *     summary: 绑定/更换手机号
 *     tags: [安全管理]
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
 *               - phone
 *               - code
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *                 example: "wx_openid123456"
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 手机号绑定成功
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
 *                   example: "手机号绑定成功"
 *       400:
 *         description: 请求参数错误或验证码错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.bindPhone = async (req, res) => {
  try {
    const { userId, phone, code } = req.validatedData;

    // 验证码校验
    const { verifyCode } = require('../utils/verificationCode');
    const isValidCode = await verifyCode(phone, code, 'bind');

    if (!isValidCode) {
      return res.error(
        'COMMON.VALIDATE_FAILED',
        400,
        new Error('验证码错误或已过期'),
        req
      );
    }

    await securityService.bindPhone(userId, phone);

    res.success(null, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/security/login-logs:
 *   get:
 *     summary: 获取登录记录
 *     tags: [安全管理]
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
 *         description: 获取登录记录成功
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
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "log123456"
 *                           user_id:
 *                             type: string
 *                             example: "wx_openid123456"
 *                           login_type:
 *                             type: string
 *                             example: "phone"
 *                           ip_address:
 *                             type: string
 *                             example: "192.168.1.1"
 *                           user_agent:
 *                             type: string
 *                             example: "Mozilla/5.0 (Macintosh) AppleWebKit/537.36"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           location:
 *                             type: string
 *                             example: "北京, 中国"
 *                     total:
 *                       type: integer
 *                       example: 10
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.getLoginLogs = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const logs = await securityService.getLoginLogs(userId);

    res.success(
      {
        list: logs,
        total: logs.length,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * 记录登录
 */
exports.recordLogin = async (userId, loginType = 'phone', userInfo = {}) =>
  await securityService.recordLogin(userId, loginType, userInfo);

/**
 * @swagger
 * /api/v1/security/delete-account:
 *   post:
 *     summary: 注销账号
 *     tags: [安全管理]
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
 *         description: 账号注销成功
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
 *                   example: "账号注销成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    await securityService.deleteAccount(userId);

    res.success(null, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};
