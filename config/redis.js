/**
 * Redis配置文件
 * 提供Redis连接和缓存功能
 */

const redis = require('redis');

// Redis连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  url: process.env.REDIS_URL || undefined,
};

// 创建Redis客户端
const createRedisClient = async () => {
  const client = redis.createClient(redisConfig);

  client.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Redis客户端错误:', err);
    }
  });

  client.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Redis连接成功');
    }
  });

  await client.connect();
  return client;
};

// 缓存客户端实例
let redisClient = null;

/**
 * 获取Redis客户端实例
 * @returns {Promise<redis.RedisClient>} Redis客户端实例
 */
const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await createRedisClient();
  }
  return redisClient;
};

/**
 * 设置缓存
 * @param {string} key 缓存键
 * @param {any} value 缓存值
 * @param {number} ttl 过期时间（秒），默认1小时
 */
const setCache = async (key, value, ttl = 3600) => {
  try {
    const client = await getRedisClient();
    const serializedValue = JSON.stringify(value);

    if (ttl) {
      await client.setEx(key, ttl, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('设置缓存失败:', error);
    }
  }
};

/**
 * 获取缓存
 * @param {string} key 缓存键
 * @returns {any} 缓存值
 */
const getCache = async (key) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);

    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('获取缓存失败:', error);
    }
    return null;
  }
};

/**
 * 删除缓存
 * @param {string} key 缓存键
 */
const deleteCache = async (key) => {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('删除缓存失败:', error);
    }
  }
};

/**
 * 模糊匹配删除缓存
 * @param {string} pattern 缓存键模式
 */
const deleteCacheByPattern = async (pattern) => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('批量删除缓存失败:', error);
    }
  }
};

module.exports = {
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
};
