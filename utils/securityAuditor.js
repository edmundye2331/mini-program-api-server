/**
 * 安全审计工具模块
 * 用于定期检查应用程序的安全状况
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 安全审计配置
 */
const SECURITY_CONFIG = {
  // 密码复杂度规则
  passwordRules: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    specialChars: '!@#$%^&*()_+=-[]{}|;:,.<>?',
  },
  // 敏感配置检查
  sensitiveConfigPatterns: [
    /password|secret|key|token|api_key|apiKey|jwt_secret|jwtSecret/i,
    /(mysql|postgres|mongodb|redis|ftp):\/\/.*:.*@/i,
  ],
  // 敏感文件检查
  sensitiveFiles: [
    '.env',
    '.env.*',
    '.env.local',
    '.env.development.local',
    '.env.production.local',
    '*.pem',
    '*.key',
    '*.cert',
    '*.crt',
    '*.pfx',
    '*.sql',
    '*.dump',
    '*.sql.gz',
    '*.backup',
    'package-lock.json',
    'yarn.lock',
    'bun.lock',
  ],
  // 危险文件权限检查
  dangerousFilePermissions: [
    { path: '.env', maxPermissions: 0o600 },
    { path: '.env.*', maxPermissions: 0o600 },
    { path: 'cert/', maxPermissions: 0o700 },
    { path: 'logs/', maxPermissions: 0o700 },
  ],
};

/**
 * 安全审计结果类型
 */
const AuditResultType = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * 检查密码复杂度
 * @param {String} password - 要检查的密码
 * @returns {Object} 密码复杂度检查结果
 */
const checkPasswordComplexity = (password) => {
  const results = [];

  // 检查密码长度
  if (password.length < SECURITY_CONFIG.passwordRules.minLength) {
    results.push({
      type: AuditResultType.WARNING,
      message: `密码长度不足${SECURITY_CONFIG.passwordRules.minLength}个字符`,
    });
  }

  // 检查大小写
  if (
    SECURITY_CONFIG.passwordRules.requireUppercase &&
    !/[A-Z]/.test(password)
  ) {
    results.push({
      type: AuditResultType.WARNING,
      message: '密码至少需要包含一个大写字母',
    });
  }

  if (
    SECURITY_CONFIG.passwordRules.requireLowercase &&
    !/[a-z]/.test(password)
  ) {
    results.push({
      type: AuditResultType.WARNING,
      message: '密码至少需要包含一个小写字母',
    });
  }

  // 检查数字
  if (SECURITY_CONFIG.passwordRules.requireNumber && !/[0-9]/.test(password)) {
    results.push({
      type: AuditResultType.WARNING,
      message: '密码至少需要包含一个数字',
    });
  }

  // 检查特殊字符
  if (SECURITY_CONFIG.passwordRules.requireSpecialChar) {
    const specialCharPattern = new RegExp(
      `[${SECURITY_CONFIG.passwordRules.specialChars}]`
    );
    if (!specialCharPattern.test(password)) {
      results.push({
        type: AuditResultType.WARNING,
        message: '密码至少需要包含一个特殊字符',
      });
    }
  }

  return results;
};

/**
 * 检查配置文件中的敏感信息
 * @param {String} configPath - 配置文件路径
 * @returns {Array} 敏感信息检查结果
 */
const checkConfigFile = (configPath) => {
  const results = [];

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      const filename = path.basename(configPath);

      // 检查文件权限
      const stats = fs.statSync(configPath);
      const permissions = `0o${stats.mode.toString(8).slice(-3)}`;

      // 检查敏感模式
      SECURITY_CONFIG.sensitiveConfigPatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          results.push({
            type: AuditResultType.WARNING,
            message: `配置文件${filename}可能包含敏感信息: ${matches[0]}`,
          });
        }
      });
    }
  } catch (error) {
    results.push({
      type: AuditResultType.ERROR,
      message: `无法读取配置文件${configPath}: ${error.message}`,
    });
  }

  return results;
};

