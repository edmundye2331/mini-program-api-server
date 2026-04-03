/**
 * 会员控制器
 */

const { database, generateId, formatDate } = require('../config/database');

/**
 * 获取会员信息
 */
const getMemberInfo = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    let member = database.members.get(userId);

    // 如果会员不存在，自动创建
    if (!member) {
      member = {
        userId: userId,
        balance: '0.00',
        points: 0,
        coupons: 0,
        level: 1,
        createdAt: formatDate(),
        updatedAt: formatDate()
      };
      database.members.set(userId, member);
      console.log(`自动创建会员数据: ${userId}`);
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('获取会员信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取会员信息失败'
    });
  }
};

/**
 * 获取余额
 */
const getBalance = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const member = database.members.get(userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员信息不存在'
      });
    }

    res.json({
      success: true,
      data: {
        balance: member.balance
      }
    });
  } catch (error) {
    console.error('获取余额错误:', error);
    res.status(500).json({
      success: false,
      message: '获取余额失败'
    });
  }
};

/**
 * 充值
 */
const recharge = (req, res) => {
  try {
    const { userId, amount, bonusAmount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const member = database.members.get(userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员信息不存在'
      });
    }

    const totalAmount = amount + (bonusAmount || 0);
    const currentBalance = parseFloat(member.balance);
    const newBalance = currentBalance + totalAmount;

    // 更新会员余额
    member.balance = newBalance.toFixed(2);
    member.updatedAt = formatDate();
    database.members.set(userId, member);

    // 创建充值记录
    const rechargeRecord = {
      id: generateId(),
      userId: userId,
      amount: amount,
      bonusAmount: bonusAmount || 0,
      totalAmount: totalAmount,
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      status: 'success',
      createdAt: formatDate()
    };
    database.rechargeRecords.push(rechargeRecord);

    // 创建余额变动记录
    const balanceRecord = {
      id: generateId(),
      userId: userId,
      type: 'recharge',
      amount: totalAmount,
      balance: newBalance.toFixed(2),
      description: `充值 ¥${amount}.00`,
      createdAt: formatDate()
    };
    database.balanceRecords.push(balanceRecord);

    res.json({
      success: true,
      message: '充值成功',
      data: {
        balance: member.balance,
        rechargeRecord: rechargeRecord
      }
    });
  } catch (error) {
    console.error('充值错误:', error);
    res.status(500).json({
      success: false,
      message: '充值失败'
    });
  }
};

/**
 * 获取充值记录
 */
const getRechargeRecords = (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const records = database.rechargeRecords.filter(r => r.userId === userId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = records.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        list: paginatedRecords,
        total: records.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取充值记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取充值记录失败'
    });
  }
};

/**
 * 获取余额记录
 */
const getBalanceRecords = (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const records = database.balanceRecords.filter(r => r.userId === userId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = records.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        list: paginatedRecords,
        total: records.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取余额记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取余额记录失败'
    });
  }
};

module.exports = {
  getMemberInfo,
  getBalance,
  recharge,
  getRechargeRecords,
  getBalanceRecords
};
