/**
 * 微信小程序后端API服务器
 * 提供会员、订单、积分等功能的RESTful API
 */

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

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// 中间件
app.use(cors(corsOptions)); // 使用配置的CORS策略
app.use(bodyParser.json()); // JSON解析
app.use(bodyParser.urlencoded({ extended: true }));

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
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
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
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`API服务器启动成功`);
  console.log(`端口: ${PORT}`);
  console.log(`环境: ${ENV}`);
  console.log(`访问: http://localhost:${PORT}`);
  console.log('=================================');
});

module.exports = app;
