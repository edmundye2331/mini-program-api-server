const Joi = require('joi');

// 验证用户登录
const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .required()
    .error(new Error('手机号格式不正确')),
  code: Joi.string().length(6).required().error(new Error('验证码格式不正确')),
});

// 验证微信登录
const wechatLoginSchema = Joi.object({
  code: Joi.string().required().error(new Error('缺少微信登录code')),
  userInfo: Joi.object().optional(),
});

// 删除重复的changePasswordSchema声明

// 验证绑定手机号
const bindPhoneSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .required()
    .error(new Error('手机号格式不正确')),
  code: Joi.string().length(6).required().error(new Error('验证码格式不正确')),
});

// 验证创建订单
const createOrderSchema = Joi.object({
  orderType: Joi.string().required().error(new Error('缺少订单类型')),
  items: Joi.array().min(1).required().error(new Error('订单商品不能为空')),
  totalAmount: Joi.number()
    .positive()
    .required()
    .error(new Error('总金额必须大于0')),
  remark: Joi.string().optional().allow(''),
}).unknown(true);

// 验证支付订单
const payOrderSchema = Joi.object({
  orderId: Joi.string().required().error(new Error('缺少订单ID')),
  paymentMethod: Joi.string()
    .valid('wechat', 'balance')
    .optional()
    .default('wechat'),
});

// 验证取消订单
const cancelOrderSchema = Joi.object({
  orderId: Joi.string().required().error(new Error('缺少订单ID')),
});

// 验证充值
const rechargeSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  amount: Joi.number()
    .positive()
    .required()
    .error(new Error('充值金额必须大于0')),
  bonusAmount: Joi.number().min(0).optional().default(0),
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
  country: Joi.string().optional(),
}).unknown(true);

// 验证添加到购物车
const addToCartSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID')),
  quantity: Joi.number()
    .positive()
    .integer()
    .required()
    .error(new Error('数量必须是正整数')),
});

// 验证更新购物车商品数量
const updateCartItemSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID')),
  quantity: Joi.number()
    .integer()
    .required()
    .error(new Error('数量必须是整数')),
});

// 验证删除购物车商品
const deleteCartItemSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID')),
});

// 验证积分兑换
const exchangeGoodsSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  goodsId: Joi.number().positive().required().error(new Error('缺少商品ID')),
  quantity: Joi.number().positive().integer().optional().default(1),
});

// 验证领取生日礼
const claimBirthdayGiftSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
});

// 验证发送验证码
const sendSmsCodeSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .required()
    .error(new Error('手机号格式不正确')),
  type: Joi.string()
    .valid('login', 'register', 'bind', 'reset-password')
    .optional()
    .default('default')
    .error(new Error('验证码类型不正确')),
});

// 验证验证码
const verifySmsCodeSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .required()
    .error(new Error('手机号格式不正确')),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .error(new Error('验证码格式不正确')),
  type: Joi.string()
    .valid('login', 'register', 'bind', 'reset-password')
    .optional()
    .default('default')
    .error(new Error('验证码类型不正确')),
});

// 验证刷新token
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().error(new Error('缺少刷新token')),
});

// 验证注销登录
const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

// 验证文件上传
const uploadSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  file: Joi.any().required().error(new Error('缺少上传文件')),
});

// 验证修改密码
const changePasswordSchema = Joi.object({
  userId: Joi.string().required().error(new Error('缺少用户ID')),
  oldPassword: Joi.string()
    .min(6)
    .required()
    .error(new Error('原密码至少需要6个字符')),
  newPassword: Joi.string()
    .min(6)
    .required()
    .error(new Error('新密码至少需要6个字符')),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .error(new Error('两次输入的密码不一致')),
});

// 验证商品查询
const getGoodsListSchema = Joi.object({
  category: Joi.string().optional(),
  keyword: Joi.string().optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
}).unknown();

// 验证获取订单列表
const getOrderListSchema = Joi.object({
  orderType: Joi.string().optional(),
  status: Joi.string()
    .valid('pending', 'paid', 'using', 'completed', 'cancelled', 'refunded')
    .optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
}).unknown();

// 验证中间件工厂函数
const validate = (schema) => (req, res, next) => {
  try {
    // 合并请求体、查询参数和路由参数
    const validationData = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const result = schema.validate(validationData);

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

module.exports = {
  validate,
  loginSchema,
  wechatLoginSchema,
  changePasswordSchema,
  bindPhoneSchema,
  createOrderSchema,
  payOrderSchema,
  cancelOrderSchema,
  rechargeSchema,
  updateUserInfoSchema,
  addToCartSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
  exchangeGoodsSchema,
  claimBirthdayGiftSchema,
  sendSmsCodeSchema,
  verifySmsCodeSchema,
  refreshTokenSchema,
  logoutSchema,
  uploadSchema,
  getGoodsListSchema,
  getOrderListSchema,
  getOrderDetailSchema: Joi.object({
    orderId: Joi.string().required().error(new Error('缺少订单ID')),
  }),
  deleteOrderSchema: Joi.object({
    orderId: Joi.string().required().error(new Error('缺少订单ID')),
  }),
};
