/**
 * 修复现有用户的 session_key
 * 清除无效的 session_key，让用户重新登录
 */
const { database } = require('./config/database');

console.log('=== 开始修复 session_key ===\n');

let fixedCount = 0;
let totalCount = 0;

for (const [userId, user] of database.users.entries()) {
  totalCount++;
  
  if (user.wechat_session_key) {
    try {
      const sessionKeyBuffer = Buffer.from(user.wechat_session_key, 'base64');
      
      if (sessionKeyBuffer.length < 16) {
        // 无效的session_key，清除它
        console.log(`✗ 用户 ${userId} - session_key 长度无效 (${sessionKeyBuffer.length} 字节)`);
        user.wechat_session_key = null;
        user.updatedAt = new Date().toISOString();
        database.users.set(userId, user);
        fixedCount++;
      } else {
        console.log(`✓ 用户 ${userId} - session_key 正常`);
      }
    } catch (error) {
      // session_key 格式错误，清除它
      console.log(`✗ 用户 ${userId} - session_key 格式错误`);
      user.wechat_session_key = null;
      user.updatedAt = new Date().toISOString();
      database.users.set(userId, user);
      fixedCount++;
    }
  }
}

console.log(`\n=== 修复完成 ===`);
console.log(`总用户数: ${totalCount}`);
console.log(`修复数量: ${fixedCount}`);
console.log(`建议: 修复过的用户需要重新微信登录`);

process.exit(0);
