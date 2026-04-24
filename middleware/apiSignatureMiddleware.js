/**
 * API签名验证中间件
 * 用于验证API请求的签名，防止API被篡改或重放攻击
 */

const crypto = require('crypto');

/**
 * 验证API请求签名
 * @param {String} secretKey - 签名密钥
 * @param {Object} params - 请求参数（不包含签名参数）
 * @param {String} signature - 待验证的签名
 * @param {String} timestamp - 请求时间戳
 * @param {Number} [expireTime=300] - 签名过期时间（秒），默认5分钟
 * @returns {Boolean} 签名是否有效
 */
const verifyAPISignature = (
  secretKey,
  params,
  signature,
  timestamp,
  expireTime = 300
) => {
  // 检查签名是否为空
  if (!signature || !timestamp) {
    return false;
  }

  // 检查时间戳是否过期
  const now = Date.now() / 1000;
  const reqTimestamp = parseFloat(timestamp);

  if (Math.abs(now - reqTimestamp) > expireTime) {
    return false;
  }

  // 对参数进行字典序排序
  const sortedParams = {};
  Object.keys(params)
    .sort()
    .forEach((key) => {
      // 排除签名相关的参数
      if (key !== 'signature' && key !== 'timestamp' && key !== 'sign') {
        sortedParams[key] = params[key];
      }
    });

  // 构建签名字符串
  const paramString = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');

  const signString = `${paramString}&timestamp=${timestamp}`;

  // 计算签名
  const calculatedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(signString)
    .digest('hex');

  return calculatedSignature === signature;
};

/**
 * API签名验证中间件工厂函数
 * @param {String} secretKey - 签名密钥
 * @param {Number} [expireTime=300] - 签名过期时间（秒）
 * @returns {Function} 中间件函数
 */
const apiSignatureMiddleware =
  (secretKey, expireTime = 300) =>
  (req, res, next) => {
    // 检查是否配置了跳过签名验证
    if (process.env.SKIP_API_SIGNATURE === 'true') {
      return next();
    }

    const currentEnv = process.env.NODE_ENV || 'development';
    const signature = req.headers['x-api-signature'] || req.body.signature;
    const timestamp = req.headers['x-api-timestamp'] || req.body.timestamp;

    // 开发/测试环境：如果没有提供签名则跳过验证，否则正常验证
    if ((currentEnv === 'development' || currentEnv === 'test') && !signature && !timestamp) {
      console.warn(`[签名验证] ${currentEnv}环境未提供签名，跳过验证`);
      return next();
    }

    // 生产环境或已提供签名时必须验证
    if (!signature || !timestamp) {
      return res.error('COMMON.FORBIDDEN', 403, '缺少API签名或时间戳', req);
    }

    // 合并请求参数
    const params = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const isValid = verifyAPISignature(
      secretKey,
      params,
      signature,
      timestamp,
      expireTime
    );

    if (!isValid) {
      return res.error('COMMON.FORBIDDEN', 403, 'API签名无效或已过期', req);
    }

    next();
  };

module.exports = apiSignatureMiddleware;
