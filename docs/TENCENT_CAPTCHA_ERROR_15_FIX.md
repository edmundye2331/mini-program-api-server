# 腾讯云验证码错误代码 15 修复总结

## 问题描述

遇到错误：
```
15 decrypt fail 传入的Ticket不合法
验证失败: 15 - decrypt fail
```

## 已完成的改进

### 1. ✅ 增强参数验证 (`config/tencentCaptcha.js`)

**新增 `validateCaptchaParams()` 函数** - 验证 Ticket 和 Randstr 的合法性：

```javascript
// 检查项目：
✅ Ticket 不为空且格式有效（10-500 字符）
✅ Randstr 不为空且格式有效（10-50 字符）
✅ 返回详细的错误信息便于调试
```

### 2. ✅ 改进错误处理

**更详细的错误信息和日志：**

```javascript
// 之前：
console.error('[腾讯云验证码] 验证错误:', error.message);

// 现在：
console.error('[腾讯云验证码] 验证错误:', {
  message: error.message,
  code: error.code,
  requestId: error.requestId,
});

// 包含错误代码映射：
{
  '15': '传入的Ticket不合法或已过期 - 请检查Ticket和Randstr是否正确',
  '16': 'Randstr不合法',
  '17': '票据验证超时',
  '18': 'Ticket/Randstr不匹配',
}
```

### 3. ✅ 配置完整性检查

在验证前检查必要的配置：

```javascript
// 检查项目：
✅ CaptchaAppId 不为空
✅ AppSecretKey 不为空
✅ 如配置不完整，返回有意义的错误信息
```

### 4. ✅ 参数清理

```javascript
// 使用 .trim() 移除空格，确保参数纯净
Ticket: ticket.trim(),
Randstr: randstr.trim(),
```

## 新增诊断工具

### 运行诊断脚本

```bash
node scripts/test-captcha-diagnostics.js
```

**功能：**
- ✅ 检查环境变量配置
- ✅ 测试参数验证逻辑
- ✅ 验证 Ticket/Randstr 长度要求
- ✅ 显示当前配置状态
- ✅ 提供排查建议

**输出示例：**
```
✅ 参数验证: 通过 5/5 测试
✅ 配置检查: 完整/模拟
ℹ️  诊断完成
```

## 新增文档

### 1. [TENCENT_CAPTCHA_FIX.md](./TENCENT_CAPTCHA_FIX.md)

**内容：**
- 📋 错误代码详解
- 🔍 快速排查步骤 (5 步)
- 🛠️  调试技巧
- 📚 官方文档参考
- ✅ 完整验证流程图

### 2. [TENCENT_CAPTCHA_FRONTEND.md](./TENCENT_CAPTCHA_FRONTEND.md)

**内容：**
- 🔧 前端 SDK 集成指南
- 📄 完整的表单示例
- 🔌 API 调用方式
- ❌ 常见错误处理
- 📋 检查清单

## 错误根因分析

### 错误代码 15 通常由以下原因引起：

| 原因 | 概率 | 解决方案 |
|------|------|--------|
| **Ticket 为空/格式错误** | 🔴 最高 | 确保前端正确生成 Ticket |
| **Ticket 已过期** | 🟠 高 | Ticket 有效期仅 5 分钟 |
| **Ticket/Randstr 不匹配** | 🟠 高 | 二者必须来自同一验证 |
| **AppSecretKey 配置错误** | 🟡 中 | 检查腾讯云控制台配置 |
| **时间同步问题** | 🟡 中 | 同步系统网络时间 |

## 快速修复步骤

### 步骤 1: 运行诊断
```bash
node scripts/test-captcha-diagnostics.js
```
确认参数验证是否通过

### 步骤 2: 检查前端

查看前端是否：
- ✅ 使用正确的 CaptchaAppId
- ✅ 传递有效的 Ticket 和 Randstr
- ✅ 立即提交验证码（不延迟）

参考：[前端集成指南](./TENCENT_CAPTCHA_FRONTEND.md)

### 步骤 3: 检查后端配置

```bash
# 验证环境变量
echo $TENCENT_CAPTCHA_APP_ID
echo $TENCENT_CAPTCHA_SECRET_KEY

# 检查 .env 文件
cat .env | grep TENCENT
```

### 步骤 4: 查看详细日志

改进后的代码会输出：
```
[腾讯云验证码] 发送验证请求 - AppId: 123456, UserIp: 192.168.1.1
[腾讯云验证码] 收到响应 - Code: 15, Msg: decrypt fail
```

### 步骤 5: 参考官方文档

- 腾讯云验证码文档：https://cloud.tencent.com/document/product/1110/36841
- DescribeCaptchaResult 接口：https://cloud.tencent.com/document/api/1110/36790

## 测试验证

### 使用模拟模式测试

```bash
# 不设置腾讯云环境变量
unset TENCENT_SECRET_ID
unset TENCENT_SECRET_KEY
unset TENCENT_CAPTCHA_APP_ID
unset TENCENT_CAPTCHA_SECRET_KEY

# 启动服务
npm start

# 此时验证码会返回成功（模拟模式）
# POST /api/common/verify-captcha
# { "ticket": "test", "randstr": "test" } 
# → { "success": true, "mock": true }
```

### 使用真实配置测试

```bash
# 设置真实的腾讯云配置
export TENCENT_SECRET_ID="your-secret-id"
export TENCENT_SECRET_KEY="your-secret-key"
export TENCENT_CAPTCHA_APP_ID="your-app-id"
export TENCENT_CAPTCHA_SECRET_KEY="your-secret-key"

# 启动服务
npm start

# 现在会调用真实的腾讯云 API
# 注意：使用真实的 ticket 和 randstr 测试
```

## 代码变更

### 文件修改

| 文件 | 变更 | 说明 |
|------|------|------|
| [config/tencentCaptcha.js](../config/tencentCaptcha.js) | 新增验证函数和改进错误处理 | 核心修复 |

### 新增文件

| 文件 | 说明 |
|------|------|
| [docs/TENCENT_CAPTCHA_FIX.md](./TENCENT_CAPTCHA_FIX.md) | 错误修复指南 |
| [docs/TENCENT_CAPTCHA_FRONTEND.md](./TENCENT_CAPTCHA_FRONTEND.md) | 前端集成指南 |
| [scripts/test-captcha-diagnostics.js](../scripts/test-captcha-diagnostics.js) | 诊断测试工具 |

## 验证改进的效果

### 改进前：
```
[腾讯云验证码] 验证错误: Error: RequestClientError
(错误信息不清晰)
```

### 改进后：
```
[腾讯云验证码] 参数验证失败: Ticket 不能为空
[腾讯云验证码] 发送验证请求 - AppId: 123456, UserIp: 127.0.0.1
[腾讯云验证码] 收到响应 - Code: 15, Msg: decrypt fail
[腾讯云验证码] 验证失败: 15 - 传入的Ticket不合法或已过期
```

## 反馈和支持

- 📖 查看完整指南：[TENCENT_CAPTCHA_FIX.md](./TENCENT_CAPTCHA_FIX.md)
- 🔧 前端集成帮助：[TENCENT_CAPTCHA_FRONTEND.md](./TENCENT_CAPTCHA_FRONTEND.md)
- 🐛 运行诊断工具：`node scripts/test-captcha-diagnostics.js`
- 📞 腾讯云客服：https://cloud.tencent.com

---

**修复完成时间**: 2026-04-27
**修复内容**: 参数验证、错误处理、诊断工具、文档指南