/**
 * 检查文件和目录权限
 * @param {String} checkPath - 检查路径
 * @param {Number} maxPermissions - 最大允许的权限值
 * @returns {Array} 权限检查结果
 */
const checkFilePermissions = (checkPath, maxPermissions) => {
  const results = [];

  try {
    if (fs.existsSync(checkPath)) {
      const stats = fs.statSync(checkPath);
      const currentPermissions = stats.mode & 0o777; // 只获取文件权限位
      const formattedCurrent = `0o${currentPermissions.toString(8).padStart(3, '0')}`;
      const formattedMax = `0o${maxPermissions.toString(8).padStart(3, '0')}`;

      if (currentPermissions > maxPermissions) {
        results.push({
          type: AuditResultType.WARNING,
          message: `${checkPath}权限过高，当前权限: ${formattedCurrent}, 建议权限: ${formattedMax}`,
        });
      }
    }
  } catch (error) {
    results.push({
      type: AuditResultType.ERROR,
      message: `无法检查${checkPath}权限: ${error.message}`,
    });
  }

  return results;
};

/**
 * 安全审计主函数
 * @returns {Object} 完整的安全审计结果
 */
const runSecurityAudit = () => {
  const auditResults = {
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || 'unknown',
    results: [],
  };

  // 检查危险文件权限
  SECURITY_CONFIG.dangerousFilePermissions.forEach((item) => {
    auditResults.results.push(
      ...checkFilePermissions(item.path, item.maxPermissions)
    );
  });

  // 检查配置文件
  const configFiles = ['.env', '.env.example'];
  configFiles.forEach((file) => {
    auditResults.results.push(...checkConfigFile(file));
  });

  // 检查密码复杂度（从环境变量中检查）
  const passwordsToCheck = [
    { name: '数据库密码', value: process.env.DB_PASSWORD },
    { name: 'JWT密钥', value: process.env.JWT_SECRET },
    { name: 'JWT刷新密钥', value: process.env.JWT_REFRESH_SECRET },
    { name: 'API签名密钥', value: process.env.API_SIGNATURE_SECRET },
    { name: '数据加密密钥', value: process.env.DATA_ENCRYPTION_KEY },
    { name: '微信小程序密钥', value: process.env.WX_APP_SECRET },
  ];

  passwordsToCheck.forEach(({ name, value }) => {
    if (value) {
      const checks = checkPasswordComplexity(value);
      checks.forEach((check) => {
        auditResults.results.push({
          type: check.type,
          message: `配置项${name}不满足密码复杂度要求: ${check.message}`,
        });
      });
    }
  });

  // 检查是否使用默认密码
  const defaultPasswords = [
    { key: 'DB_PASSWORD', value: 'zhenshanhe5273' },
    { key: 'JWT_SECRET', value: 'your_jwt_secret_key' },
    { key: 'JWT_SECRET', value: 'default_jwt_secret_key_change_in_production' },
    { key: 'API_SIGNATURE_SECRET', value: 'default_api_signature_secret' },
    {
      key: 'DATA_ENCRYPTION_KEY',
      value: 'default_encryption_key_32_bytes_long',
    },
  ];

  defaultPasswords.forEach(({ key, value }) => {
    if (process.env[key] === value) {
      auditResults.results.push({
        type: AuditResultType.CRITICAL,
        message: `配置项${key}使用默认值，存在安全风险，请立即修改`,
      });
    }
  });

  return auditResults;
};

/**
 * 格式化审计结果
 * @param {Object} auditResults - 审计结果
 * @returns {String} 格式化后的审计结果字符串
 */
