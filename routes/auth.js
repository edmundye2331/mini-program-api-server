/**
 * 认证相关路由
 * 包括token刷新、注销等功能
 */

const express = require('express');

const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { refreshAccessToken } = require('../utils/jwt');
const { addToBlacklist } = require('../utils/jwt-blacklist');
const { verifyToken } = require('../utils/jwt');

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: 使用刷新token获取新的访问token
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新token
 *     responses:
 *       200:
 *         description: 获取新的访问token成功
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
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn:
 *                       type: string
 *                       example: "7d"
 *                 message:
 *                   type: string
 *                   example: "获取新的访问token成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 无效的刷新token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.error('COMMON.BAD_REQUEST', 400, '缺少刷新token', req);
    }

    const result = refreshAccessToken(refreshToken);

    if (!result.success) {
      return res.error('USER.INVALID_TOKEN', 401, result.error, req);
    }

    res.success(
      {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('刷新token错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: 注销登录
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 可选的刷新token
 *     responses:
 *       200:
 *         description: 注销成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "注销成功"
 *       401:
 *         description: 未授权
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { token } = req;

    // 解析token获取过期时间
    const decoded = verifyToken(token);
    if (decoded.success) {
      const expiresIn = decoded.data.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        // 将当前访问token加入黑名单
        await addToBlacklist(token, expiresIn);
      }
    }

    // 如果提供了刷新token，也将其加入黑名单
    if (refreshToken) {
      const refreshDecoded = verifyToken(refreshToken);
      if (refreshDecoded.success) {
        const expiresIn =
          refreshDecoded.data.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await addToBlacklist(refreshToken, expiresIn);
        }
      }
    }

    res.success({}, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('注销登录错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
});

module.exports = router;
