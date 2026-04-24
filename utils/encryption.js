/**
 * 加密工具模块
 * 用于密码加密和验证
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// 加密强度
const SALT_ROUNDS = 10;

/**
 * 加密密码
 * @param {String} password - 原始密码
 * @returns {Promise<String>} 加密后的密码
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('密码加密错误:', error);
    throw error;
  }
};

/**
 * 验证密码
 * @param {String} password - 原始密码
 * @param {String} hashedPassword - 加密后的密码
 * @returns {Promise<Boolean>} 密码是否匹配
 */
const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('密码验证错误:', error);
    return false;
  }
};

/**
 * 生成随机字符串
 * @param {Number} length - 字符串长度
 * @returns {String} 随机字符串
 */
const generateRandomString = (length = 16) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint32Array(length);
  crypto.getRandomValues(randomArray);
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  return result;
};

/**
 * 简单的哈希函数（用于非安全场景）
 * @param {String} str - 要哈希的字符串
 * @returns {String} 哈希值
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(16);
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateRandomString,
  simpleHash,
};
