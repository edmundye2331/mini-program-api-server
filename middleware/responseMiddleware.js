/**
 * 统一响应格式中间件
 */

// 成功响应
const successResponse = (res, data = null, message = '请求成功', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: data
  });
};

// 错误响应
const errorResponse = (res, message = '请求失败', statusCode = 400, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  });
};

// 统一响应中间件
const responseMiddleware = (req, res, next) => {
  res.success = successResponse.bind(null, res);
  res.error = errorResponse.bind(null, res);
  next();
};

module.exports = {
  responseMiddleware,
  successResponse,
  errorResponse
};
