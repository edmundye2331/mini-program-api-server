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
    const authHeader = req.headers.authorization || req.headers['x-token'];

    if (!authHeader) {
      return res.error('USER.UNAUTHORIZED', 401, null, req);
    }

    // 提取token
    const token = extractToken(authHeader);

    if (!token) {
      return res.error('USER.INVALID_TOKEN', 401, null, req);
    }

    // 检查token是否在黑名单中（已注销）
    const { isTokenBlacklisted } = require('../utils/jwt-blacklist');
    const blacklisted = await isTokenBlacklisted(token);

    if (blacklisted) {
      return res.error('USER.TOKEN_EXPIRED', 401, 'Token已被注销', req);
    }

    // 验证token
    const { secret } = require('../config/jwt');
    const verification = verifyToken(token);

    if (!verification.success) {
      return res.error('USER.INVALID_TOKEN', 401, verification.error, req);
    }

    // 获取token中的用户信息
    const { userId, phone } = verification.data;

    // 验证用户是否仍然存在
    const user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 401, null, req);
    }

    // 将用户信息和token附加到请求对象
    req.user = {
      id: userId,
      phone: phone || user.phone,
      ...user,
    };
    req.token = token;

    next();
  } catch (error) {
    // 生产环境移除console.error
    if (process.env.NODE_ENV !== 'production') {
      console.error('认证中间件错误:', error);
    }
    return res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * 可选的认证中间件
 * 如果提供了token则验证，如果没有提供则跳过
 * 用于某些既可以登录也可以不登录访问的接口
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-token'];

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
        ...user,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // 生产环境移除console.error
    if (process.env.NODE_ENV !== 'production') {
      console.error('可选认证中间件错误:', error);
    }
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
