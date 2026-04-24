/**
 * 协议数据访问对象
 * 继承基础数据访问对象，封装协议表操作
 */

const BaseDao = require('./baseDao');

class ProtocolDao extends BaseDao {
  constructor() {
    super('protocols');
  }

  /**
   * 根据协议类型查询协议
   * @param {String} type - 协议类型
   * @returns {Object} 协议信息
   */
  async findByType(type) {
    return await this.findOne({ type });
  }
}

module.exports = new ProtocolDao();