const formatAuditResults = (auditResults) => {
  let output = `安全审计报告 - ${auditResults.timestamp}\n`;
  output += `环境: ${auditResults.env}\n`;
  output += `版本: ${auditResults.version}\n`;
  output += `结果数量: ${auditResults.results.length}\n`;
  output += '----------------------------------------\n\n';

  // 按类型分组显示结果
  const groupedResults = auditResults.results.reduce((groups, result) => {
    if (!groups[result.type]) {
      groups[result.type] = [];
    }
    groups[result.type].push(result);
    return groups;
  }, {});

  Object.keys(groupedResults).forEach((type) => {
    const results = groupedResults[type];
    output += `${type.toUpperCase()} (${results.length})\n`;

    results.forEach((result, index) => {
      const icon =
        type === 'INFO'
          ? 'ℹ️'
          : type === 'WARNING'
            ? '⚠️'
            : type === 'ERROR'
              ? '❌'
              : '🔥';
      output += `${icon} ${result.message}\n`;
    });

    if (results.length > 0) {
      output += '\n';
    }
  });

  // 显示总结
  const summary = Object.keys(groupedResults)
    .map((type) => {
      const count = groupedResults[type].length;
      return `${type.toUpperCase()}: ${count}`;
    })
    .join(', ');

  output += `总结: ${summary}\n`;

  return output;
};

/**
 * 导出审计报告
 * @param {Object} auditResults - 审计结果
 * @param {String} outputPath - 输出路径
 */
const exportAuditReport = (
  auditResults,
  outputPath = './security-audit-report.txt'
) => {
  const reportContent = formatAuditResults(auditResults);

  try {
    fs.writeFileSync(outputPath, reportContent);
    console.log(`审计报告已导出到: ${path.resolve(outputPath)}`);
  } catch (error) {
    console.error('导出审计报告失败:', error);
  }
};

/**
 * 获取审计报告
 * @returns {String} 审计报告字符串
 */
const getAuditReport = () => {
  const results = runSecurityAudit();
  return formatAuditResults(results);
};

/**
 * 获取HTML格式的审计报告
 * @returns {String} HTML格式的审计报告
 */
const getHTMLAuditReport = () => {
  const auditResults = runSecurityAudit();
  const summary = Object.keys(
    auditResults.results.reduce((groups, result) => {
      groups[result.type] = (groups[result.type] || 0) + 1;
      return groups;
    }, {})
  )
    .map((type) => {
      const count = auditResults.results.reduce(
        (sum, r) => (r.type === type ? sum + 1 : sum),
        0
      );
      return `${type.toUpperCase()}: ${count}`;
    })
    .join(', ');

  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>安全审计报告 - ${auditResults.timestamp}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9f9f9;
      }
      .header {
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      .summary {
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      .results {
        margin-bottom: 20px;
      }
      .result-item {
        background-color: #fff;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 15px;
      }
      .info {
        border-left: 4px solid #3498db;
      }
      .warning {
        border-left: 4px solid #f39c12;
      }
      .error {
        border-left: 4px solid #e74c3c;
      }
      .critical {
        border-left: 4px solid #c0392b;
      }
      .icon {
        margin-right: 10px;
      }
      .timestamp {
        color: #666;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>安全审计报告</h1>
      <div class="timestamp">${auditResults.timestamp}</div>
    </div>

    <div class="summary">
      <h2>审计摘要</h2>
      <p>环境: <strong>${auditResults.env}</strong></p>
      <p>版本: <strong>${auditResults.version}</strong></p>
      <p>结果: <strong>${summary}</strong></p>
    </div>

    <div class="results">
      <h2>详细结果</h2>
      ${auditResults.results
        .map(
          (result) => `
        <div class="result-item ${result.type}">
          <span class="icon">${
            result.type === 'info'
              ? 'ℹ️'
              : result.type === 'warning'
                ? '⚠️'
                : result.type === 'error'
                  ? '❌'
                  : '🔥'
          }</span>
          <strong>${result.type.toUpperCase()}</strong>: ${result.message}
        </div>
      `
        )
        .join('')}
    </div>
  </body>
  </html>
  `;
};

module.exports = {
  runSecurityAudit,
  formatAuditResults,
  exportAuditReport,
  getAuditReport,
  getHTMLAuditReport,
  AuditResultType,
};
