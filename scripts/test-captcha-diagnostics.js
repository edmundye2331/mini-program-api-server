#!/usr/bin/env node

/**
 * 腾讯云验证码诊断测试脚本
 * 
 * 使用方法:
 * node scripts/test-captcha-diagnostics.js
 */

const { verifyCaptcha, validateCaptchaParams, isConfigured, CAPTCHA_CONFIG } = require('../config/tencentCaptcha');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'cyan');
}

async function runDiagnostics() {
  log('\n腾讯云验证码诊断测试工具', 'cyan');
  log(`测试时间: ${new Date().toISOString()}`, 'cyan');

  // 1. 配置检查
  section('1. 环境配置检查');
  
  const configStatus = {
    'TENCENT_SECRET_ID': !!process.env.TENCENT_SECRET_ID,
    'TENCENT_SECRET_KEY': !!process.env.TENCENT_SECRET_KEY,
    'TENCENT_CAPTCHA_APP_ID': !!process.env.TENCENT_CAPTCHA_APP_ID,
    'TENCENT_CAPTCHA_SECRET_KEY': !!process.env.TENCENT_CAPTCHA_SECRET_KEY,
  };

  Object.entries(configStatus).forEach(([key, value]) => {
    const status = value ? '✅ 已配置' : '❌ 未配置';
    log(`${key}: ${status}`, value ? 'green' : 'red');
  });

  const isFullyConfigured = isConfigured();
  log(`\n整体配置状态: ${isFullyConfigured ? '✅ 完整' : '⚠️  模拟模式'}`, isFullyConfigured ? 'green' : 'yellow');

  // 2. 参数验证测试
  section('2. 参数验证测试');

  const testCases = [
    {
      name: '空 Ticket',
      ticket: '',
      randstr: 'randstr123456',
      shouldFail: true,
    },
    {
      name: '空 Randstr',
      ticket: 'ticket1234567890',
      randstr: '',
      shouldFail: true,
    },
    {
      name: 'Ticket 过短',
      ticket: 'short',
      randstr: 'randstr123456',
      shouldFail: true,
    },
    {
      name: 'Randstr 过短',
      ticket: 'ticket1234567890',
      randstr: 'short',
      shouldFail: true,
    },
    {
      name: '有效参数',
      ticket: 'ticket_valid_1234567890',
      randstr: 'randstr_valid_123456',
      shouldFail: false,
    },
  ];

  testCases.forEach((testCase, index) => {
    const result = validateCaptchaParams(testCase.ticket, testCase.randstr);
    const passed = result.isValid === !testCase.shouldFail;
    
    log(`\n测试 ${index + 1}: ${testCase.name}`, 'yellow');
    log(`  Ticket: "${testCase.ticket.substring(0, 20)}${testCase.ticket.length > 20 ? '...' : ''}"`, 'reset');
    log(`  Randstr: "${testCase.randstr.substring(0, 20)}${testCase.randstr.length > 20 ? '...' : ''}"`, 'reset');
    
    if (result.isValid) {
      log(`  结果: ✅ 验证通过`, 'green');
    } else {
      log(`  结果: ❌ 验证失败`, 'red');
      result.errors.forEach(error => {
        log(`    - ${error}`, 'red');
      });
    }
    
    log(`  预期: ${testCase.shouldFail ? '失败' : '成功'}, 实际: ${result.isValid ? '成功' : '失败'} ${passed ? '✅' : '❌'}`, passed ? 'green' : 'red');
  });

  // 3. 配置详情
  section('3. 当前配置详情');
  
  log(`CaptchaAppId: ${CAPTCHA_CONFIG.captchaAppId || '(未设置)'}`, CAPTCHA_CONFIG.captchaAppId ? 'green' : 'red');
  log(`AppSecretKey: ${CAPTCHA_CONFIG.appSecretKey ? '(已设置)' : '(未设置)'}`, CAPTCHA_CONFIG.appSecretKey ? 'green' : 'red');
  log(`Region: ${CAPTCHA_CONFIG.region}`, 'cyan');

  // 4. 验证建议
  section('4. 排查建议');

  if (configStatus['TENCENT_CAPTCHA_APP_ID'] && configStatus['TENCENT_CAPTCHA_SECRET_KEY']) {
    log('✅ 基本配置完整', 'green');
    log('\n如遇到 15 错误，请检查:', 'yellow');
    log('1. 前端 SDK 使用的 CaptchaAppId 是否与后端配置一致', 'reset');
    log('2. Ticket 和 Randstr 是否为有效的非空字符串', 'reset');
    log('3. Ticket 是否已过期（有效期为 5 分钟）', 'reset');
    log('4. 服务器时间是否与网络时间同步', 'reset');
  } else {
    log('⚠️  配置不完整，使用模拟验证', 'yellow');
    log('\n需要完成的配置:', 'yellow');
    if (!configStatus['TENCENT_SECRET_ID']) {
      log('- 设置 TENCENT_SECRET_ID', 'reset');
    }
    if (!configStatus['TENCENT_SECRET_KEY']) {
      log('- 设置 TENCENT_SECRET_KEY', 'reset');
    }
    if (!configStatus['TENCENT_CAPTCHA_APP_ID']) {
      log('- 设置 TENCENT_CAPTCHA_APP_ID', 'reset');
    }
    if (!configStatus['TENCENT_CAPTCHA_SECRET_KEY']) {
      log('- 设置 TENCENT_CAPTCHA_SECRET_KEY', 'reset');
    }
  }

  // 5. 模拟验证测试
  section('5. 验证函数测试（模拟）');

  log('\n调用 verifyCaptcha() 进行测试...', 'yellow');
  
  try {
    const result = await verifyCaptcha('test_ticket_1234567890', 'test_randstr_12345');
    log(`结果: ${JSON.stringify(result, null, 2)}`, result.success ? 'green' : 'yellow');
  } catch (error) {
    log(`错误: ${error.message}`, 'red');
  }

  // 6. 总结
  section('诊断总结');
  
  if (isFullyConfigured) {
    log('✅ 系统已配置完整的腾讯云验证码', 'green');
    log('   如发生 15 错误，请参考 docs/TENCENT_CAPTCHA_FIX.md', 'cyan');
  } else {
    log('ℹ️  系统处于模拟模式（未配置腾讯云）', 'blue');
    log('   验证将自动返回成功，不会调用腾讯云 API', 'blue');
  }

  log('\n✅ 诊断完成', 'green');
}

// 运行诊断
runDiagnostics().catch(error => {
  log(`\n❌ 诊断失败: ${error.message}`, 'red');
  process.exit(1);
});
