/**
 * Swagger API文档配置
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '微信小程序API服务器',
      version: '1.0.0',
      description: '提供会员、订单、积分等功能的RESTful API',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/**/*.js', './controllers/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: '微信小程序API文档',
      customfavIcon: '/images/favicon.png',
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    console.log('📚 Swagger API文档已启动: http://localhost:3000/api-docs');
  }
};

module.exports = setupSwagger;
