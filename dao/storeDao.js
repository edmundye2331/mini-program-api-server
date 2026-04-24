/**
 * 门店数据访问对象
 * 继承基础数据访问对象，封装门店表操作
 */

const BaseDao = require('./baseDao');

class StoreDao extends BaseDao {
  constructor() {
    super('stores');
  }

  /**
   * 获取所有门店
   * @param {Object} options - 查询选项
   * @returns {Array} 门店列表
   */
  async findAll(options = {}) {
    return await this.findMany({}, options);
  }
}

module.exports = new StoreDao();
