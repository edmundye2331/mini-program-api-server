/**
 * 验证码管理工具
 * 支持内存存储和Redis存储
 */

const { getRedisClient } = require('../config/redis');

// 内存存储（开发环境或Redis不可用时）
const codeStore = new Map();

/**
 * 生成6位随机验证码
 * @returns {String} 6位数字验证码
 */
function generateCode() {
  // 生成000000-999999之间的随机数，然后补零
  const code = Math.floor(Math.random() * 1000000).toString();
  return code.padStart(6, '0');
}

/**
 * 生成唯一key
 * @param {String} phone - 手机号
 * @param {String} type - 验证码类型
 * @returns {String} 唯一key
 */
function generateKey(phone, type = 'default') {
  return `sms_code:${type}:${phone}`;
}

/**
 * 保存验证码
 * @param {String} phone - 手机号
 * @param {String} code - 验证码
 * @param {Number} expireMinutes - 过期时间（分钟）
 * @param {String} type - 验证码类型（default/bind/login）
 * @returns {Promise<Boolean>} 是否保存成功
 */
async function saveCode(phone, code, expireMinutes = 5, type = 'default') {
  try {
    const key = generateKey(phone, type);
    const expireSeconds = expireMinutes * 60;
    const value = {
      code,
      createdAt: Date.now(),
      type,
    };

    // 尝试使用Redis
    try {
      const redis = await getRedisClient();
      if (redis) {
        await redis.set(key, JSON.stringify(value));
        await redis.expire(key, expireSeconds);
        return true;
      }
    } catch (redisError) {
      console.warn('Redis不可用，使用内存存储:', redisError.message);
    }

    // 使用内存存储
    codeStore.set(key, {
      ...value,
      expiresAt: Date.now() + expireSeconds * 1000,
    });

    // 清理过期的验证码
    cleanupExpiredCodes();

    return true;
  } catch (error) {
    console.error('保存验证码失败:', error);
    return false;
  }
}

/**
 * 验证验证码
 * @param {String} phone - 手机号
 * @param {String} code - 验证码
 * @param {String} type - 验证码类型
 * @returns {Promise<Boolean>} 是否验证成功
 */
async function verifyCode(phone, code, type = 'default') {
  try {
    const key = generateKey(phone, type);

    // 尝试从Redis获取
    let storedData = null;

    try {
      const redis = await getRedisClient();
      if (redis) {
        const data = await redis.get(key);
        if (data) {
          storedData = JSON.parse(data);
        }
      }
    } catch (redisError) {
      console.warn('Redis获取失败，尝试内存存储:', redisError.message);
    }

    // 从内存获取
    if (!storedData) {
      const memoryData = codeStore.get(key);
      if (memoryData) {
        // 检查是否过期
        if (memoryData.expiresAt && memoryData.expiresAt > Date.now()) {
          storedData = memoryData;
        }
      }
    }

    // 验证码
    if (!storedData) {
      return false;
    }

    if (storedData.code !== code) {
      return false;
    }

    // 验证成功，删除验证码
    try {
      const redis = await getRedisClient();
      if (redis) {
        await redis.del(key);
      }
    } catch (e) {
      // 忽略删除错误
    }

    codeStore.delete(key);

    return true;
  } catch (error) {
    console.error('验证验证码失败:', error);
    return false;
  }
}

/**
 * 检查验证码是否存在
 * @param {String} phone - 手机号
 * @param {String} type - 验证码类型
 * @returns {Promise<Boolean>} 是否存在
 */
async function hasCode(phone, type = 'default') {
  try {
    const key = generateKey(phone, type);

    // 检查Redis
    try {
      const redis = await getRedisClient();
      if (redis) {
        const exists = await redis.exists(key);
        if (exists) {
          return true;
        }
      }
    } catch (redisError) {
      // 忽略Redis错误
    }

    // 检查内存
    const memoryData = codeStore.get(key);
    if (memoryData) {
      return !memoryData.expiresAt || memoryData.expiresAt > Date.now();
    }

    return false;
  } catch (error) {
    console.error('检查验证码失败:', error);
    return false;
  }
}

/**
 * 获取剩余时间（秒）
 * @param {String} phone - 手机号
 * @param {String} type - 验证码类型
 * @returns {Promise<Number>} 剩余时间（0=不存在或已过期）
 */
async function getRemainingSeconds(phone, type = 'default') {
  try {
    const key = generateKey(phone, type);

    // 检查Redis
    try {
      const redis = await getRedisClient();
      if (redis) {
        const ttl = await redis.ttl(key);
        if (ttl > 0) {
          return ttl;
        }
      }
    } catch (redisError) {
      // 忽略Redis错误
    }

    // 检查内存
    const memoryData = codeStore.get(key);
    if (memoryData && memoryData.expiresAt) {
      const remaining = Math.floor((memoryData.expiresAt - Date.now()) / 1000);
      return Math.max(0, remaining);
    }

    return 0;
  } catch (error) {
    console.error('获取剩余时间失败:', error);
    return 0;
  }
}

/**
 * 清理过期的验证码（内存）
 */
function cleanupExpiredCodes() {
  const now = Date.now();
  const keysToDelete = [];

  for (const [key, data] of codeStore.entries()) {
    if (data.expiresAt && data.expiresAt < now) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => codeStore.delete(key));
}

/**
 * 删除验证码
 * @param {String} phone - 手机号
 * @param {String} type - 验证码类型
 * @returns {Promise<Boolean>} 是否删除成功
 */
async function deleteCode(phone, type = 'default') {
  try {
    const key = generateKey(phone, type);

    // 从Redis删除
    try {
      const redis = await getRedisClient();
      if (redis) {
        await redis.del(key);
      }
    } catch (e) {
      // 忽略Redis错误
    }

    // 从内存删除
    codeStore.delete(key);

    return true;
  } catch (error) {
    console.error('删除验证码失败:', error);
    return false;
  }
}

module.exports = {
  generateCode,
  saveCode,
  verifyCode,
  hasCode,
  getRemainingSeconds,
  deleteCode,
};
