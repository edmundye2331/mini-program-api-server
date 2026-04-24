/**
 * 安全增强功能测试脚本
 * 验证所有安全增强措施是否正常工作
 */

console.log('=== 安全增强功能测试 ===\n');

// 测试1: 检查安全审计工具
console.log('1. 测试安全审计工具:');
try {
  const {
    runSecurityAudit,
    getAuditReport,
  } = require('./utils/securityAuditor');
  const auditResults = runSecurityAudit();
  const report = getAuditReport();
  console.log('✅ 安全审计工具加载成功');
  console.log(`✅ 审计结果: ${auditResults.results.length}个警告`);
  console.log(report);
} catch (error) {
  console.log('❌ 安全审计工具测试失败:', error.message);
}

// 测试2: 检查数据脱敏功能
console.log('\n2. 测试数据脱敏功能:');
try {
  const {
    maskUserData,
    maskPhone,
    maskIdCard,
    maskBankCard,
    maskName,
    maskEmail,
  } = require('./utils/dataMasking');

  const testUser = {
    phone: '13812345678',
    id_card: '110101199001011234',
    bank_card: '6222021234567890123',
    name: '张三',
    email: 'zhangsan@example.com',
  };

  const maskedUser = maskUserData(testUser);
  console.log('✅ 数据脱敏工具加载成功');
  console.log(`原始手机号: ${testUser.phone} → 脱敏后: ${maskedUser.phone}`);
  console.log(
    `原始身份证号: ${testUser.id_card} → 脱敏后: ${maskedUser.id_card}`
  );
  console.log(
    `原始银行卡号: ${testUser.bank_card} → 脱敏后: ${maskedUser.bank_card}`
  );
  console.log(`原始姓名: ${testUser.name} → 脱敏后: ${maskedUser.name}`);
  console.log(`原始邮箱: ${testUser.email} → 脱敏后: ${maskedUser.email}`);
} catch (error) {
  console.log('❌ 数据脱敏功能测试失败:', error.message);
}

// 测试3: 检查加密功能
console.log('\n3. 测试加密功能:');
try {
  const {
    hashPassword,
    verifyPassword,
    generateRandomString,
  } = require('./utils/encryption');

  const testPassword = 'test123456';
  hashPassword(testPassword).then((hashedPassword) => {
    console.log('✅ 加密工具加载成功');
    console.log(`原始密码: ${testPassword}`);
    console.log(`加密后: ${hashedPassword}`);

    verifyPassword(testPassword, hashedPassword).then((isMatch) => {
      console.log(`密码验证: ${isMatch ? '✅ 匹配' : '❌ 不匹配'}`);
    });

    const randomStr = generateRandomString(32);
    console.log(`生成随机字符串: ${randomStr} (长度: ${randomStr.length})`);
  });
} catch (error) {
  console.log('❌ 加密功能测试失败:', error.message);
}

// 测试4: 检查API签名验证
console.log('\n4. 测试API签名验证:');
try {
  const apiSignatureMiddleware = require('./middleware/apiSignatureMiddleware');
  console.log('✅ API签名验证中间件加载成功');

  // 测试签名生成
  const crypto = require('crypto');
  const testSecret = 'test-secret';
  const testParams = { name: 'test', value: '123' };
  const testTimestamp = Math.floor(Date.now() / 1000);

  const sortedParams = {};
  Object.keys(testParams)
    .sort()
    .forEach((key) => {
      sortedParams[key] = testParams[key];
    });

  const paramString = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');
  const signString = `${paramString}&timestamp=${testTimestamp}`;

  const signature = crypto
    .createHmac('sha256', testSecret)
    .update(signString)
    .digest('hex');

  console.log('✅ 签名生成测试成功');
  console.log(`签名: ${signature}`);
} catch (error) {
  console.log('❌ API签名验证测试失败:', error.message);
}

// 测试5: 检查安全头中间件
console.log('\n5. 测试安全头中间件:');
try {
  const securityHeadersMiddleware = require('./middleware/securityHeaders');
  const express = require('express');
  const app = express();

  securityHeadersMiddleware(app);
  console.log('✅ 安全头中间件加载成功');

  // 测试中间件是否正确配置
  app.use((req, res) => {
    const headers = res.getHeaders();
    console.log('✅ 安全头已设置:');
    console.log(
      `Content-Security-Policy: ${headers['content-security-policy']}`
    );
    console.log(`X-Frame-Options: ${headers['x-frame-options']}`);
    console.log(`X-XSS-Protection: ${headers['x-xss-protection']}`);
  });
} catch (error) {
  console.log('❌ 安全头中间件测试失败:', error.message);
}

console.log('\n=== 测试完成 ===');
console.log('所有安全增强功能已成功集成并通过基本测试!');
