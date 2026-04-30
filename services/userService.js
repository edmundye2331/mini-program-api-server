/**
 * 用户服务层
 * 处理用户相关业务逻辑
 */

const userDao = require('../dao/userDao');
const memberDao = require('../dao/memberDao');
const { generateId, formatDate } = require('../config/mysql');
const { hashPassword } = require('../utils/encryption');
const {
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
} = require('../config/redis');

/**
 * 根据用户ID获取用户信息
 * @param {String} userId - 用户ID
 * @returns {Object} 用户信息
 */
const getUserById = async (userId) => {
  // 先检查缓存
  const cacheKey = `user:id:${userId}`;
  const cachedUser = await getCache(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  // 缓存不存在，从数据库获取
  const user = await userDao.findById(userId);

  if (user) {
    // 存入缓存，过期时间1小时
    await setCache(cacheKey, user, 3600);
  }

  return user;
};

/**
 * 根据手机号获取用户信息
 * @param {String} phone - 手机号
 * @returns {Object} 用户信息
 */
const getUserByPhone = async (phone) => {
  // 先检查缓存
  const cacheKey = `user:phone:${phone}`;
  const cachedUser = await getCache(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  // 缓存不存在，从数据库获取
  const user = await userDao.findByPhone(phone);

  if (user) {
    // 存入缓存，过期时间1小时
    await setCache(cacheKey, user, 3600);
  }

  return user;
};

/**
 * 根据微信OpenId获取用户信息
 * @param {String} openId - 微信OpenId
 * @returns {Object} 用户信息
 */
const getUserByWechatOpenId = async (openId) => {
  // 先检查缓存
  const cacheKey = `user:wx:${openId}`;
  const cachedUser = await getCache(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  // 缓存不存在，从数据库获取
  const user = await userDao.findByWechatOpenId(openId);

  if (user) {
    // 存入缓存，过期时间1小时
    await setCache(cacheKey, user, 3600);
  }

  return user;
};

/**
 * 创建新用户
 * @param {Object} userData - 用户数据
 * @param {String} [password] - 密码（可选）
 * @returns {Object} 创建的用户信息
 */
const createUser = async (userData, password = null) => {
  const userId = generateId();
  const user = {
    id: userId,
    phone: userData.phone,
    avatar: userData.avatar || '/images/avatar.png',
    nickname: userData.nickname || `用户${userData.phone.slice(-4)}`,
    gender: userData.gender || null,
    city: userData.city || null,
    province: userData.province || null,
    country: userData.country || null,
    wechat_openid: userData.wechat_openid || null,
    wechat_session_key: userData.wechat_session_key || null,
    created_at: formatDate(),
    updated_at: formatDate(),
  };

  // 如果提供了密码，加密后存储
  if (password) {
    user.password_hash = await hashPassword(password);
  }

  await userDao.insert(user);

  // 创建会员信息
  await memberDao.insert({
    id: generateId(),
    user_id: userId,
    balance: '0.00',
    points: 0,
    level: 1,
    created_at: formatDate(),
    updated_at: formatDate(),
  });

  // 如果用户有手机号，清除手机号缓存
  if (user.phone) {
    await deleteCache(`user:phone:${user.phone}`);
  }

  return user;
};

/**
 * 更新用户信息
 * @param {String} userId - 用户ID
 * @param {Object} updateData - 更新数据
 * @returns {Object} 更新后的用户信息
 */
const updateUser = async (userId, updateData) => {
  // // 排除不可更新的字段
  // const { id: _, created_at: __, user_id: ___, ...updatableData } = updateData;
  // const updatedData = {
  //   ...updatableData,
  //   updated_at: formatDate(),
  // };
    // 使用白名单方式，只允许更新特定字段
  const allowedFields = [
    'phone',
    'avatar',
    'nickname',
    'gender',
    'city',
    'province',
    'country',
    'birthday',
    'wechat_openid',
  ];

  // 只提取允许的字段
  const updatedData = {};
  allowedFields.forEach((field) => {
    if (field in updateData) {
      updatedData[field] = updateData[field];
    }
  });

  // 添加更新时间
  updatedData.updated_at = formatDate();

  // 获取旧用户信息，以便清除相关缓存
  const oldUser = await getUserById(userId);

  await userDao.update(updatedData, { id: userId });

  // 清除用户相关的所有缓存
  await deleteCache(`user:id:${userId}`);
  if (oldUser) {
    if (oldUser.phone) {
      await deleteCache(`user:phone:${oldUser.phone}`);
    }
    if (oldUser.wechat_openid) {
      await deleteCache(`user:wx:${oldUser.wechat_openid}`);
    }
  }

  // 如果更新了手机号，清除新手机号的缓存
  if (updatedData.phone && oldUser && updatedData.phone !== oldUser.phone) {
    await deleteCache(`user:phone:${updatedData.phone}`);
  }

  return {
    ...(await getUserById(userId)),
    ...updatedData,
  };
};

/**
 * 更新用户密码
 * @param {String} userId - 用户ID
 * @param {String} newPassword - 新密码
 * @returns {Boolean} 是否更新成功
 */
const updatePassword = async (userId, newPassword) => {
  const hashedPassword = await hashPassword(newPassword);
  const result = await userDao.updatePassword(userId, hashedPassword);

  return result.affectedRows > 0;
};

module.exports = {
  getUserById,
  getUserByPhone,
  getUserByWechatOpenId,
  createUser,
  updateUser,
  updatePassword,
};
