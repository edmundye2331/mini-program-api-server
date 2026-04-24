/**
 * 测试Swagger API文档是否正常工作
 */

const request = require('supertest');
const setupSwagger = require('./config/swagger');
const app = require('./server');

async function testSwagger() {
  try {
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT);

    console.log('服务器启动成功，正在测试Swagger文档...');

    // 测试API文档是否可访问
    const response = await request(app).get('/api-docs');

    console.log(`API文档响应状态码: ${response.statusCode}`);

    if (response.statusCode === 200) {
      console.log('✅ Swagger API文档正常工作');
      console.log('文档地址: http://localhost:3000/api-docs');
    } else {
      console.log('❌ Swagger API文档访问失败');
    }

    // 关闭服务器
    server.close();

    console.log('测试完成');
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    process.exit(1);
  }
}

testSwagger();
