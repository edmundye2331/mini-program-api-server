/**
 * JWT工具模块
 * 用于生成和验证JSON Web Token
 */

const jwt = require('jsonwebtoken');

// JWT密钥 - 生产环境应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // token有效期7天

/**
 * 生成JWT token
 * @param {Object} payload - 要编码的数据
 * @param {String} payload.userId - 用户ID
 * @param {String} payload.phone - 手机号
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      phone: payload.phone
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'miniprogram-api'
    }
  );
};

/**
 * 验证JWT token
 * @param {String} token - JWT token
 * @returns {Object} 解码后的数据
 * @throws {Error} 如果token无效或过期
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
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

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
