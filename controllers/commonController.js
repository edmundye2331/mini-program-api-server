/**
 * 通用控制器
 * 处理优惠券、门店、协议等接口
 */

const { database } = require('../config/database');

/**
 * 获取优惠券列表
 */
const getCoupons = (req, res) => {
  try {
    const { userId, status } = req.query;

    // 这里可以添加筛选逻辑
    let coupons = database.coupons;

    if (userId) {
      coupons = coupons.filter(c => c.userId === userId);
    }

    if (status) {
      coupons = coupons.filter(c => c.status === status);
    }

    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('获取优惠券列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取优惠券列表失败'
    });
  }
};

/**
 * 获取门店列表
 */
const getStores = (req, res) => {
  try {
    res.json({
      success: true,
      data: database.stores
    });
  } catch (error) {
    console.error('获取门店列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取门店列表失败'
    });
  }
};

/**
 * 获取协议内容
 */
const getProtocol = (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: '缺少协议类型'
      });
    }

    const content = database.protocols[type];

    if (!content) {
      return res.status(404).json({
        success: false,
        message: '协议不存在'
      });
    }

    res.json({
      success: true,
      data: {
        type: type,
        content: content
      }
    });
  } catch (error) {
    console.error('获取协议内容错误:', error);
    res.status(500).json({
      success: false,
      message: '获取协议内容失败'
    });
  }
};

/**
 * 发送验证码
 */
const sendSmsCode = (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: '缺少手机号'
      });
    }

    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 实际应调用短信服务发送验证码
    // 这里简化处理，返回成功
    res.json({
      success: true,
      message: '验证码已发送'
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败'
    });
  }
};

module.exports = {
  getCoupons,
  getStores,
  getProtocol,
  sendSmsCode
};
