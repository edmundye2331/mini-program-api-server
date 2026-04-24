/**
 * 微信小程序后端API服务器
 * 提供会员、订单、积分等功能的RESTful API
 */

// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { corsOptions } = require('./config/cors');
const setupSwagger = require('./config/swagger');

// 导入路由
const userRoutes = require('./routes/user');
const memberRoutes = require('./routes/member');
const orderRoutes = require('./routes/order');
const pointsRoutes = require('./routes/points');
const commonRoutes = require('./routes/common');
const goodsRoutes = require('./routes/goods');
const securityRoutes = require('./routes/security');
const birthdayRoutes = require('./routes/birthday');
const authRoutes = require('./routes/auth');

// 导入响应中间件
const { responseMiddleware } = require('./middleware/responseMiddleware');
// 导入安全中间件
const securityMiddleware = require('./middleware/securityMiddleware');
// 导入安全头中间件
const securityHeadersMiddleware = require('./middleware/securityHeaders');
// 导入日志中间件
const { requestLogger, errorLogger } = require('./middleware/loggerMiddleware');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// 应用安全中间件
securityMiddleware(app);

// 应用安全头中间件
securityHeadersMiddleware(app);

// 应用日志中间件
app.use(requestLogger);

// 中间件
app.use(cors(corsOptions)); // 使用配置的CORS策略
app.use(bodyParser.json({ limit: '10mb' })); // JSON解析，限制大小防止DoS
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(responseMiddleware); // 统一响应格式中间件

// 静态文件服务 - 用于上传的商品图片
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 速率限制中间件
const rateLimiter = require('./middleware/rateLimiter');

app.use('/api/', rateLimiter.generalLimiter); // 通用速率限制
app.use('/api/user/login/phone', rateLimiter.loginLimiter); // 登录速率限制
app.use('/api/user/login/wechat', rateLimiter.loginLimiter); // 微信登录速率限制
app.use('/api/common/sms/send', rateLimiter.smsLimiter); // 短信发送速率限制
app.use('/api/order/create', rateLimiter.orderLimiter); // 订单创建速率限制
app.use('/api/order/pay', rateLimiter.paymentLimiter); // 支付速率限制

// API签名验证中间件
const apiSignatureMiddleware = require('./middleware/apiSignatureMiddleware');

const API_SIGNATURE_SECRET = process.env.API_SIGNATURE_SECRET;
if (API_SIGNATURE_SECRET) {
  app.use('/api/', apiSignatureMiddleware(API_SIGNATURE_SECRET));
} else {
  console.warn('⚠️ API_SIGNATURE_SECRET 未配置，跳过签名验证中间件');
}

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method } = req;
  const { path } = req;
  const origin = req.headers.origin || 'unknown';

  console.log(`[${timestamp}] ${method} ${path} - Origin: ${origin}`);
  next();
});

// API路由 - 添加版本控制
const API_VERSION = '/api/v1';
app.use(`${API_VERSION}/user`, userRoutes);
app.use(`${API_VERSION}/member`, memberRoutes);
app.use(`${API_VERSION}/order`, orderRoutes);
app.use(`${API_VERSION}/points`, pointsRoutes);
app.use(`${API_VERSION}/common`, commonRoutes);
app.use(`${API_VERSION}/goods`, goodsRoutes);
app.use(`${API_VERSION}/security`, securityRoutes);
app.use(`${API_VERSION}/birthday`, birthdayRoutes);
app.use(`${API_VERSION}/auth`, authRoutes);

// 静态文件服务 - 限制可访问的文件类型和目录
const staticFilesOptions = {
  dotfiles: 'ignore', // 忽略隐藏文件
  etag: true,
  extensions: [
    'html',
    'htm',
    'css',
    'js',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'svg',
    'ico',
    'json',
  ],
  index: ['index.html'],
};
app.use(express.static(path.join(__dirname, 'public'), staticFilesOptions));

// 配置Swagger文档（仅开发环境）
if (ENV === 'development') {
  setupSwagger(app);
}

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    const dbHealthy = await require('./config/mysql').testConnection();

    // 检查Redis连接（如果配置了Redis）
    let redisHealthy = true;
    try {
      const redisClient = await require('./config/redis').getRedisClient();
      await redisClient.ping();
    } catch (redisError) {
      console.warn('Redis连接检查失败:', redisError.message);
      redisHealthy = false;
    }

    res.success(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
        environment: ENV,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('健康检查失败:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
});

// 根路径
app.get('/', (req, res) => {
  res.success(
    {
      message: '微信小程序API服务器',
      version: '1.0.0',
      environment: ENV,
      endpoints: {
        user: '/api/user',
        member: '/api/member',
        order: '/api/order',
        points: '/api/points',
        common: '/api/common',
        goods: '/api/goods',
        security: '/api/security',
        birthday: '/api/birthday',
        health: '/health',
      },
    },
    'COMMON.SUCCESS',
    200,
    req
  );
});

// 404处理
app.use((req, res) => {
  // 如果是静态文件请求且不存在，返回404
  if (req.path.startsWith('/images/') || req.path.startsWith('/pages/')) {
    res.error('COMMON.NOT_FOUND', 404, null, req);
  } else {
    // API请求不存在的接口
    res.error('COMMON.NOT_FOUND', 404, null, req);
  }
});

// CORS错误处理
app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    console.error('CORS错误:', err.message);
    return res.error('COMMON.FORBIDDEN', 403, err, req);
  }
  next(err);
});

// 错误日志中间件
app.use(errorLogger);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);

  // 如果已经通过res.error发送了响应，就不要再发送了
  if (res.headersSent) {
    return next(err);
  }

  res.error('COMMON.INTERNAL_ERROR', 500, err, req);
});

// 启动服务器
const { testConnection } = require('./config/mysql.js');
const { getRedisClient } = require('./config/redis');
const { closeLogStreams } = require('./middleware/loggerMiddleware');

// 初始化Redis客户端，但如果失败也不影响服务器启动
testConnection().then(() => {
  getRedisClient().catch((err) => {
    console.warn(
      '⚠️ Redis连接失败，服务器将继续运行但缓存功能不可用:',
      err.message
    );
  });

  const server = app.listen(PORT, () => {
    console.log('=================================');
    console.log(`API服务器启动成功`);
    console.log(`端口: ${PORT}`);
    console.log(`环境: ${ENV}`);
    console.log(`访问: http://localhost:${PORT}`);
    console.log('=================================');
  });

  // 优雅关闭服务器
  process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    server.close(() => {
      console.log('服务器已关闭');
      closeLogStreams();
      process.exit(0);
    });
  });

  // 优雅关闭服务器
  process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    server.close(() => {
      console.log('服务器已关闭');
      closeLogStreams();
      process.exit(0);
    });
  });
});

module.exports = app;
