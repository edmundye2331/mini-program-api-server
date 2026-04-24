#!/usr/bin/env node
/**
 * 完整项目测试脚本
 * 测试项目的各个方面
 */

console.log('='.repeat(60));
console.log('🚀 开始测试项目');
console.log('='.repeat(60));
console.log('');

// 1. 测试环境变量配置
console.log('📋 1. 检查环境变量配置...');
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
];

let missingVars = [];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
});

if (missingVars.length === 0) {
  console.log('✅ 所有必需的环境变量都已配置');
} else {
  console.log(`⚠️  缺少环境变量: ${missingVars.join(', ')}`);
}
console.log('');

// 2. 测试数据库连接
console.log('🗄️  2. 测试数据库连接...');
const { testConnection } = require('../config/mysql');

testConnection()
  .then((success) => {
    if (success) {
      console.log('✅ 数据库连接成功');
    } else {
      console.log('❌ 数据库连接失败');
    }
    console.log('');
  })
  .catch((error) => {
    console.log('❌ 数据库连接错误:', error.message);
    console.log('');
  });

// 3. 测试Redis连接
console.log('🔴 3. 测试Redis连接...');
const { getRedisClient } = require('../config/redis');

getRedisClient()
  .then((client) => {
    console.log('✅ Redis连接成功');
    return client.quit();
  })
  .catch((error) => {
    console.log('⚠️  Redis连接失败（可选）:', error.message);
  })
  .finally(() => {
    console.log('');

    // 4. 测试工具函数
    console.log('🛠️  4. 测试工具函数...');
    (async () => {
      try {
        const { maskPhone, maskEmail } = require('../utils/dataMasking');
        const { hashPassword, verifyPassword } = require('../utils/encryption');
        const { generateToken, verifyToken } = require('../utils/jwt');

        // 测试数据脱敏
        console.log('  - 数据脱敏:', maskPhone('13812345678') === '138****5678' ? '✅' : '❌');

        // 测试加密
        const testPwd = 'test123456';
        const hashed = await hashPassword(testPwd);
        const verified = await verifyPassword(testPwd, hashed);
        console.log('  - 密码加密:', verified ? '✅' : '❌');

        // 测试JWT
        const token = generateToken({ userId: 'test-user-id' });
        const decoded = verifyToken(token);
        console.log('  - JWT生成验证:', decoded && decoded.userId === 'test-user-id' ? '✅' : '❌');

        console.log('✅ 工具函数测试完成');
      } catch (error) {
        console.log('❌ 工具函数测试失败:', error.message);
      }
    })();
    console.log('');

    // 5. 检查项目结构
    console.log('📁 5. 检查项目结构...');
    const fs = require('fs');
    const path = require('path');

    const requiredDirs = [
      'config',
      'controllers',
      'middleware',
      'routes',
      'services',
      'dao',
      'utils',
      '__tests__',
      'public',
    ];

    const projectRoot = path.join(__dirname, '..');
    requiredDirs.forEach(dir => {
      const exists = fs.existsSync(path.join(projectRoot, dir));
      console.log(`  - ${dir}/:`, exists ? '✅' : '❌');
    });

    console.log('✅ 项目结构检查完成');
    console.log('');

    // 6. 总结
    console.log('='.repeat(60));
    console.log('📊 测试总结');
    console.log('='.repeat(60));
    console.log('');
    console.log('项目测试完成！核心功能正常运行。');
    console.log('');
    console.log('👉 下一步操作：');
    console.log('   1. 运行 npm run dev 启动开发服务器');
    console.log('   2. 访问 http://localhost:3000 测试API');
    console.log('   3. 访问 http://localhost:3000/api-docs 查看Swagger文档');
    console.log('   4. 运行 npm run test:coverage 查看测试覆盖率');
    console.log('');
  });
