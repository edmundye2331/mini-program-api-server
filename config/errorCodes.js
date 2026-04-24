/**
 * 统一业务错误码配置
 * 格式：错误码 = 模块编码(2位) + 错误类型(2位) + 具体错误号(3位)
 * 模块编码：10-用户模块, 20-订单模块, 30-商品模块, 40-会员模块, 50-支付模块, 60-验证码模块, 99-通用模块
 */

const errorCodes = {
  // 通用错误码
  COMMON: {
    SUCCESS: { code: '99000', message: { zh: '请求成功', en: 'Success' } },
    BAD_REQUEST: {
      code: '99001',
      message: { zh: '请求参数错误', en: 'Bad Request' },
    },
    UNAUTHORIZED: {
      code: '99002',
      message: { zh: '未授权访问', en: 'Unauthorized' },
    },
    FORBIDDEN: { code: '99003', message: { zh: '禁止访问', en: 'Forbidden' } },
    NOT_FOUND: {
      code: '99004',
      message: { zh: '资源不存在', en: 'Not Found' },
    },
    INTERNAL_ERROR: {
      code: '99005',
      message: { zh: '服务器内部错误', en: 'Internal Server Error' },
    },
    VALIDATE_FAILED: {
      code: '99006',
      message: { zh: '参数验证失败', en: 'Validation Failed' },
    },
    TOO_MANY_REQUESTS: {
      code: '99007',
      message: { zh: '请求过于频繁', en: 'Too Many Requests' },
    },
    VERIFY_CODE_ERROR: {
      code: '99008',
      message: {
        zh: '验证码错误或已过期',
        en: 'Verification Code Error or Expired',
      },
    },
    VERIFY_CODE_EXIST: {
      code: '99009',
      message: { zh: '验证码已发送', en: 'Verification Code Already Sent' },
    },
  },

  // 用户模块错误码
  USER: {
    USER_NOT_EXIST: {
      code: '10001',
      message: { zh: '用户不存在', en: 'User does not exist' },
    },
    PHONE_EXIST: {
      code: '10002',
      message: { zh: '手机号已被注册', en: 'Phone number already registered' },
    },
    LOGIN_FAILED: {
      code: '10003',
      message: { zh: '登录失败', en: 'Login failed' },
    },
    WECHAT_LOGIN_FAILED: {
      code: '10004',
      message: { zh: '微信登录失败', en: 'Wechat login failed' },
    },
    INVALID_TOKEN: {
      code: '10005',
      message: { zh: '令牌无效或已过期', en: 'Invalid or expired token' },
    },
    UNAUTHORIZED: {
      code: '10006',
      message: { zh: '未授权访问', en: 'Unauthorized' },
    },
  },

  // 订单模块错误码
  ORDER: {
    ORDER_NOT_EXIST: {
      code: '20001',
      message: { zh: '订单不存在', en: 'Order does not exist' },
    },
    ORDER_STATUS_ERROR: {
      code: '20002',
      message: {
        zh: '订单状态不允许操作',
        en: 'Order status does not allow operation',
      },
    },
    ORDER_CREATE_FAILED: {
      code: '20003',
      message: { zh: '创建订单失败', en: 'Failed to create order' },
    },
    ORDER_PAY_FAILED: {
      code: '20004',
      message: { zh: '支付订单失败', en: 'Failed to pay order' },
    },
    ORDER_NOT_DELETABLE: {
      code: '20005',
      message: {
        zh: '当前订单状态不允许删除',
        en: 'Order cannot be deleted in current status',
      },
    },
    ORDER_DELETED: {
      code: '20006',
      message: { zh: '订单已删除', en: 'Order deleted' },
    },
  },

  // 商品模块错误码
  GOODS: {
    GOODS_NOT_EXIST: {
      code: '30001',
      message: { zh: '商品不存在', en: 'Goods does not exist' },
    },
    GOODS_STOCK_NOT_ENOUGH: {
      code: '30002',
      message: { zh: '商品库存不足', en: 'Insufficient goods stock' },
    },
  },

  // 支付模块错误码
  PAYMENT: {
    PAYMENT_FAILED: {
      code: '50001',
      message: { zh: '支付失败', en: 'Payment failed' },
    },
    PAYMENT_SIGN_FAILED: {
      code: '50002',
      message: {
        zh: '支付签名验证失败',
        en: 'Payment signature verification failed',
      },
    },
  },

  // 验证码错误码
  VERIFICATION: {
    CODE_INVALID: {
      code: '60001',
      message: { zh: '验证码错误', en: 'Invalid verification code' },
    },
    CODE_EXPIRED: {
      code: '60002',
      message: { zh: '验证码已过期', en: 'Verification code expired' },
    },
    CODE_NOT_SENT: {
      code: '60003',
      message: {
        zh: '请先获取验证码',
        en: 'Please get verification code first',
      },
    },
    PHONE_SEND_TOO_FREQUENT: {
      code: '60004',
      message: { zh: '发送过于频繁', en: 'Send too frequently' },
    },
  },
};

module.exports = errorCodes;
