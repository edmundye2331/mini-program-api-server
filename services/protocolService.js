/**
 * 协议服务层
 * 处理协议相关业务逻辑
 */

const protocolDao = require('../dao/protocolDao');

/**
 * 获取协议内容
 * @param {String} type - 协议类型
 * @returns {Object} 协议内容
 */
const getProtocol = async (type) => {
  const protocol = await protocolDao.findByType(type);

  return protocol?.content;
};

/**
 * 获取所有协议
 * @returns {Array} 所有协议列表
 */
const getAllProtocols = async () =>
  await protocolDao.findMany(
    {},
    {
      orderBy: 'created_at',
      order: 'ASC',
    }
  );

module.exports = {
  getProtocol,
  getAllProtocols,
};
