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

// 当前日志文件日期
let currentLogDate = new Date().toISOString().split('T')[0];

// 创建日志文件流
let accessLogStream = createLogStream('access');
let errorLogStream = createLogStream('error');

/**
 * 创建日志文件流
 */
function createLogStream(type) {
  return fs.createWriteStream(
    path.join(logDir, `${type}-${currentLogDate}.log`),
    { flags: 'a' }
  );
}

/**
 * 检查并轮换日志文件
 */
function rotateLogsIfNeeded() {
  const today = new Date().toISOString().split('T')[0];
  if (today !== currentLogDate) {
    currentLogDate = today;

    // 关闭旧流
    accessLogStream.end();
    errorLogStream.end();

    // 创建新流
    accessLogStream = createLogStream('access');
    errorLogStream = createLogStream('error');

    // 清理旧日志
    cleanOldLogs();
  }
}

/**
 * 清理旧日志文件（保留最近30天）
 */
function cleanOldLogs() {
  try {
    const files = fs.readdirSync(logDir);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);

      // 删除30天前的日志文件
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`[日志清理] 已删除旧日志: ${file}`);
      }
    });
  } catch (error) {
    console.error('[日志清理] 清理失败:', error.message);
  }
}

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  // 检查是否需要轮换日志
  rotateLogsIfNeeded();

  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'unknown';
  const userId = req.user?.id || 'anonymous';

  // 记录请求开始
  console.log(
    `[${formatDate()}] ${method} ${originalUrl} - ${ip} - ${userId} - ${userAgent}`
  );

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

// 启动时清理一次旧日志
cleanOldLogs();

module.exports = {
  requestLogger,
  errorLogger,
  closeLogStreams,
};
