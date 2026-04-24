/**
 * 用户数据访问对象
 * 继承基础数据访问对象，封装用户表操作
 */

const BaseDao = require('./baseDao');

class UserDao extends BaseDao {
  constructor() {
    super('users');
  }

  /**
   * 根据手机号查询用户
   * @param {String} phone - 手机号
   * @returns {Object} 用户信息
   */
  async findByPhone(phone) {
    return await this.findOne({ phone });
  }

  /**
   * 根据微信OpenId查询用户
   * @param {String} openId - 微信OpenId
   * @returns {Object} 用户信息
   */
  async findByWechatOpenId(openId) {
    return await this.findOne({ wechat_openid: openId });
  }

  /**
   * 更新用户密码
   * @param {String} userId - 用户ID
   * @param {String} password - 密码（加密后）
   * @returns {Object} 更新结果
   */
  async updatePassword(userId, password) {
    return await this.update({ password }, { id: userId });
  }
}

module.exports = new UserDao();
