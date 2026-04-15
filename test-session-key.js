// 测试 session_key 生成
const crypto = require('crypto');

console.log('=== 测试 session_key 生成 ===\n');

// 新的正确方法
const sessionKeyBuffer = crypto.randomBytes(24);
const mockSessionKey = sessionKeyBuffer.toString('base64');

console.log('生成的 session_key (base64):', mockSessionKey);
console.log('Base64 长度:', mockSessionKey.length);
console.log('解码后长度:', Buffer.from(mockSessionKey, 'base64').length);
console.log('前16字节可用于AES-128:', sessionKeyBuffer.slice(0, 16).length);

// 测试解密
try {
  const aesKey = sessionKeyBuffer.slice(0, 16);
  const testIV = crypto.randomBytes(16);
  const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, testIV);
  console.log('\n✅ AES-128 密钥创建成功，长度正确');
} catch (error) {
  console.log('\n❌ AES-128 密钥创建失败:', error.message);
}

console.log('\n=== 测试完成 ===');
