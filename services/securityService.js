/**
 * 安全服务层
 * 处理安全相关业务逻辑
 */

const userDao = require('../dao/userDao');
const loginLogDao = require('../dao/loginLogDao');
const { hashPassword, verifyPassword } = require('../utils/encryption');
const { generateId, formatDate } = require('../config/mysql');

/**
 * 修改密码
 * @param {String} userId - 用户ID
 * @param {String} oldPassword - 旧密码
 * @param {String} newPassword - 新密码
 * @returns {Boolean} 是否修改成功
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userDao.findById(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 验证原密码
  if (!user.password) {
    throw new Error('请先设置密码');
  }

  const isPasswordValid = await verifyPassword(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('原密码错误');
  }

  // 加密新密码
  const hashedPassword = await hashPassword(newPassword);

  // 更新密码
  await userDao.updatePassword(userId, hashedPassword);

  // 记录密码修改历史
  await loginLogDao.insert({
    id: generateId(),
    user_id: userId,
    changed_at: formatDate(),
    ip: 'unknown',
  });

  return true;
};

/**
 * 绑定/更换手机号
 * @param {String} userId - 用户ID
 * @param {String} phone - 手机号
 * @returns {Boolean} 是否绑定成功
 */
const bindPhone = async (userId, phone) => {
  const user = await userDao.findById(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 更新手机号
  await userDao.updateUser(userId, {
    phone,
    updated_at: formatDate(),
  });

  return true;
};

/**
 * 获取登录记录
 * @param {String} userId - 用户ID
 * @param {Number} limit - 记录数量限制
 * @returns {Array} 登录记录列表
 */
const getLoginLogs = async (userId, limit = 20) =>
  await loginLogDao.findByUserId(userId, {
    orderBy: 'login_time',
    order: 'DESC',
    limit,
  });

/**
 * 记录登录
 * @param {String} userId - 用户ID
 * @param {String} loginType - 登录类型
 * @param {Object} userInfo - 用户信息
 * @returns {Object} 登录日志
 */
const recordLogin = async (userId, loginType = 'phone', userInfo = {}) => {
  const log = {
    id: generateId(),
    user_id: userId,
    login_type: loginType,
    login_time: formatDate(),
    ip: 'unknown',
    device: 'miniprogram',
    ...userInfo,
  };

  await loginLogDao.insert(log);
  return log;
};

/**
 * 注销账号
 * @param {String} userId - 用户ID
 * @returns {Boolean} 是否注销成功
 */
const deleteAccount = async (userId) => {
  const user = await userDao.findById(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 删除用户数据
  await userDao.delete({ id: userId });
  await require('../dao/memberDao').delete({ user_id: userId });
  await require('../dao/cartDao').delete({ user_id: userId });
  await require('../dao/birthdayDao').delete({ user_id: userId });

  // 保留订单记录但标记为已注销
  await require('../dao/orderDao').update(
    {
      deleted: true,
      deleted_at: formatDate(),
    },
    { user_id: userId }
  );

  return true;
};

module.exports = {
  changePassword,
  bindPhone,
  getLoginLogs,
  recordLogin,
  deleteAccount,
};
