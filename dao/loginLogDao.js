/**
 * 登录日志数据访问对象
 * 继承基础数据访问对象，封装登录日志表操作
 */

const BaseDao = require('./baseDao');

class LoginLogDao extends BaseDao {
  constructor() {
    super('login_logs');
  }

  /**
   * 根据用户ID查询登录日志
   * @param {String} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Array} 登录日志列表
   */
  async findByUserId(userId, options = {}) {
    return await this.findMany({ user_id: userId }, options);
  }
}

module.exports = new LoginLogDao();
