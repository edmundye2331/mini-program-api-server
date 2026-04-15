/**
 * 通用控制器
 * 处理优惠券、门店、协议等接口
 */

const { db } = require('../config/mysql');

/**
 * 获取优惠券列表
 */
const getCoupons = async (req, res) => {
  try {
    const { userId, status } = req.query;

    // 构建查询条件
    const where = {};
    if (userId) {
      where.user_id = userId;
    }
    if (status) {
      where.status = status;
    }

    const coupons = await db.findMany('coupons', where, {
      orderBy: 'created_at',
      order: 'ASC'
    });

    res.success(coupons, '获取优惠券列表成功');
  } catch (error) {
    console.error('获取优惠券列表错误:', error);
    res.error('获取优惠券列表失败', 500, error);
  }
};

/**
 * 获取门店列表
 */
const getStores = async (req, res) => {
  try {
    const stores = await db.findMany('stores', {}, {
      orderBy: 'created_at',
      order: 'ASC'
    });
    res.success(stores, '获取门店列表成功');
  } catch (error) {
    console.error('获取门店列表错误:', error);
    res.error('获取门店列表失败', 500, error);
  }
};

/**
 * 获取协议内容
 */
const getProtocol = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.error('缺少协议类型', 400);
    }

    const protocol = await db.findOne('protocols', { type: type });

    if (!protocol) {
      return res.error('协议不存在', 404);
    }

    res.success({
      type: type,
      content: protocol.content
    }, '获取协议内容成功');
  } catch (error) {
    console.error('获取协议内容错误:', error);
    res.error('获取协议内容失败', 500, error);
  }
};

/**
 * 发送验证码
 */
const sendSmsCode = (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.error('缺少手机号', 400);
    }

    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return res.error('手机号格式不正确', 400);
    }

    // 实际应调用短信服务发送验证码
    // 这里简化处理，返回成功
    res.success(null, '验证码已发送');
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.error('发送验证码失败', 500, error);
  }
};

module.exports = {
  getCoupons,
  getStores,
  getProtocol,
  sendSmsCode
};
