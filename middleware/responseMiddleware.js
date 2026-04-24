/**
 * 统一响应格式中间件
 */

const errorCodes = require('../config/errorCodes');
const { maskUserData } = require('../utils/dataMasking');

// 获取当前语言
const getCurrentLanguage = (req) => {
  // 从请求头获取语言，默认中文
  const lang = req.headers['accept-language'] || 'zh';
  return lang.split(',')[0];
};

// 成功响应
const successResponse = (
  res,
  data = null,
  messageKey = 'COMMON.SUCCESS',
  statusCode = 200,
  req = null
) => {
  let message;

  if (req) {
    const lang = getCurrentLanguage(req);
    if (errorCodes[messageKey] && errorCodes[messageKey].message[lang]) {
      message = errorCodes[messageKey].message[lang];
    } else if (errorCodes[messageKey] && errorCodes[messageKey].message.zh) {
      message = errorCodes[messageKey].message.zh;
    } else {
      message = messageKey;
    }
  } else {
    message = messageKey;
  }

  // 对敏感数据进行脱敏处理
  let maskedData = data;
  if (data && typeof data === 'object') {
    // 处理单个用户对象
    if (
      data.phone ||
      data.id_card ||
      data.idCard ||
      data.bank_card ||
      data.bankCard
    ) {
      maskedData = maskUserData(data);
    }
    // 处理用户数组
    else if (Array.isArray(data)) {
      maskedData = data.map((item) => {
        if (
          item &&
          typeof item === 'object' &&
          (item.phone || item.id_card || item.idCard)
        ) {
          return maskUserData(item);
        }
        return item;
      });
    }
    // 处理包含data属性的对象（如分页数据）
    else if (data.data && Array.isArray(data.data)) {
      maskedData = {
        ...data,
        data: data.data.map((item) => {
          if (
            item &&
            typeof item === 'object' &&
            (item.phone || item.id_card || item.idCard)
          ) {
            return maskUserData(item);
          }
          return item;
        }),
      };
    }
  }

  return res.status(statusCode).json({
    success: true,
    message,
    data: maskedData,
  });
};

// 错误响应
const errorResponse = (
  res,
  messageOrCode = 'COMMON.BAD_REQUEST',
  statusCode = 400,
  error = null,
  req = null
) => {
  let message;
  let code;

  if (req) {
    const lang = getCurrentLanguage(req);
    // 解析错误码
    if (typeof messageOrCode === 'string' && messageOrCode.includes('.')) {
      const [module, errorKey] = messageOrCode.split('.');
      if (errorCodes[module] && errorCodes[module][errorKey]) {
        code = errorCodes[module][errorKey].code;
        if (errorCodes[module][errorKey].message[lang]) {
          message = errorCodes[module][errorKey].message[lang];
        } else if (errorCodes[module][errorKey].message.zh) {
          message = errorCodes[module][errorKey].message.zh;
        } else {
          message = messageOrCode;
        }
      } else {
        message = messageOrCode;
        code = '99999';
      }
    } else {
      message = messageOrCode;
      code = '99999';
    }
  } else {
    message = messageOrCode;
    code = '99999';
  }

  const response = {
    success: false,
    code,
    message,
    data: null,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

// 统一响应中间件
const responseMiddleware = (req, res, next) => {
  // 正确的绑定方式，避免参数顺序问题
  res.success = (data, messageKey = 'COMMON.SUCCESS', statusCode = 200) =>
    successResponse(res, data, messageKey, statusCode, req);

  res.error = (
    messageOrCode = 'COMMON.BAD_REQUEST',
    statusCode = 400,
    error = null
  ) => errorResponse(res, messageOrCode, statusCode, error, req);

  next();
};

module.exports = {
  responseMiddleware,
  successResponse,
  errorResponse,
};
