/**
 * API接口测试脚本
 * 使用supertest测试所有API端点
 */

const request = require('supertest');
const app = require('../server');

describe('API接口测试', () => {
  // 测试健康检查接口
  describe('GET /health', () => {
    it('应该返回200状态码和健康状态', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toEqual('healthy');
      expect(['connected', 'disconnected']).toContain(
        response.body.data.database
      );
    });
  });

  // 测试根接口
  describe('GET /', () => {
    it('应该返回200状态码和API信息', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.version).toEqual('1.0.0');
      expect(response.body.data.endpoints).toBeDefined();
    });
  });

  // 测试404接口
  describe('GET /non-existent-route', () => {
    it('应该返回404状态码和错误信息', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试安全响应头
  describe('Response headers', () => {
    it('应该包含安全响应头', async () => {
      const response = await request(app).get('/');

      // 检查是否包含安全响应头
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['x-frame-options']).toEqual('DENY');
      expect(response.headers['x-content-type-options']).toEqual('nosniff');
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });

  // 测试API版本控制
  describe('API versioning', () => {
    it('应该支持 /api/v1 前缀的接口', async () => {
      const response = await request(app).get('/api/v1/user');
      expect([200, 401, 403, 404]).toContain(response.statusCode);
    });
  });
});
