/**
 * 会员服务层
 * 处理会员相关业务逻辑
 */

const memberDao = require('../dao/memberDao');
const { db, generateId, formatDate } = require('../config/mysql');

/**
 * 根据用户ID获取会员信息
 * @param {String} userId - 用户ID
 * @returns {Object} 会员信息
 */
const getMemberByUserId = async (userId) =>
  await memberDao.findByUserId(userId);

/**
 * 获取或创建会员信息
 * @param {String} userId - 用户ID
 * @returns {Object} 会员信息
 */
const getOrCreateMember = async (userId) => {
  let member = await getMemberByUserId(userId);

  if (!member) {
    member = {
      id: generateId(),
      user_id: userId,
      balance: '0.00',
      points: 0,
      level: 1,
      created_at: formatDate(),
      updated_at: formatDate(),
    };

    await memberDao.insert(member);
    console.log(`自动创建会员数据: ${userId}`);
  }

  return member;
};

/**
 * 获取用户余额
 * @param {String} userId - 用户ID
 * @returns {String} 余额
 */
const getBalance = async (userId) => {
  const member = await getOrCreateMember(userId);
  return member.balance;
};

/**
 * 充值
 * @param {String} userId - 用户ID
 * @param {Number} amount - 充值金额
 * @param {Number} [bonusAmount=0] - 赠送金额
 * @returns {Object} 充值后会员信息及记录
 */
const recharge = async (userId, amount, bonusAmount = 0) => {
  const member = await getOrCreateMember(userId);
  const totalAmount = amount + bonusAmount;
  const currentBalance = parseFloat(member.balance);
  const newBalance = currentBalance + totalAmount;

  await memberDao.update(
    {
      balance: newBalance.toFixed(2),
      total_recharge: parseFloat(member.total_recharge || 0) + totalAmount,
      updated_at: formatDate(),
    },
    { user_id: userId }
  );

  const rechargeRecord = {
    id: generateId(),
    user_id: userId,
    amount,
    bonus_amount: bonusAmount,
    total_amount: totalAmount,
    balance_before: currentBalance.toFixed(2),
    balance_after: newBalance.toFixed(2),
    payment_method: 'wechat',
    status: 'success',
    created_at: formatDate(),
  };

  await require('../config/mysql').db.insert(
    'recharge_records',
    rechargeRecord
  );

  const balanceRecord = {
    id: generateId(),
    user_id: userId,
    type: 'recharge',
    amount: totalAmount,
    balance: newBalance.toFixed(2),
    description: `充值 ¥${amount}.00`,
    created_at: formatDate(),
  };

  await require('../config/mysql').db.insert('balance_records', balanceRecord);

  return {
    member: {
      ...member,
      balance: newBalance.toFixed(2),
      total_recharge: parseFloat(member.total_recharge || 0) + totalAmount,
    },
    rechargeRecord,
  };
};

/**
 * 余额支付
 * @param {String} userId - 用户ID
 * @param {Number} amount - 支付金额
 * @param {String} [orderNo] - 关联订单号
 * @returns {Object} 支付后会员信息及记录
 */
const payWithBalance = async (userId, amount, orderNo) => {
  const member = await getOrCreateMember(userId);
  const currentBalance = parseFloat(member.balance);

  if (currentBalance < amount) {
    throw new Error('余额不足');
  }

  const newBalance = currentBalance - amount;

  await memberDao.update(
    {
      balance: newBalance.toFixed(2),
      total_consumption: parseFloat(member.total_consumption || 0) + amount,
      total_orders: parseInt(member.total_orders || 0) + 1,
      updated_at: formatDate(),
    },
    { user_id: userId }
  );

  const balanceRecord = {
    id: generateId(),
    user_id: userId,
    type: 'consumption',
    amount: -amount,
    balance: newBalance.toFixed(2),
    description: orderNo ? `支付订单 ${orderNo}` : '消费',
    created_at: formatDate(),
  };

  await require('../config/mysql').db.insert('balance_records', balanceRecord);

  return {
    member: {
      ...member,
      balance: newBalance.toFixed(2),
      total_consumption: parseFloat(member.total_consumption || 0) + amount,
      total_orders: parseInt(member.total_orders || 0) + 1,
    },
    balanceRecord,
  };
};

/**
 * 更新会员积分
 * @param {String} userId - 用户ID
 * @param {Number} points - 新积分值
 * @returns {Object} 更新后的会员信息
 */
const updatePoints = async (userId, points) => {
  const member = await getOrCreateMember(userId);
  await memberDao.update(
    {
      points,
      updated_at: formatDate(),
    },
    { user_id: userId }
  );

  return {
    ...member,
    points,
  };
};

module.exports = {
  getMemberByUserId,
  getOrCreateMember,
  getBalance,
  recharge,
  payWithBalance,
  updatePoints,
};
