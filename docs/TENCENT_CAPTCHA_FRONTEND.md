# 腾讯云验证码前端集成指南

## 问题背景

当收到错误代码 **15 - decrypt fail** 时，通常是因为前端和后端的验证码参数不一致。本指南帮助确保前端正确生成和传递 `ticket` 和 `randstr`。

## 前端 SDK 集成

### 1. 加载腾讯云验证码 SDK

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>腾讯云验证码示例</title>
</head>
<body>
    <!-- 验证码容器 -->
    <div id="captcha"></div>

    <!-- 加载腾讯云 SDK -->
    <script src="https://tcaptcha.qq.com/tcaptcha.js"></script>

    <script>
        // 从后端或配置获取 CaptchaAppId
        const captchaAppId = '您的CaptchaAppId'; // 必须与后端配置一致！

        // 初始化验证码
        let captchaCode;
        let tencentCaptcha = new TencentCaptcha('captcha', captchaAppId, function(res) {
            // res.ret === 0 表示验证成功
            if (res.ret === 0) {
                captchaCode = {
                    ticket: res.ticket,
                    randstr: res.randstr,
                };
                console.log('验证码生成成功:', {
                    ticketLength: res.ticket.length,
                    randstrLength: res.randstr.length,
                });
                // 可以在这里自动提交表单或启用提交按钮
            }
        });
    </script>
</body>
</html>
```

### 2. 提交验证码到后端

```javascript
// 方式1: 在表单提交中包含验证码
async function submitForm() {
    if (!captchaCode) {
        alert('请先完成验证码验证');
        return;
    }

    try {
        const response = await fetch('/api/common/verify-captcha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticket: captchaCode.ticket,      // 字符串，10-500 字符
                randstr: captchaCode.randstr,    // 字符串，10-50 字符
            }),
        });

        const result = await response.json();
        if (result.code === 0) {
            console.log('✅ 验证码验证成功');
            // 继续业务流程
        } else {
            console.error('❌ 验证码验证失败:', result.message);
            // 可选：刷新验证码让用户重新验证
            tencentCaptcha.refresh();
        }
    } catch (error) {
        console.error('请求失败:', error);
    }
}

// 方式2: 作为单独的 API 端点验证
async function verifyOnlyWithCaptcha() {
    const response = await fetch('/api/common/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ticket: captchaCode.ticket,
            randstr: captchaCode.randstr,
        }),
    });
    
    return response.json();
}
```

### 3. 处理验证失败

```javascript
// 监听验证失败并刷新
function handleVerifyError(error) {
    console.error('验证码验证失败:', error);
    
    // 不同的错误处理
    if (error.code === 'INVALID_PARAMS') {
        alert('参数格式错误，请重新验证');
    } else if (error.code === 15) {
        alert('Ticket 不合法或已过期，请重新验证');
    } else {
        alert('验证失败: ' + error.message);
    }
    
    // 刷新验证码让用户重新尝试
    if (tencentCaptcha) {
        tencentCaptcha.refresh();
    }
    
    captchaCode = null; // 清除之前的验证码
}
```

## 完整的表单示例

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>用户注册 - 含验证码</title>
    <style>
        .form-group {
            margin: 15px 0;
        }
        input, button {
            padding: 10px;
            font-size: 14px;
        }
        button {
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 4px;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .message {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
        }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>用户注册表单</h1>

    <form id="registerForm">
        <div class="form-group">
            <label>邮箱:</label>
            <input type="email" name="email" required>
        </div>

        <div class="form-group">
            <label>密码:</label>
            <input type="password" name="password" required>
        </div>

        <!-- 验证码容器 -->
        <div class="form-group">
            <label>验证码:</label>
            <div id="captcha"></div>
        </div>

        <button type="submit" id="submitBtn" disabled>提交注册</button>
    </form>

    <div id="message"></div>

    <!-- 加载腾讯云 SDK -->
    <script src="https://tcaptcha.qq.com/tcaptcha.js"></script>

    <script>
        // 配置
        const CAPTCHA_APP_ID = '您的CaptchaAppId'; // ⚠️  必须与后端一致！
        const API_BASE = '/api/common';

        let captchaCode = null;
        let captchaInstance = null;

        // 初始化验证码
        function initCaptcha() {
            captchaInstance = new TencentCaptcha('captcha', CAPTCHA_APP_ID, function(res) {
                if (res.ret === 0) {
                    // 验证码验证成功
                    captchaCode = {
                        ticket: res.ticket,
                        randstr: res.randstr,
                    };
                    
                    console.log('✅ 验证码生成成功', {
                        ticketLength: captchaCode.ticket.length,
                        randstrLength: captchaCode.randstr.length,
                    });
                    
                    // 启用提交按钮
                    document.getElementById('submitBtn').disabled = false;
                    showMessage('验证码验证成功，可以提交表单', 'success');
                } else {
                    // 用户关闭或其他错误
                    showMessage('验证码已重置，请重新验证', 'error');
                    captchaCode = null;
                    document.getElementById('submitBtn').disabled = true;
                }
            });
        }

        // 显示消息
        function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
        }

        // 处理表单提交
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!captchaCode) {
                showMessage('❌ 请先完成验证码验证', 'error');
                return;
            }

            // 获取表单数据
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // 添加验证码数据
            data.ticket = captchaCode.ticket;
            data.randstr = captchaCode.randstr;

            try {
                document.getElementById('submitBtn').disabled = true;
                document.getElementById('submitBtn').textContent = '提交中...';

                // 提交到后端
                const response = await fetch(`${API_BASE}/verify-captcha`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (result.code === 0 || result.success) {
                    showMessage('✅ 验证码验证成功！', 'success');
                    // 继续业务流程...
                    console.log('业务逻辑继续执行...');
                } else {
                    showMessage(`❌ ${result.message || '验证失败'}`, 'error');
                    // 刷新验证码
                    captchaInstance.refresh();
                    captchaCode = null;
                }
            } catch (error) {
                showMessage(`❌ 请求失败: ${error.message}`, 'error');
            } finally {
                document.getElementById('submitBtn').disabled = false;
                document.getElementById('submitBtn').textContent = '提交注册';
            }
        });

        // 初始化
        document.addEventListener('DOMContentLoaded', initCaptcha);
    </script>
</body>
</html>
```

