/**
 * JWT工具模块
 * 用于生成和验证JSON Web Token
 */

// 首先加载环境变量
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');

/**
 * 生成JWT token
 * @param {Object} payload - 要编码的数据
 * @param {String} payload.userId - 用户ID
 * @param {String} payload.phone - 手机号
 * @param {String} tokenType - token类型（'access' 或 'refresh'）
 * @returns {String} JWT token
 */
const generateToken = (payload, tokenType = 'access') => {
  // 根据token类型设置不同的过期时间
  const tokenExpiresIn =
    tokenType === 'access'
      ? expiresIn
      : process.env.JWT_REFRESH_EXPIRES_IN || '30d'; // 刷新token默认30天过期

  return jwt.sign(
    {
      userId: payload.userId,
      phone: payload.phone,
      tokenType,
    },
    secret,
    {
      expiresIn: tokenExpiresIn,
      issuer: 'miniprogram-api',
    }
  );
};

/**
 * 生成访问token和刷新token
 * @param {Object} payload - 要编码的数据
 * @returns {Object} 包含accessToken和refreshToken的对象
 */
const generateTokenPair = (payload) => {
  const accessToken = generateToken(payload, 'access');
  const refreshToken = generateToken(payload, 'refresh');

  return {
    accessToken,
    refreshToken,
    expiresIn,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  };
};

/**
 * 验证JWT token
 * @param {String} token - JWT token
 * @returns {Object} 解码后的数据
 * @throws {Error} 如果token无效或过期
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 从请求头中提取token
 * @param {String} authHeader - Authorization header值
 * @returns {String|null} 提取的token或null
 */
const extractToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // 支持 "Bearer <token>" 格式
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  // 直接返回token
  return authHeader;
};

/**
 * 验证刷新token
 * @param {String} refreshToken - 刷新token
 * @returns {Object} 验证结果
 */
const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, secret);

    // 验证token类型是否为refresh
    if (decoded.tokenType !== 'refresh') {
      return {
        success: false,
        error: 'Token类型错误，必须是刷新token',
      };
    }

    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 使用刷新token获取新的访问token
 * @param {String} refreshToken - 刷新token
 * @returns {Object} 包含新访问token的对象
 */
const refreshAccessToken = (refreshToken) => {
  const verification = verifyRefreshToken(refreshToken);

  if (!verification.success) {
    return {
      success: false,
      error: verification.error,
    };
  }

  // 使用刷新token中的用户信息生成新的访问token
  const newAccessToken = generateToken(
    {
      userId: verification.data.userId,
      phone: verification.data.phone,
    },
    'access'
  );

  return {
    success: true,
    accessToken: newAccessToken,
    expiresIn,
  };
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  verifyRefreshToken,
  refreshAccessToken,
  generateTokenPair,
  JWT_SECRET: secret,
  JWT_EXPIRES_IN: expiresIn,
};
