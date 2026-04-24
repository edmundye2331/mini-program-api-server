/**
 * JWT工具单元测试
 */

const {
  generateToken,
  verifyToken,
  extractToken,
  verifyRefreshToken,
  refreshAccessToken,
  generateTokenPair,
} = require('../../utils/jwt');

describe('JWT 工具函数', () => {
  describe('generateToken 和 verifyToken', () => {
    it('应该正确生成和验证JWT token', () => {
      const payload = { userId: '12345', phone: '13812345678' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verification = verifyToken(token);
      expect(verification.success).toBe(true);
      expect(verification.data).toBeDefined();
      expect(verification.data.userId).toBe(payload.userId);
      expect(verification.data.phone).toBe(payload.phone);
    });

    it('应该验证无效的token', () => {
      const invalidToken = 'invalid_token_string';
      const verification = verifyToken(invalidToken);

      expect(verification.success).toBe(false);
    });
  });

  describe('generateTokenPair', () => {
    it('应该生成访问token和刷新token对', () => {
      const payload = { userId: '12345', phone: '13812345678' };
      const tokenPair = generateTokenPair(payload);

      expect(tokenPair.accessToken).toBeDefined();
      expect(typeof tokenPair.accessToken).toBe('string');

      expect(tokenPair.refreshToken).toBeDefined();
      expect(typeof tokenPair.refreshToken).toBe('string');

      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });
  });

  describe('extractToken', () => {
    it('应该正确从请求头中提取token', () => {
      const bearerToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const token = extractToken(bearerToken);

      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('应该直接返回token字符串', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      expect(extractToken(token)).toBe(token);
    });
  });

  describe('verifyRefreshToken', () => {
    it('应该验证刷新token', () => {
      const payload = { userId: '12345', phone: '13812345678' };
      const refreshToken = generateToken(payload, 'refresh');
      const verification = verifyRefreshToken(refreshToken);

      expect(verification.success).toBe(true);
      expect(verification.data).toBeDefined();
      expect(verification.data.tokenType).toBe('refresh');
    });

    it('应该拒绝访问token作为刷新token', () => {
      const payload = { userId: '12345', phone: '13812345678' };
      const accessToken = generateToken(payload, 'access');
      const verification = verifyRefreshToken(accessToken);

      expect(verification.success).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('应该使用刷新token获取新的访问token', async () => {
      const payload = { userId: '12345', phone: '13812345678' };
      const refreshToken = generateToken(payload, 'refresh');

      const result = refreshAccessToken(refreshToken);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
    });
  });
});
