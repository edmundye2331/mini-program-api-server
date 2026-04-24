/**
 * 商品数据访问对象
 * 继承基础数据访问对象，封装商品表操作
 */

const BaseDao = require('./baseDao');

class GoodsDao extends BaseDao {
  constructor() {
    super('goods');
  }

  /**
   * 根据分类ID查询商品列表
   * @param {String} categoryId - 分类ID
   * @param {Object} options - 查询选项
   * @returns {Array} 商品列表
   */
  async findByCategoryId(categoryId, options = {}) {
    return await this.findMany({ category_id: categoryId }, options);
  }

  /**
   * 根据状态查询商品列表
   * @param {String} status - 商品状态
   * @param {Object} options - 查询选项
   * @returns {Array} 商品列表
   */
  async findByStatus(status, options = {}) {
    return await this.findMany({ status }, options);
  }

  /**
   * 查询上架商品列表
   * @param {Object} options - 查询选项
   * @returns {Array} 上架商品列表
   */
  async findOnSale(options = {}) {
    return await this.findByStatus('onsale', options);
  }

  /**
   * 更新商品库存
   * @param {String} goodsId - 商品ID
   * @param {Number} stock - 库存数量
   * @returns {Object} 更新结果
   */
  async updateStock(goodsId, stock) {
    return await this.update({ stock }, { id: goodsId });
  }

  /**
   * 扣减商品库存
   * @param {String} goodsId - 商品ID
   * @param {Number} quantity - 扣减数量
   * @returns {Object} 更新结果
   */
  async reduceStock(goodsId, quantity) {
    return await this.update(
      { stock: () => `stock - ${quantity}` },
      { id: goodsId }
    );
  }
}

module.exports = new GoodsDao();
