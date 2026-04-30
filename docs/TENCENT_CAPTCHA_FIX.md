# 腾讯云验证码错误代码 15 修复指南

## 错误描述
```
15 decrypt fail 传入的Ticket不合法
验证失败: 15 - decrypt fail
```

## 问题原因

错误代码 **15** 表示腾讯云无法解密传入的 Ticket，可能原因：

| 原因 | 说明 | 解决方案 |
|------|------|--------|
| **Ticket 为空或格式错误** | 前端未正确生成或传递 Ticket | 确保前端正确调用腾讯云验证码 SDK |
| **Ticket 已过期** | Ticket 超过5分钟有效期 | 重新请求验证码 |
| **Ticket/Randstr 不匹配** | Ticket 和 Randstr 来自不同的验证流程 | 确保二者来自同一次验证 |
| **AppSecretKey 不正确** | 服务端配置错误 | 检查腾讯云控制台配置 |
| **CaptchaAppId 不正确** | 应用ID配置错误 | 核对腾讯云应用ID |
| **时间同步问题** | 客户端与服务端时间差超过5分钟 | 同步系统时间 |

## 快速排查步骤

### 1. 检查环境变量配置

```bash
# 验证腾讯云配置是否完整
echo "SecretId: $TENCENT_SECRET_ID"
echo "SecretKey: $TENCENT_SECRET_KEY"
echo "CaptchaAppId: $TENCENT_CAPTCHA_APP_ID"
echo "CaptchaSecretKey: $TENCENT_CAPTCHA_SECRET_KEY"
```

确保所有变量都已设置且不为空。

### 2. 验证参数格式

在调用 API 时，检查以下参数：

```javascript
// ❌ 错误 - Ticket 为空
const result = await verifyCaptcha('', 'randstr123', '127.0.0.1');

// ❌ 错误 - Randstr 为空
const result = await verifyCaptcha('ticket123', '', '127.0.0.1');

// ✅ 正确
const result = await verifyCaptcha('ticket_valid_value', 'randstr_valid_value', '192.168.1.1');
```

**参数要求：**
- `ticket`: 长度 10-500 字符
- `randstr`: 长度 10-50 字符
- `userIp`: 有效的 IP 地址

### 3. 检查前端 SDK 配置

确保前端正确配置了腾讯云验证码 SDK：

```html
<script src="https://tcaptcha.qq.com/tcaptcha.js"></script>
<script>
  // 使用正确的 CaptchaAppId
  new TencentCaptcha(parseInt(captchaAppId), function (res) {
    if (res.ret === 0) {
      // res.ticket 和 res.randstr 必须一起传递
      console.log('Ticket:', res.ticket); // 字符串，10-500 字符
      console.log('Randstr:', res.randstr); // 字符串，10-50 字符
    }
  });
</script>
```

### 4. 检查时间同步

验证服务器和本地时间是否同步：

```bash
# 检查系统时间
date

# 如果时间不对，同步网络时间
ntpdate -s time.nist.gov  # Linux/macOS
```

### 5. 查看详细日志

改进后的代码会输出更详细的日志。检查日志中的信息：

```
[腾讯云验证码] 参数验证失败: Ticket 不能为空
[腾讯云验证码] 发送验证请求 - AppId: 123456, UserIp: 192.168.1.1
[腾讯云验证码] 收到响应 - Code: 15, Msg: decrypt fail
```

## 调试技巧

### 使用测试脚本

创建 `test-captcha-fix.js` 进行测试：

```javascript
const { verifyCaptcha, validateCaptchaParams } = require('./config/tencentCaptcha');

// 测试参数验证
console.log('\n=== 测试参数验证 ===');
console.log(validateCaptchaParams('', 'randstr')); // 应该失败
console.log(validateCaptchaParams('ticket_valid_1234567890', 'randstr123')); // 应该成功

// 测试实际验证（需要真实的 ticket 和 randstr）
console.log('\n=== 测试实际验证 ===');
(async () => {
  const result = await verifyCaptcha('YOUR_REAL_TICKET', 'YOUR_REAL_RANDSTR', '127.0.0.1');
  console.log('验证结果:', result);
})();
```

### 启用调试模式

在环境变量中设置：

```bash
DEBUG=captcha:* npm start
```

## 常见错误代码

| 代码 | 说明 | 解决方案 |
|------|------|--------|
| **1** | ✅ 验证成功 | 正常 |
| **7** | 验证过期 | 重新验证 |
| **10** | 频率限制 | 等待后重试 |
| **15** | Ticket 不合法 | 见本文档 |
| **16** | Randstr 不合法 | 检查 randstr 格式 |
| **17** | 票据验证超时 | 检查网络连接 |
| **18** | Ticket/Randstr 不匹配 | 二者必须来自同一验证 |

## 腾讯云官方文档

参考腾讯云文档中的 `DescribeCaptchaResult` 接口：

- **输出参数 CaptchaCode 值说明**：见腾讯云控制台
- **前端 SDK 集成指南**：https://cloud.tencent.com/document/product/1110/36841
- **后端验证接口**：https://cloud.tencent.com/document/api/1110/36790

## 完整的验证流程

```
1. 用户访问页面
   └─> 加载腾讯云验证码 SDK（指定正确的 CaptchaAppId）

2. 用户完成验证
   └─> SDK 生成 ticket 和 randstr
   └─> 前端提交 ticket 和 randstr 到后端

3. 后端验证码（改进后）
   ├─ 参数格式检查 ✅
   │  ├─ ticket 长度 10-500
   │  └─ randstr 长度 10-50
   ├─ 配置完整性检查 ✅
   │  ├─ CaptchaAppId 非空
   │  └─ AppSecretKey 非空
   ├─ 调用腾讯云 API ✅
   └─ 返回验证结果

4. 根据结果
   ├─ 成功 → 业务逻辑继续
   └─ 失败 → 返回详细错误信息
```

## 测试验证

使用模拟模式测试（未配置时）：

```bash
# 不设置腾讯云环境变量，系统会使用模拟验证
unset TENCENT_SECRET_ID
unset TENCENT_SECRET_KEY
unset TENCENT_CAPTCHA_APP_ID
unset TENCENT_CAPTCHA_SECRET_KEY

npm start
# 此时 verifyCaptcha() 会返回 { success: true, mock: true }
```

## 联系支持

如果问题仍未解决：

1. 收集完整的错误日志和环境信息
2. 联系腾讯云客服
3. 查看[腾讯云验证码常见问题](https://cloud.tencent.com/document/product/1110/36841#faq)
