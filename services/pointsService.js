/**
 * 积分服务层
 * 处理积分相关业务逻辑
 */

const pointsGoodsDao = require('../dao/pointsGoodsDao');
const pointsRecordDao = require('../dao/pointsRecordDao');
const exchangeRecordDao = require('../dao/exchangeRecordDao');
const memberService = require('./memberService');
const { generateId } = require('../config/mysql');

/**
 * 获取积分商品列表
 * @param {Boolean} activeOnly - 是否只查询活跃商品
 * @returns {Array} 积分商品列表
 */
const getPointsGoodsList = async (activeOnly = true) => {
  const goodsList = await pointsGoodsDao.findActive({
    orderBy: 'sort',
    order: 'ASC',
  });

  // 转换字段名，将数据库中的points字段转换为前端期望的points_required
  return goodsList.map((goods) => ({
    ...goods,
    points_required: goods.points,
  }));
};

/**
 * 获取积分商品详情
 * @param {String} goodsId - 商品ID
 * @returns {Object} 积分商品详情
 */
const getPointsGoodsDetail = async (goodsId) => {
  const goods = await pointsGoodsDao.findById(goodsId);
  if (goods) {
    // 转换字段名，将数据库中的points字段转换为前端期望的points_required
    return {
      ...goods,
      points_required: goods.points,
    };
  }
  return goods;
};

/**
 * 获取用户积分记录
 * @param {String} userId - 用户ID
 * @param {Number} limit - 记录数量限制
 * @returns {Array} 积分记录列表
 */
const getPointsRecords = async (userId, limit = 50) =>
  await pointsRecordDao.findByUserId(userId, { limit });

/**
 * 创建积分记录
 * @param {String} userId - 用户ID
 * @param {Number} points - 积分数量
 * @param {String} type - 记录类型
 * @param {String} description - 描述
 * @returns {Object} 创建结果
 */
const createPointsRecord = async (
  userId,
  points,
  type,
  description,
  balance
) => {
  const record = {
    id: generateId(),
    user_id: userId,
    amount: points,
    balance,
    type,
    description,
    created_at: new Date(),
  };

  await pointsRecordDao.insert(record);
  return record;
};

/**
 * 兑换积分商品
 * @param {String} userId - 用户ID
 * @param {String} goodsId - 商品ID
 * @param {Number} quantity - 兑换数量
 * @returns {Object} 兑换结果
 */
const exchangePointsGoods = async (userId, goodsId, quantity = 1) => {
  // 获取商品信息
  const goods = await pointsGoodsDao.findById(goodsId);
  if (!goods || !goods.is_active) {
    throw new Error('积分商品不存在或已下架');
  }

  // 检查库存
  if (goods.stock < quantity) {
    throw new Error('库存不足');
  }

  // 获取用户当前积分
  const member = await memberService.getOrCreateMember(userId);
  if (member.points < goods.points * quantity) {
    throw new Error('积分不足');
  }

  // 扣减积分
  const newPoints = member.points - goods.points * quantity;
  await memberService.updatePoints(userId, newPoints);

  // 扣减商品库存
  await pointsGoodsDao.reduceStock(goodsId, quantity);

  // 创建积分记录
  await createPointsRecord(
    userId,
    -goods.points * quantity,
    'spend',
    `兑换商品: ${goods.name}`,
    newPoints
  );

  // 创建兑换记录
  const exchangeRecord = {
    id: generateId(),
    user_id: userId,
    goods_id: goodsId,
    goods_name: goods.name,
    points: goods.points * quantity,
    quantity,
    status: 'success',
    redemption_code: `CODE${Date.now().toString().slice(-6)}`,
    created_at: new Date(),
  };
  await exchangeRecordDao.insert(exchangeRecord);

  return {
    goods,
    quantity,
    totalPoints: goods.points * quantity,
    remainingPoints: newPoints,
    exchangeRecord: {
      id: exchangeRecord.id,
      userId: exchangeRecord.user_id,
      goodsId: exchangeRecord.goods_id,
      goodsName: exchangeRecord.goods_name,
      points: exchangeRecord.points,
      quantity: exchangeRecord.quantity,
      status: exchangeRecord.status,
      statusText:
        exchangeRecord.status === 'success'
          ? '已完成'
          : exchangeRecord.status === 'pending'
            ? '待领取'
            : exchangeRecord.status === 'failed'
              ? '已失败'
              : '未知状态',
      redemptionCode: exchangeRecord.redemption_code,
      createdAt: exchangeRecord.created_at,
      description: exchangeRecord.description,
    },
  };
};

module.exports = {
  getPointsGoodsList,
  getPointsGoodsDetail,
  getPointsRecords,
  createPointsRecord,
  exchangePointsGoods,
};
