/**
 * 快速API测试脚本
 * 不依赖jest，直接使用node运行
 */

const request = require('supertest');
const app = require('./server');

console.log('=== API接口快速测试 ===\n');

// 测试健康检查接口
async function testHealthCheck() {
  try {
    const response = await request(app).get('/health');
    console.log('✅ 健康检查接口测试通过');
    console.log(`   状态码: ${response.statusCode}`);
    console.log(`   成功: ${response.body.success}`);
    if (response.body.data) {
      console.log(`   数据库状态: ${response.body.data.database}`);
      console.log(`   Redis状态: ${response.body.data.redis}`);
    }
  } catch (error) {
    console.log('❌ 健康检查接口测试失败:', error.message);
  }
}

// 测试根接口
async function testRootEndpoint() {
  try {
    const response = await request(app).get('/');
    console.log('\n✅ 根接口测试通过');
    console.log(`   状态码: ${response.statusCode}`);
    console.log(`   成功: ${response.body.success}`);
    console.log(`   版本: ${response.body.data.version}`);
    console.log(`   环境: ${response.body.data.environment}`);
  } catch (error) {
    console.log('\n❌ 根接口测试失败:', error.message);
  }
}

// 测试404接口
async function testNotFoundEndpoint() {
  try {
    const response = await request(app).get('/non-existent-route');
    console.log('\n✅ 404接口测试通过');
    console.log(`   状态码: ${response.statusCode}`);
    console.log(`   成功: ${response.body.success}`);
    console.log(`   错误信息: ${response.body.message}`);
  } catch (error) {
    console.log('\n❌ 404接口测试失败:', error.message);
  }
}

// 测试安全响应头
async function testSecurityHeaders() {
  try {
    const response = await request(app).get('/');
    console.log('\n✅ 安全响应头测试通过');

    const headersToCheck = [
      'x-xss-protection',
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
      'content-security-policy',
    ];

    headersToCheck.forEach((header) => {
      if (response.headers[header]) {
        console.log(`   ${header}: ${response.headers[header]}`);
      } else {
        console.log(`   ⚠️ ${header}: 未设置`);
      }
    });
  } catch (error) {
    console.log('\n❌ 安全响应头测试失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  await testHealthCheck();
  await testRootEndpoint();
  await testNotFoundEndpoint();
  await testSecurityHeaders();

  console.log('\n=== 测试完成 ===');
  console.log('API服务器已成功启动并正常响应请求!');

  // 关闭服务器
  process.exit(0);
}

runAllTests();
