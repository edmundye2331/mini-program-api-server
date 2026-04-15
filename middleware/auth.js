/**
 * 认证中间件
 * 使用JWT验证用户身份
 */

const { verifyToken, extractToken } = require('../utils/jwt');
const { db } = require('../config/mysql');

/**
 * JWT认证中间件
 * 验证请求中的JWT token，并提取用户信息
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers['authorization'] || req.headers['x-token'];

    if (!authHeader) {
      return res.error('未提供认证令牌', 401, { code: 'NO_TOKEN' });
    }

    // 提取token
    const token = extractToken(authHeader);

    if (!token) {
      return res.error('令牌格式错误', 401, { code: 'INVALID_TOKEN_FORMAT' });
    }

    // 验证token
    const verification = verifyToken(token);

    if (!verification.success) {
      return res.error('令牌无效或已过期', 401, {
        code: 'TOKEN_VERIFICATION_FAILED',
        error: verification.error
      });
    }

    // 获取token中的用户信息
    const { userId, phone } = verification.data;

    // 验证用户是否仍然存在
    const user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('用户不存在', 401, { code: 'USER_NOT_FOUND' });
    }

    // 将用户信息附加到请求对象
    req.user = {
      id: userId,
      phone: phone || user.phone,
      ...user
    };

    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.error('认证过程出错', 500, { code: 'AUTH_ERROR' });
  }
};

/**
 * 可选的认证中间件
 * 如果提供了token则验证，如果没有提供则跳过
 * 用于某些既可以登录也可以不登录访问的接口
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-token'];

    if (!authHeader) {
      // 没有token，继续处理请求，但不附加用户信息
      req.user = null;
      return next();
    }

    const token = extractToken(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    const verification = verifyToken(token);

    if (!verification.success) {
      req.user = null;
      return next();
    }

    const { userId } = verification.data;
    const user = await db.findOne('users', { id: userId });

    if (user) {
      req.user = {
        id: userId,
        phone: user.phone,
        ...user
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
