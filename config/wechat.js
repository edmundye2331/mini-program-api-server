/**
 * 微信小程序配置文件
 */

module.exports = {
  appId: process.env.WX_APP_ID || 'wxcc4248914666b416',
  appSecret: process.env.WX_APP_SECRET || '742d9efb84d493e134f36cb3aafddef1',
  mchId: process.env.WX_PAY_MCH_ID || '',
  serialNo: process.env.WX_PAY_SERIAL_NO || '',
  apiv3Key: process.env.WX_PAY_APIV3_KEY || '',
};
