/**
 * 会员控制器
 */

const { db, generateId, formatDate } = require('../config/mysql');

/**
 * 获取会员信息
 */
const getMemberInfo = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 检查用户是否存在
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.error('用户不存在', 404);
    }

    let member = await db.findOne('members', { user_id: userId });

    // 如果会员不存在，自动创建
    if (!member) {
      member = {
        id: generateId(),
        user_id: userId,
        balance: '0.00',
        points: 0,
        coupons: 0,
        level: 1,
        created_at: formatDate(),
        updated_at: formatDate()
      };
      await db.insert('members', member);
      console.log(`自动创建会员数据: ${userId}`);
    }

    res.success(member);
  } catch (error) {
    console.error('获取会员信息错误:', error);
    res.error('获取会员信息失败', 500, error);
  }
};

/**
 * 获取余额
 */
const getBalance = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 检查用户是否存在
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.error('用户不存在', 404);
    }

    const member = await db.findOne('members', { user_id: userId });

    if (!member) {
      return res.error('会员信息不存在', 404);
    }

    res.success({ balance: member.balance });
  } catch (error) {
    console.error('获取余额错误:', error);
    res.error('获取余额失败', 500, error);
  }
};

/**
 * 充值
 */
const recharge = async (req, res) => {
  try {
    const { userId, amount, bonusAmount } = req.body;

    if (!userId || !amount) {
      return res.error('缺少必要参数', 400);
    }

    // 检查用户是否存在
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.error('用户不存在', 404);
    }

    let member = await db.findOne('members', { user_id: userId });

    // 如果会员不存在，自动创建
    if (!member) {
      member = {
        id: generateId(),
        user_id: userId,
        balance: '0.00',
        points: 0,
        coupons: 0,
        level: 1,
        created_at: formatDate(),
        updated_at: formatDate()
      };
      await db.insert('members', member);
      console.log(`自动创建会员数据: ${userId}`);
    }

    const totalAmount = amount + (bonusAmount || 0);
    const currentBalance = parseFloat(member.balance);
    const newBalance = currentBalance + totalAmount;

    // 更新会员余额
    const updateResult = await db.update('members', {
      balance: newBalance.toFixed(2),
      total_recharge: parseFloat(member.total_recharge) + totalAmount,
      updated_at: formatDate()
    }, { user_id: userId });

    console.log('Update result:', updateResult); // 调试日志
    member.balance = newBalance.toFixed(2);
    member.total_recharge = parseFloat(member.total_recharge) + totalAmount;
    member.updated_at = formatDate();

    // 创建充值记录
    const rechargeRecord = {
      id: generateId(),
      user_id: userId,
      amount: amount,
      bonus_amount: bonusAmount || 0,
      total_amount: totalAmount,
      balance_before: currentBalance.toFixed(2),
      balance_after: newBalance.toFixed(2),
      payment_method: 'wechat', // 默认使用微信支付
      status: 'success',
      created_at: formatDate()
    };
    await db.insert('recharge_records', rechargeRecord);

    // 创建余额变动记录
    const balanceRecord = {
      id: generateId(),
      user_id: userId,
      type: 'recharge',
      amount: totalAmount,
      balance: newBalance.toFixed(2),
      description: `充值 ¥${amount}.00`,
      created_at: formatDate()
    };
    await db.insert('balance_records', balanceRecord);

    res.success({
      balance: member.balance,
      rechargeRecord: rechargeRecord
    }, '充值成功');
  } catch (error) {
    console.error('充值错误:', error);
    res.error('充值失败', 500, error);
  }
};

/**
 * 获取充值记录
 */
const getRechargeRecords = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 检查用户是否存在
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.error('用户不存在', 404);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await db.count('recharge_records', { user_id: userId });
    const offset = (pageNum - 1) * limitNum;
    const records = await db.findMany('recharge_records', { user_id: userId }, {
      orderBy: 'created_at',
      order: 'DESC',
      limit: limitNum,
      offset: offset
    });

    res.success({
      list: records,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取充值记录错误:', error);
    res.error('获取充值记录失败', 500, error);
  }
};

/**
 * 获取余额记录
 */
const getBalanceRecords = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 检查用户是否存在
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.error('用户不存在', 404);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await db.count('balance_records', { user_id: userId });
    const offset = (pageNum - 1) * limitNum;
    const records = await db.findMany('balance_records', { user_id: userId }, {
      orderBy: 'created_at',
      order: 'DESC',
      limit: limitNum,
      offset: offset
    });

    res.success({
      list: records,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取余额记录错误:', error);
    res.error('获取余额记录失败', 500, error);
  }
};

module.exports = {
  getMemberInfo,
  getBalance,
  recharge,
  getRechargeRecords,
  getBalanceRecords
};
