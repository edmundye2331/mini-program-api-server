/**
 * 速率限制中间件
 * 防止API滥用和DDoS攻击
 */

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * 通用速率限制配置
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟',
  },
  standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` 头中
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 头
  // 跳过成功的请求（只计算失败的请求）
  skipSuccessfulRequests: false,
  // 跳过失败的请求
  skipFailedRequests: false,
});

/**
 * 严格的速率限制（用于敏感操作）
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制5个请求
  message: {
    success: false,
    message: '该操作请求过于频繁，请15分钟后再试',
    retryAfter: '15分钟',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 登录速率限制
 * 防止暴力破解
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 限制10次登录尝试
  message: {
    success: false,
    message: '登录尝试次数过多，请15分钟后再试',
    retryAfter: '15分钟',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 基于IP地址和手机号进行限制
  keyGenerator: (req) =>
    `${ipKeyGenerator(req)}:${
      req.body.phone || req.body.username || 'unknown'
    }`,
});

/**
 * 验证码速率限制
 */
const smsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 限制5条短信
  message: {
    success: false,
    message: '验证码发送次数过多，请1小时后再试',
    retryAfter: '1小时',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 基于手机号进行限制
  keyGenerator: (req) =>
    `${ipKeyGenerator(req)}:${req.body.phone || 'unknown'}`,
});

/**
 * 订单创建速率限制
 * 防止恶意下单
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 20, // 限制20个订单
  message: {
    success: false,
    message: '订单创建次数过多，请稍后再试',
    retryAfter: '1小时',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 支付速率限制
 */
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10分钟
  max: 10, // 限制10次支付
  message: {
    success: false,
    message: '支付请求过于频繁，请稍后再试',
    retryAfter: '10分钟',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * IP白名单检查
 * 某些IP可以跳过速率限制
 */
const whitelist = ['127.0.0.1', '::1'];

const createWhitelistLimiter = (limiter) => (req, res, next) => {
  if (whitelist.includes(req.ip)) {
    return next(); // 跳过速率限制
  }
  return limiter(req, res, next);
};

module.exports = {
  generalLimiter,
  strictLimiter,
  loginLimiter,
  smsLimiter,
  orderLimiter,
  paymentLimiter,
  createWhitelistLimiter,
  whitelist,
};
