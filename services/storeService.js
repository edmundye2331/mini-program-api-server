/**
 * 门店服务层
 * 处理门店相关业务逻辑
 */

const storeDao = require('../dao/storeDao');

/**
 * 获取门店列表
 * @returns {Array} 门店列表
 */
const getStores = async () =>
  await storeDao.findMany(
    {},
    {
      orderBy: 'created_at',
      order: 'ASC',
    }
  );

/**
 * 获取门店详情
 * @param {String} storeId - 门店ID
 * @returns {Object} 门店详情
 */
const getStoreDetail = async (storeId) => await storeDao.findById(storeId);

module.exports = {
  getStores,
  getStoreDetail,
};
