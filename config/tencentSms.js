/**
 * 腾讯云短信服务配置
 */

const tencentcloud = require('tencentcloud-sdk-nodejs');

// 配置
const SMS_CONFIG = {
  secretId: process.env.TENCENT_SECRET_ID || '',
  secretKey: process.env.TENCENT_SECRET_KEY || '',
  appId: process.env.TENCENT_SMS_APP_ID || '',
  signName: process.env.TENCENT_SMS_SIGN_NAME || '',
  templateId: process.env.TENCENT_SMS_TEMPLATE_ID || '',
  region: process.env.TENCENT_SMS_REGION || 'ap-guangzhou',
};

// 腾讯云SMS客户端
let smsClient = null;

/**
 * 初始化SMS客户端
 */
function initSmsClient() {
  if (!smsClient) {
    const SmsClient = tencentcloud.sms.v20210111.Client;
    const clientConfig = {
      credential: {
        secretId: SMS_CONFIG.secretId,
        secretKey: SMS_CONFIG.secretKey,
      },
      region: SMS_CONFIG.region,
      profile: {
        httpProfile: {
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    };
    smsClient = new SmsClient(clientConfig);
  }
  return smsClient;
}

/**
 * 检查是否配置了腾讯云短信
 */
function isConfigured() {
  return !!(
    SMS_CONFIG.secretId &&
    SMS_CONFIG.secretKey &&
    SMS_CONFIG.appId &&
    SMS_CONFIG.signName &&
    SMS_CONFIG.templateId
  );
}

/**
 * 发送短信验证码
 * @param {String} phone - 手机号（需要+86前缀）
 * @param {String} code - 验证码
 * @param {Number} expireMinutes - 过期时间（分钟）
 * @returns {Promise<Object>} 发送结果
 */
async function sendVerificationCode(phone, code, expireMinutes = 5) {
  try {
    // 如果没有配置腾讯云短信，返回模拟成功
    if (!isConfigured()) {
      console.warn('[腾讯云短信] 未配置，使用模拟发送');
      return { success: true, mock: true };
    }

    const client = initSmsClient();

    // 确保手机号格式正确
    const phoneNumber = phone.startsWith('+86') ? phone : `+86${phone}`;

    const params = {
      SmsSdkAppId: SMS_CONFIG.appId,
      SignName: SMS_CONFIG.signName,
      TemplateId: SMS_CONFIG.templateId,
      PhoneNumberSet: [phoneNumber],
      TemplateParamSet: [code, expireMinutes.toString()],
    };

    const response = await client.SendSms(params);
    const sendStatusSet = response.SendStatusSet || [];
    const result = sendStatusSet[0];

    if (result && result.Code === 'Ok') {
      console.log(`[腾讯云短信] 发送成功: ${phone}`);
      return { success: true, message: result.Message };
    }

    console.error(`[腾讯云短信] 发送失败: ${result?.Code} - ${result?.Message}`);
    return { success: false, message: result?.Message || '发送失败' };
  } catch (error) {
    console.error('[腾讯云短信] 发送错误:', error.message);
    return { success: false, message: error.message };
  }
}

module.exports = {
  isConfigured,
  sendVerificationCode,
  SMS_CONFIG,
};
