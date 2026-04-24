/**
 * JWT配置文件
 */

// 确保环境变量在加载配置前已加载
require('dotenv').config();

module.exports = {
  secret:
    process.env.JWT_SECRET ||
    'your_default_jwt_secret_key_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
