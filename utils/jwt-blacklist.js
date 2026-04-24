/**
 * JWT Token黑名单工具
 * 用于存储已注销的token，实现单点登录和token失效功能
 */

const {
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
} = require('../config/redis');
const { JWT_SECRET } = require('./jwt');

/**
 * 将token加入黑名单
 * @param {String} token - JWT token
 * @param {Number} expiresIn - token过期时间（秒）
 */
const addToBlacklist = async (token, expiresIn) => {
  const client = await getRedisClient();
  const key = `jwt:blacklist:${token}`;

  // 将token加入黑名单，设置过期时间与token一致
  await setCache(key, true, expiresIn);
};

/**
 * 检查token是否在黑名单中
 * @param {String} token - JWT token
 * @returns {Boolean} true表示token已被注销
 */
const isTokenBlacklisted = async (token) => {
  const client = await getRedisClient();
  const key = `jwt:blacklist:${token}`;

  const result = await getCache(key);
  return result !== null;
};

/**
 * 从黑名单中移除token（通常用于token刷新场景）
 * @param {String} token - JWT token
 */
const removeFromBlacklist = async (token) => {
  const client = await getRedisClient();
  const key = `jwt:blacklist:${token}`;

  await deleteCache(key);
};

/**
 * 清除所有用户的token黑名单（管理员功能）
 */
const clearAllBlacklistTokens = async () => {
  const client = await getRedisClient();
  const keys = await client.keys('jwt:blacklist:*');

  if (keys.length > 0) {
    await client.del(keys);
  }
};

/**
 * 获取黑名单中的token数量
 * @returns {Number} 黑名单中的token数量
 */
const getBlacklistTokenCount = async () => {
  const client = await getRedisClient();
  const keys = await client.keys('jwt:blacklist:*');

  return keys.length;
};

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
  removeFromBlacklist,
  clearAllBlacklistTokens,
  getBlacklistTokenCount,
};
