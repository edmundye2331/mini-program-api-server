/**
 * 腾讯云验证码服务配置
 */

const tencentcloud = require('tencentcloud-sdk-nodejs-captcha');

// 配置
const CAPTCHA_CONFIG = {
  secretId: process.env.TENCENT_SECRET_ID || '',
  secretKey: process.env.TENCENT_SECRET_KEY || '',
  captchaAppId: process.env.TENCENT_CAPTCHA_APP_ID || '',
  appSecretKey: process.env.TENCENT_CAPTCHA_SECRET_KEY || '',
  region: process.env.TENCENT_CAPTCHA_REGION || 'ap-guangzhou',
};

// 腾讯云Captcha客户端
let captchaClient = null;

/**
 * 初始化Captcha客户端
 */
function initCaptchaClient() {
  if (!captchaClient) {
    const CaptchaClient = tencentcloud.captcha.v20190722.Client;
    const clientConfig = {
      credential: {
        secretId: CAPTCHA_CONFIG.secretId,
        secretKey: CAPTCHA_CONFIG.secretKey,
      },
      region: CAPTCHA_CONFIG.region,
      profile: {
        httpProfile: {
          endpoint: 'captcha.tencentcloudapi.com',
        },
      },
    };
    captchaClient = new CaptchaClient(clientConfig);
  }
  return captchaClient;
}

/**
 * 检查是否配置了腾讯云验证码
 */
function isConfigured() {
  return !!(
    CAPTCHA_CONFIG.secretId &&
    CAPTCHA_CONFIG.secretKey &&
    CAPTCHA_CONFIG.captchaAppId &&
    CAPTCHA_CONFIG.appSecretKey
  );
}

/**
 * 验证参数合法性
 * @param {String} ticket - 验证码票据
 * @param {String} randstr - 随机字符串
 * @returns {Object} 验证结果
 */
function validateCaptchaParams(ticket, randstr) {
  const errors = [];

  // 检查Ticket
  if (!ticket) {
    errors.push('Ticket 不能为空');
  } else if (typeof ticket !== 'string') {
    errors.push('Ticket 必须是字符串');
  } else if (ticket.trim().length === 0) {
    errors.push('Ticket 不能为空字符串');
  } else if (ticket.length < 10 || ticket.length > 500) {
    errors.push(`Ticket 长度不合法 (当前: ${ticket.length}, 范围: 10-500)`);
  }

  // 检查Randstr
  if (!randstr) {
    errors.push('Randstr 不能为空');
  } else if (typeof randstr !== 'string') {
    errors.push('Randstr 必须是字符串');
  } else if (randstr.trim().length === 0) {
    errors.push('Randstr 不能为空字符串');
  } else if (randstr.length < 10 || randstr.length > 50) {
    errors.push(`Randstr 长度不合法 (当前: ${randstr.length}, 范围: 10-50)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证验证码
 * @param {String} ticket - 验证码票据
 * @param {String} randstr - 随机字符串
 * @param {String} userIp - 用户IP
 * @returns {Promise<Object>} 验证结果
 */
async function verifyCaptcha(ticket, randstr, userIp = '127.0.0.1') {
  try {
    // 如果没有配置腾讯云验证码，返回验证成功（开发模式）
    if (!isConfigured()) {
      console.warn('[腾讯云验证码] 未配置，使用模拟验证');
      return { success: true, mock: true };
    }

    // 验证参数
    const paramValidation = validateCaptchaParams(ticket, randstr);
    if (!paramValidation.isValid) {
      const errorMsg = paramValidation.errors.join('; ');
      console.warn(`[腾讯云验证码] 参数验证失败: ${errorMsg}`);
      return {
        success: false,
        message: `参数验证失败: ${errorMsg}`,
        code: 'INVALID_PARAMS',
      };
    }

    const client = initCaptchaClient();

    // 检查配置
    if (!CAPTCHA_CONFIG.captchaAppId || !CAPTCHA_CONFIG.appSecretKey) {
      console.error('[腾讯云验证码] 配置不完整: CaptchaAppId 或 AppSecretKey 未设置');
      return {
        success: false,
        message: '服务配置不完整',
        code: 'CONFIG_ERROR',
      };
    }

    const params = {
      CaptchaAppId: parseInt(CAPTCHA_CONFIG.captchaAppId),
      AppSecretKey: CAPTCHA_CONFIG.appSecretKey,
      Ticket: ticket.trim(),
      Randstr: randstr.trim(),
      UserIp: userIp,
      CaptchaType: 9, // 固定值，腾讯云验证码类型
    };

    console.info(`[腾讯云验证码] 发送验证请求 - AppId: ${params.CaptchaAppId}, UserIp: ${userIp}`);

    const response = await client.DescribeCaptchaResult(params);

    console.info(`[腾讯云验证码] 收到响应 - Code: ${response.CaptchaCode}, Msg: ${response.CaptchaMsg}`);

    // CaptchaCode返回1表示验证通过
    if (response.CaptchaCode === 1) {
      console.log(`[腾讯云验证码] 验证成功: ${response.CaptchaMsg}`);
      return { success: true, message: response.CaptchaMsg };
    }

    // 处理不同的错误代码
    const errorCodeMap = {
      '15': '传入的Ticket不合法或已过期 - 请检查Ticket和Randstr是否正确',
      '16': 'Randstr不合法',
      '17': '票据验证超时',
      '18': 'Ticket/Randstr不匹配',
    };

    const userMessage = errorCodeMap[response.CaptchaCode] || response.CaptchaMsg || '验证失败';

    console.warn(`[腾讯云验证码] 验证失败: ${response.CaptchaCode} - ${userMessage}`);
    return {
      success: false,
      message: userMessage,
      code: response.CaptchaCode,
      details: response.CaptchaMsg,
    };
  } catch (error) {
    console.error('[腾讯云验证码] 验证错误:', {
      message: error.message,
      code: error.code,
      requestId: error.requestId,
    });
    return { 
      success: false, 
      message: error.message || '验证请求失败',
      code: 'REQUEST_ERROR',
    };
  }
}

module.exports = {
  isConfigured,
  verifyCaptcha,
  validateCaptchaParams,
  CAPTCHA_CONFIG,
};
