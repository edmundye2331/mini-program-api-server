/**
 * 积分控制器
 */

const { db, generateId, formatDate } = require('../config/mysql');

/**
 * 获取积分余额
 */
const getPointsBalance = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    const member = await db.findOne('members', { user_id: userId });

    if (!member) {
      return res.error('会员信息不存在', 404);
    }

    res.success({
      points: member.points
    }, '获取积分余额成功');
  } catch (error) {
    console.error('获取积分余额错误:', error);
    res.error('获取积分余额失败', 500, error);
  }
};

/**
 * 获取积分商城商品列表
 */
const getPointsGoods = async (req, res) => {
  try {
    const goods = await db.findMany('points_goods', {}, {
      orderBy: 'created_at',
      order: 'ASC'
    });
    res.success(goods, '获取积分商品成功');
  } catch (error) {
    console.error('获取积分商品错误:', error);
    res.error('获取积分商品失败', 500, error);
  }
};

/**
 * 积分兑换
 */
const exchangeGoods = async (req, res) => {
  try {
    const { userId, goodsId } = req.body;

    if (!userId || !goodsId) {
      return res.error('缺少必要参数', 400);
    }

    const member = await db.findOne('members', { user_id: userId });

    if (!member) {
      return res.error('会员信息不存在', 404);
    }

    // 查找商品
    const goods = await db.findOne('points_goods', { id: goodsId });

    if (!goods) {
      return res.error('商品不存在', 404);
    }

    // 检查积分是否足够
    if (member.points < goods.points) {
      return res.error('积分不足', 400);
    }

    // 检查库存
    if (goods.stock <= 0) {
      return res.error('库存不足', 400);
    }

    // 扣除积分
    const newPoints = member.points - goods.points;
    await db.update('members', {
      points: newPoints,
      updated_at: formatDate()
    }, { user_id: userId });

    // 减少库存
    await db.update('points_goods', {
      stock: goods.stock - 1,
      updated_at: formatDate()
    }, { id: goodsId });

    // 创建积分记录
    const pointsRecord = {
      id: generateId(),
      user_id: userId,
      type: 'exchange',
      amount: -goods.points,
      balance: newPoints,
      description: `兑换商品：${goods.name}`,
      created_at: formatDate()
    };
    await db.insert('points_records', pointsRecord);

    // 创建兑换记录
    const exchangeRecord = {
      id: generateId(),
      user_id: userId,
      goods_id: goods.id,
      goods_name: goods.name,
      points: goods.points,
      status: 'success',
      created_at: formatDate()
    };
    await db.insert('exchange_records', exchangeRecord);

    res.success({
      points: newPoints,
      exchangeRecord: exchangeRecord
    }, '兑换成功');
  } catch (error) {
    console.error('积分兑换错误:', error);
    res.error('积分兑换失败', 500, error);
  }
};

/**
 * 获取积分明细
 */
const getPointsRecords = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    const total = await db.count('points_records', { user_id: userId });
    const offset = (page - 1) * limit;
    const records = await db.findMany('points_records', { user_id: userId }, {
      orderBy: 'created_at',
      order: 'DESC',
      limit: parseInt(limit),
      offset: offset
    });

    res.success({
      list: records,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    }, '获取积分明细成功');
  } catch (error) {
    console.error('获取积分明细错误:', error);
    res.error('获取积分明细失败', 500, error);
  }
};

/**
 * 获取兑换记录
 */
const getExchangeRecords = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    const total = await db.count('exchange_records', { user_id: userId });
    const offset = (page - 1) * limit;
    const records = await db.findMany('exchange_records', { user_id: userId }, {
      orderBy: 'created_at',
      order: 'DESC',
      limit: parseInt(limit),
      offset: offset
    });

    res.success({
      list: records,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    }, '获取兑换记录成功');
  } catch (error) {
    console.error('获取兑换记录错误:', error);
    res.error('获取兑换记录失败', 500, error);
  }
};

module.exports = {
  getPointsBalance,
  getPointsGoods,
  exchangeGoods,
  getPointsRecords,
  getExchangeRecords
};
