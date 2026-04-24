/**
 * 安全中间件
 * 提供各种安全功能，包括安全头、CSRF保护、XSS防护等
 */

const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * 安全配置
 */
const securityMiddleware = (app) => {
  // 使用helmet设置安全头
  app.use(helmet());

  // 防止XSS攻击
  app.use(xss());

  // 防止HTTP参数污染攻击
  app.use(hpp());

  // 禁用X-Powered-By头，防止泄露技术栈信息
  app.disable('x-powered-by');

  // 设置CSP（内容安全策略）
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
      },
    })
  );

  // 设置X-Frame-Options，防止点击劫持
  app.use(helmet.frameguard({ action: 'deny' }));

  // 设置X-DNS-Prefetch-Control，禁用DNS预取
  app.use(helmet.dnsPrefetchControl({ allow: false }));

  // 设置X-Content-Type-Options，防止MIME类型混淆
  app.use(helmet.noSniff());

  // 设置Referrer-Policy
  app.use(helmet.referrerPolicy({ policy: 'no-referrer-when-downgrade' }));
};

module.exports = securityMiddleware;
