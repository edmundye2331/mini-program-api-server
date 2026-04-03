/**
 * 积分控制器
 */

const { database, generateId, formatDate } = require('../config/database');

/**
 * 获取积分余额
 */
const getPointsBalance = (req, res) => {
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
        points: member.points
      }
    });
  } catch (error) {
    console.error('获取积分余额错误:', error);
    res.status(500).json({
      success: false,
      message: '获取积分余额失败'
    });
  }
};

/**
 * 获取积分商城商品列表
 */
const getPointsGoods = (req, res) => {
  try {
    res.json({
      success: true,
      data: database.pointsGoods
    });
  } catch (error) {
    console.error('获取积分商品错误:', error);
    res.status(500).json({
      success: false,
      message: '获取积分商品失败'
    });
  }
};

/**
 * 积分兑换
 */
const exchangeGoods = (req, res) => {
  try {
    const { userId, goodsId } = req.body;

    if (!userId || !goodsId) {
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

    // 查找商品
    const goods = database.pointsGoods.find(g => g.id === goodsId);

    if (!goods) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 检查积分是否足够
    if (member.points < goods.points) {
      return res.status(400).json({
        success: false,
        message: '积分不足'
      });
    }

    // 检查库存
    if (goods.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: '库存不足'
      });
    }

    // 扣除积分
    member.points -= goods.points;
    member.updatedAt = formatDate();
    database.members.set(userId, member);

    // 减少库存
    goods.stock -= 1;

    // 创建积分记录
    const pointsRecord = {
      id: generateId(),
      userId: userId,
      type: 'exchange',
      amount: -goods.points,
      balance: member.points,
      description: `兑换商品：${goods.name}`,
      createdAt: formatDate()
    };
    database.pointsRecords.push(pointsRecord);

    // 创建兑换记录
    const exchangeRecord = {
      id: generateId(),
      userId: userId,
      goodsId: goods.id,
      goodsName: goods.name,
      points: goods.points,
      status: 'success',
      createdAt: formatDate()
    };
    database.exchangeRecords.push(exchangeRecord);

    res.json({
      success: true,
      message: '兑换成功',
      data: {
        points: member.points,
        exchangeRecord: exchangeRecord
      }
    });
  } catch (error) {
    console.error('积分兑换错误:', error);
    res.status(500).json({
      success: false,
      message: '积分兑换失败'
    });
  }
};

/**
 * 获取积分明细
 */
const getPointsRecords = (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const records = database.pointsRecords.filter(r => r.userId === userId);
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
    console.error('获取积分明细错误:', error);
    res.status(500).json({
      success: false,
      message: '获取积分明细失败'
    });
  }
};

/**
 * 获取兑换记录
 */
const getExchangeRecords = (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const records = database.exchangeRecords.filter(r => r.userId === userId);
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
    console.error('获取兑换记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取兑换记录失败'
    });
  }
};

module.exports = {
  getPointsBalance,
  getPointsGoods,
  exchangeGoods,
  getPointsRecords,
  getExchangeRecords
};
