/**
 * CORS配置
 * 控制跨域资源共享策略
 */

/**
 * 开发环境允许的域名
 */
const DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

/**
 * 生产环境允许的域名
 * TODO: 替换为实际的小程序域名
 */
const PRODUCTION_ORIGINS = [
  // 添加生产环境的域名
  // 'https://yourapp.com',
  // 'https://api.yourapp.com'
];

/**
 * 根据环境获取允许的域名列表
 */
const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    return PRODUCTION_ORIGINS;
  }

  return DEVELOPMENT_ORIGINS;
};

/**
 * CORS配置选项
 */
const corsOptions = {
  // 动态设置允许的来源
  origin: (origin, callback) => {
    // 如果没有origin（比如移动应用、Postman等），允许访问
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = getAllowedOrigins();

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      // 开发环境允许所有origin
      callback(null, true);
    } else {
      callback(new Error('CORS不允许的来源: ' + origin));
    }
  },

  // 允许的HTTP方法
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // 允许的请求头
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Token',
    'X-Requested-With'
  ],

  // 暴露的响应头
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range'
  ],

  // 允许携带凭证（cookies）
  credentials: true,

  // 预检请求缓存时间（秒）
  maxAge: 86400,  // 24小时

  // 预飞请求响应状态码
  optionsSuccessStatus: 200
};

/**
 * 微信小程序域名白名单配置
 */
const MINIPROGRAM_DOMAINS = [
  // TODO: 添加实际的微信小程序域名
  // 'https://servicewechat.com/wx*********/**'
];

/**
 * 检查是否为微信小程序的请求
 */
const isMiniprogramRequest = (req) => {
  const referer = req.headers.referer || '';
  return MINIPROGRAM_DOMAINS.some(domain => referer.includes(domain));
};

module.exports = {
  corsOptions,
  getAllowedOrigins,
  isMiniprogramRequest,
  DEVELOPMENT_ORIGINS,
  PRODUCTION_ORIGINS
};