## 关键要点检查清单

- [ ] **CaptchaAppId 一致**: 前端使用的 ID 必须与 `TENCENT_CAPTCHA_APP_ID` 环境变量一致
- [ ] **参数完整**: 每次提交都包含 `ticket` 和 `randstr` 两个参数
- [ ] **参数有效**: 
  - ticket: 10-500 字符，非空
  - randstr: 10-50 字符，非空
- [ ] **时效性**: Ticket 有效期仅 5 分钟，超期需要重新验证
- [ ] **同一次验证**: ticket 和 randstr 必须来自同一次验证流程
- [ ] **错误处理**: 验证失败时刷新验证码让用户重新尝试
- [ ] **网络时间**: 客户端和服务端时间差不超过 5 分钟

## 调试技巧

### 浏览器控制台调试

```javascript
// 在浏览器控制台查看验证码数据
console.log('当前验证码:', captchaCode);
console.log('Ticket 长度:', captchaCode?.ticket.length);
console.log('Randstr 长度:', captchaCode?.randstr.length);

// 手动发送验证请求
fetch('/api/common/verify-captcha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        ticket: captchaCode.ticket,
        randstr: captchaCode.randstr,
    }),
}).then(r => r.json()).then(console.log);
```

### 常见错误

| 症状 | 原因 | 解决方案 |
|------|------|--------|
| 页面未显示验证码 | CaptchaAppId 错误或 SDK 加载失败 | 检查 CaptchaAppId，确认 SDK URL 可访问 |
| 验证后报 15 错误 | Ticket 格式错误或已过期 | 立即提交验证码，不要延迟 |
| 不同用户验证失败 | CaptchaAppId 与后端不一致 | 确认两边使用同一个 ID |

## 后端接收端点

```javascript
// POST /api/common/verify-captcha
// 请求体:
{
    "ticket": "string (10-500 chars)",
    "randstr": "string (10-50 chars)"
}

// 成功响应:
{
    "code": 0,
    "success": true,
    "message": "验证成功"
}

// 失败响应:
{
    "code": 400,
    "success": false,
    "message": "Ticket 不合法或已过期",
    "details": "15"  // 腾讯云错误代码
}
```

## 参考资源

- [腾讯云验证码官方文档](https://cloud.tencent.com/document/product/1110/36841)
- [前端 SDK 集成](https://cloud.tencent.com/document/product/1110/36841)
- [后端验证 API](https://cloud.tencent.com/document/api/1110/36790)
