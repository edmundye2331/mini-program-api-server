const Joi = require('joi');

// 验证用户登录
const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().error(new Error('手机号格式不正确')),
  code: Joi.string().length(6).required().error(new Error('验证码格式不正确'))
});

// 验证微信登录
const wechatLoginSchema = Joi.object({
  code: Joi.string().required().error(new Error('缺少微信登录code')),
  userInfo: Joi.object().optional()
});

// 验证修改密码
const changePasswordSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  oldPassword: Joi.string().required().error(new Error('缺少原密码')),
  newPassword: Joi.string().min(6).required().error(new Error('新密码至少需要6个字符'))
});

// 验证绑定手机号
const bindPhoneSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().error(new Error('手机号格式不正确')),
  code: Joi.string().length(6).required().error(new Error('验证码格式不正确'))
});

// 验证创建订单
const createOrderSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  orderType: Joi.string().required().error(new Error('缺少订单类型')),
  items: Joi.array().min(1).required().error(new Error('订单商品不能为空')),
  totalAmount: Joi.number().positive().required().error(new Error('总金额必须大于0')),
  remark: Joi.string().optional()
});

// 验证支付订单
const payOrderSchema = Joi.object({
  orderId: Joi.string().required().error(new Error('缺少订单ID')),
  paymentMethod: Joi.string().valid('wechat', 'balance').optional().default('wechat')
});

// 验证充值
const rechargeSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  amount: Joi.number().positive().required().error(new Error('充值金额必须大于0')),
  bonusAmount: Joi.number().min(0).optional().default(0)
});

// 验证更新用户信息
const updateUserInfoSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  nickname: Joi.string().optional(),
  avatar: Joi.string().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  birthday: Joi.string().optional(),
  city: Joi.string().optional(),
  province: Joi.string().optional(),
  country: Joi.string().optional()
});

// 验证添加到购物车
const addToCartSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID')),
  quantity: Joi.number().positive().integer().required().error(new Error('数量必须是正整数'))
});

// 验证更新购物车商品数量
const updateCartItemSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID')),
  quantity: Joi.number().integer().required().error(new Error('数量必须是整数'))
});

// 验证删除购物车商品
const deleteCartItemSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID'))
});

// 验证积分兑换
const exchangeGoodsSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID'))
});

// 验证领取生日礼
const claimBirthdayGiftSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID'))
});

// 验证发送短信
const sendSmsCodeSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().error(new Error('手机号格式不正确'))
});

// 验证中间件工厂函数
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.validate(req.body || req.query);

      if (result.error) {
        return res.error(result.error.message, 400);
      }

      // 将验证后的数据附加到请求对象上
      req.validatedData = result.value;
      next();
    } catch (error) {
      return res.error('参数验证失败', 400, error);
    }
  };
};

module.exports = {
  validate,
  loginSchema,
  wechatLoginSchema,
  changePasswordSchema,
  bindPhoneSchema,
  createOrderSchema,
  payOrderSchema,
  rechargeSchema,
  updateUserInfoSchema,
  addToCartSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
  exchangeGoodsSchema,
  claimBirthdayGiftSchema,
  sendSmsCodeSchema
};
