/**
 * 安全响应头中间件
 * 用于设置各种安全响应头，防止常见的Web攻击
 */

const helmet = require('helmet');

const securityHeadersMiddleware = (app) => {
  // 开发环境下放宽安全限制
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 使用Helmet中间件设置安全头
  app.use(
    helmet({
      // 配置内容安全策略
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          connectSrc: ["'self'", 'http:', 'https:'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // 配置XSS防护
      xssFilter: true,
      // 配置不允许在iframe中加载
      frameguard: { action: 'deny' },
      // 配置不允许嗅探MIME类型
      noSniff: true,
      // 开发环境下禁用HSTS
      hsts: isDevelopment
        ? false
        : {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
      // 开发环境下放宽跨域资源共享
      crossOriginResourcePolicy: isDevelopment
        ? { policy: 'cross-origin' }
        : { policy: 'same-site' },
      // 开发环境下禁用跨域嵌入器策略
      crossOriginEmbedderPolicy: !isDevelopment,
      // 配置跨域opener政策
      crossOriginOpenerPolicy: { policy: 'same-origin' },
    })
  );

  // 自定义安全头
  app.use((req, res, next) => {
    // 禁用X-Powered-By头
    res.removeHeader('X-Powered-By');

    // 设置Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 设置Permissions-Policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );

    next();
  });
};

module.exports = securityHeadersMiddleware;
