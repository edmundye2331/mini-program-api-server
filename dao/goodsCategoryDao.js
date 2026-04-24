/**
 * 商品分类数据访问对象
 * 继承基础数据访问对象，封装商品分类表操作
 */

const BaseDao = require('./baseDao');

class GoodsCategoryDao extends BaseDao {
  constructor() {
    super('goods_categories');
  }

  /**
   * 查询所有活跃商品分类
   * @param {Object} options - 查询选项
   * @returns {Array} 商品分类列表
   */
  async findActive(options = {}) {
    return await this.findMany({ is_active: true }, options);
  }

  /**
   * 根据父分类ID查询子分类
   * @param {String} parentId - 父分类ID
   * @param {Object} options - 查询选项
   * @returns {Array} 子分类列表
   */
  async findByParentId(parentId, options = {}) {
    return await this.findMany(
      { parent_id: parentId, is_active: true },
      options
    );
  }
}

module.exports = new GoodsCategoryDao();
