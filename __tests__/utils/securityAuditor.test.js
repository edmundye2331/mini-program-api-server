/**
 * 安全审计工具单元测试
 */

const {
  runSecurityAudit,
  getAuditReport,
  getHTMLAuditReport,
  AuditResultType,
} = require('../../utils/securityAuditor');

describe('securityAuditor 工具函数', () => {
  describe('runSecurityAudit', () => {
    it('应该返回安全审计结果对象', () => {
      const result = runSecurityAudit();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.timestamp).toBeDefined();
      expect(result.env).toBeDefined();
      expect(result.version).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('应该包含预期的审计结果类型', () => {
      const result = runSecurityAudit();

      const types = result.results.map((item) => item.type);
      const validTypes = Object.values(AuditResultType);

      types.forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });
  });

  describe('AuditResultType', () => {
    it('应该包含所有预期的结果类型', () => {
      expect(AuditResultType.INFO).toBe('info');
      expect(AuditResultType.WARNING).toBe('warning');
      expect(AuditResultType.ERROR).toBe('error');
      expect(AuditResultType.CRITICAL).toBe('critical');
    });
  });

  describe('getAuditReport', () => {
    it('应该返回格式化的审计报告字符串', () => {
      const report = getAuditReport();

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report).toContain('安全审计报告');
    });
  });

  describe('getHTMLAuditReport', () => {
    it('应该返回HTML格式的审计报告', () => {
      const report = getHTMLAuditReport();

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report).toContain('<!DOCTYPE html>');
      expect(report).toContain('安全审计报告');
    });
  });
});
