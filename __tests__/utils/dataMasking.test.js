/**
 * 数据脱敏工具单元测试
 */

const {
  maskPhone,
  maskIdCard,
  maskBankCard,
  maskName,
  maskEmail,
  maskUserData,
} = require('../../utils/dataMasking');

describe('dataMasking 工具函数', () => {
  describe('maskPhone', () => {
    it('应该正确脱敏手机号', () => {
      expect(maskPhone('13812345678')).toBe('138****5678');
    });

    it('应该返回非11位手机号原样', () => {
      expect(maskPhone('1381234567')).toBe('1381234567');
      expect(maskPhone('138123456789')).toBe('138123456789');
      expect(maskPhone('')).toBe('');
      expect(maskPhone(null)).toBeNull();
    });
  });

  describe('maskIdCard', () => {
    it('应该正确脱敏身份证号', () => {
      expect(maskIdCard('110101199001011234')).toBe('110*******1234');
    });

    it('应该返回短身份证号原样', () => {
      expect(maskIdCard('123456')).toBe('123456');
      expect(maskIdCard('')).toBe('');
      expect(maskIdCard(null)).toBeNull();
    });
  });

  describe('maskBankCard', () => {
    it('应该正确脱敏银行卡号', () => {
      expect(maskBankCard('6222021234567890123')).toBe('6222****0123');
    });

    it('应该返回短银行卡号原样', () => {
      expect(maskBankCard('62220212345')).toBe('62220212345');
      expect(maskBankCard('622202123456')).toBe('6222****3456');
      expect(maskBankCard('')).toBe('');
      expect(maskBankCard(null)).toBeNull();
    });
  });

  describe('maskName', () => {
    it('应该正确脱敏中文姓名', () => {
      expect(maskName('张三')).toBe('张*');
      expect(maskName('李四')).toBe('李*');
      expect(maskName('王五')).toBe('王*');
      expect(maskName('张三丰')).toBe('张**丰');
      expect(maskName('欧阳娜娜')).toBe('欧**娜');
    });

    it('应该返回空姓名原样', () => {
      expect(maskName('')).toBe('');
      expect(maskName(null)).toBeNull();
    });
  });

  describe('maskEmail', () => {
    it('应该正确脱敏邮箱', () => {
      expect(maskEmail('zhangsan@example.com')).toBe('z****@example.com');
      expect(maskEmail('zhang.san@example.com')).toBe('z****@example.com');
      expect(maskEmail('a@example.com')).toBe('a****@example.com');
    });

    it('应该返回无效邮箱原样', () => {
      expect(maskEmail('zhangsan')).toBe('zhangsan');
      expect(maskEmail('')).toBe('');
      expect(maskEmail(null)).toBeNull();
    });
  });

  describe('maskUserData', () => {
    it('应该正确脱敏用户对象的敏感信息', () => {
      const user = {
        id: 1,
        phone: '13812345678',
        id_card: '110101199001011234',
        bank_card: '6222021234567890123',
        name: '张三',
        email: 'zhangsan@example.com',
        password_hash: 'hashed_password',
        wechat_session_key: 'session_key',
        openid: 'openid123',
        unionid: 'unionid123',
      };

      const maskedUser = maskUserData(user);

      expect(maskedUser.phone).toBe('138****5678');
      expect(maskedUser.id_card).toBe('110*******1234');
      expect(maskedUser.bank_card).toBe('6222****0123');
      expect(maskedUser.name).toBe('张*');
      expect(maskedUser.email).toBe('z****@example.com');
      expect(maskedUser.password_hash).toBeUndefined();
      expect(maskedUser.wechat_session_key).toBeUndefined();
      expect(maskedUser.openid).toBeUndefined();
      expect(maskedUser.unionid).toBeUndefined();
      expect(maskedUser.id).toBe(1);
    });

    it('应该正确脱敏包含idCard和bankCard字段的用户对象', () => {
      const user = {
        id: 2,
        idCard: '110101199001011234',
        bankCard: '6222021234567890123',
        nickname: '张三',
      };

      const maskedUser = maskUserData(user);

      expect(maskedUser.idCard).toBe('110*******1234');
      expect(maskedUser.bankCard).toBe('6222****0123');
      expect(maskedUser.nickname).toBe('张*');
    });
  });
});
