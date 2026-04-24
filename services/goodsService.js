/**
 * 商品服务层
 * 处理商品相关业务逻辑
 */

const goodsDao = require('../dao/goodsDao');
const goodsCategoryDao = require('../dao/goodsCategoryDao');
const { formatDate } = require('../config/mysql');
const {
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
} = require('../config/redis');

/**
 * 获取商品分类列表
 * @returns {Array} 商品分类列表
 */
const getGoodsCategories = async () => {
  // 先检查缓存
  const cacheKey = 'goods:categories';
  const cachedCategories = await getCache(cacheKey);

  if (cachedCategories) {
    return cachedCategories;
  }

  // 缓存不存在，从数据库获取
  const categories = await goodsCategoryDao.findActive({
    orderBy: 'sort',
    order: 'ASC',
  });

  if (categories) {
    // 存入缓存，过期时间1小时
    await setCache(cacheKey, categories, 3600);
  }

  return categories;
};

/**
 * 获取商品列表
 * @param {Object} options - 查询选项
 * @returns {Array} 商品列表
 */
const getGoodsList = async (options = {}) => {
  const { categoryId, status = 'onsale', limit, offset } = options;

  const where = {};
  if (categoryId) where.category_id = categoryId;
  if (status) where.status = status;

  return await goodsDao.findMany(where, {
    orderBy: 'sort',
    order: 'ASC',
    limit,
    offset,
  });
};

/**
 * 获取商品详情
 * @param {String} goodsId - 商品ID
 * @returns {Object} 商品详情
 */
const getGoodsDetail = async (goodsId) => {
  // 先检查缓存
  const cacheKey = `goods:detail:${goodsId}`;
  const cachedGoods = await getCache(cacheKey);

  if (cachedGoods) {
    return cachedGoods;
  }

  // 缓存不存在，从数据库获取
  const goods = await goodsDao.findById(goodsId);

  if (goods) {
    // 存入缓存，过期时间1小时
    await setCache(cacheKey, goods, 3600);
  }

  return goods;
};

/**
 * 更新商品库存
 * @param {String} goodsId - 商品ID
 * @param {Number} stock - 库存数量
 * @returns {Object} 更新结果
 */
const updateStock = async (goodsId, stock) =>
  await goodsDao.updateStock(goodsId, stock);

/**
 * 扣减商品库存
 * @param {String} goodsId - 商品ID
 * @param {Number} quantity - 扣减数量
 * @returns {Object} 更新结果
 */
const reduceStock = async (goodsId, quantity) =>
  await goodsDao.reduceStock(goodsId, quantity);

/**
 * 创建商品
 * @param {Object} goodsData - 商品数据
 * @returns {Object} 创建结果
 */
const createGoods = async (goodsData) => {
  const goods = {
    id: require('../config/mysql').generateId(),
    ...goodsData,
    status: goodsData.status || 'onsale',
    created_at: formatDate(),
    updated_at: formatDate(),
  };

  const result = await goodsDao.insert(goods);

  // 清除分类缓存
  await deleteCache('goods:categories');

  return result;
};

/**
 * 更新商品信息
 * @param {String} goodsId - 商品ID
 * @param {Object} goodsData - 商品数据
 * @returns {Object} 更新结果
 */
const updateGoods = async (goodsId, goodsData) => {
  const updateData = {
    ...goodsData,
    updated_at: formatDate(),
  };

  const result = await goodsDao.update(updateData, { id: goodsId });

  // 清除商品详情缓存和分类缓存
  await deleteCache(`goods:detail:${goodsId}`);
  await deleteCache('goods:categories');

  return result;
};

module.exports = {
  getGoodsCategories,
  getGoodsList,
  getGoodsDetail,
  updateStock,
  reduceStock,
  createGoods,
  updateGoods,
};
