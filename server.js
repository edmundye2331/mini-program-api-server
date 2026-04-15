/**
 * 微信小程序后端API服务器
 * 提供会员、订单、积分等功能的RESTful API
 */

// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { corsOptions } = require('./config/cors');

// 导入路由
const userRoutes = require('./routes/user');
const memberRoutes = require('./routes/member');
const orderRoutes = require('./routes/order');
const pointsRoutes = require('./routes/points');
const commonRoutes = require('./routes/common');
const goodsRoutes = require('./routes/goods');
const securityRoutes = require('./routes/security');
const birthdayRoutes = require('./routes/birthday');

// 导入响应中间件
const { responseMiddleware } = require('./middleware/responseMiddleware');
// 导入安全中间件
const securityMiddleware = require('./middleware/securityMiddleware');
// 导入日志中间件
const { requestLogger, errorLogger } = require('./middleware/loggerMiddleware');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// 应用安全中间件
securityMiddleware(app);

// 应用日志中间件
app.use(requestLogger);

// 中间件
app.use(cors(corsOptions)); // 使用配置的CORS策略
app.use(bodyParser.json({ limit: '10mb' })); // JSON解析，限制大小防止DoS
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(responseMiddleware); // 统一响应格式中间件

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const origin = req.headers.origin || 'unknown';

  console.log(`[${timestamp}] ${method} ${path} - Origin: ${origin}`);
  next();
});

// API路由
app.use('/api/user', userRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/birthday', birthdayRoutes);

// 静态文件服务
app.use(express.static('public'));

// 根路径
app.get('/', (req, res) => {
  res.json({
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
      birthday: '/api/birthday'
    }
  });
});

// 404处理
app.use((req, res) => {
  // 如果是静态文件请求且不存在，返回404
  if (req.path.startsWith('/images/') || req.path.startsWith('/pages/')) {
    res.status(404).json({
      success: false,
      message: '资源不存在'
    });
  } else {
    // API请求不存在的接口
    res.status(404).json({
      success: false,
      message: '接口不存在'
    });
  }
});

// CORS错误处理
app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    console.error('CORS错误:', err.message);
    return res.status(403).json({
      success: false,
      message: '跨域请求被拒绝',
      error: err.message
    });
  }
  next(err);
});

// 错误日志中间件
app.use(errorLogger);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const { testConnection } = require('./config/mysql.js');
const { closeLogStreams } = require('./middleware/loggerMiddleware');

testConnection().then(() => {
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
