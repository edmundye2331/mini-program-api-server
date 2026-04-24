/**
 * 加密工具单元测试
 */

const {
  hashPassword,
  verifyPassword,
  generateRandomString,
  simpleHash,
} = require('../../utils/encryption');

describe('encryption 工具函数', () => {
  describe('hashPassword 和 verifyPassword', () => {
    it('应该正确加密和验证密码', async () => {
      const password = 'test123456';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);

      const isMatch = await verifyPassword(password, hashedPassword);
      expect(isMatch).toBe(true);

      const isWrongMatch = await verifyPassword(
        'wrongpassword',
        hashedPassword
      );
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('应该生成指定长度的随机字符串', () => {
      const length = 16;
      const randomString = generateRandomString(length);

      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(length);
      expect(typeof randomString).toBe('string');
    });

    it('应该生成不同的随机字符串', () => {
      const string1 = generateRandomString(16);
      const string2 = generateRandomString(16);

      expect(string1).not.toBe(string2);
    });

    it('默认应该生成16位长度的随机字符串', () => {
      const randomString = generateRandomString();
      expect(randomString.length).toBe(16);
    });
  });

  describe('simpleHash', () => {
    it('应该生成字符串的哈希值', () => {
      const str = 'test string';
      const hash = simpleHash(str);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('相同的字符串应该生成相同的哈希值', () => {
      const str = 'test string';
      const hash1 = simpleHash(str);
      const hash2 = simpleHash(str);

      expect(hash1).toBe(hash2);
    });
  });
});
