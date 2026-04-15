/**
 * 日志中间件
 * 记录请求和响应日志
 */

const fs = require('fs');
const path = require('path');
const { formatDate } = require('../config/mysql');

// 日志目录
const logDir = path.join(__dirname, '../logs');

// 创建日志目录
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 创建日志文件
const accessLogStream = fs.createWriteStream(
  path.join(logDir, `access-${new Date().toISOString().split('T')[0]}.log`),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`),
  { flags: 'a' }
);

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'unknown';
  const userId = req.user?.id || 'anonymous';

  // 记录请求开始
  console.log(`[${formatDate()}] ${method} ${originalUrl} - ${ip} - ${userId} - ${userAgent}`);

  // 记录响应
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logMessage = `[${formatDate()}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${userId} - ${ip}\n`;

    // 写入访问日志
    accessLogStream.write(logMessage);

    // 错误状态码写入错误日志
    if (statusCode >= 400) {
      errorLogStream.write(logMessage);
    }
  });

  next();
};

/**
 * 错误日志中间件
 */
const errorLogger = (err, req, res, next) => {
  const errorMessage = `[${formatDate()}] ${err.stack || err.message}\n`;

  // 记录错误堆栈
  console.error(`[${formatDate()}] 服务器错误:`, err);

  // 写入错误日志
  errorLogStream.write(errorMessage);

  next(err);
};

/**
 * 关闭日志流
 */
const closeLogStreams = () => {
  accessLogStream.end();
  errorLogStream.end();
};

module.exports = {
  requestLogger,
  errorLogger,
  closeLogStreams
};
