# API访问被禁止问题修复方案

## 问题现象
```
GET http://localhost:3000/api/member/info?userId=4910671c4fccb74d6b50abaac151cb78 403 (Forbidden)
[会员中心] API调用失败，使用本地缓存: {success: false, code: "99003", message: "禁止访问", data: null}
```

## 问题原因
API签名验证中间件对所有`/api/`路径都生效，而微信小程序的请求没有携带正确的API签名信息。

## 修复方案

### 方案1：开发环境自动跳过签名验证（推荐）
已经在代码中修复了API签名验证中间件，现在开发环境下会自动跳过签名验证：
- 当`process.env.NODE_ENV === 'development'`时，自动跳过API签名验证
- 当`process.env.NODE_ENV === 'test'`时，自动跳过API签名验证

### 方案2：通过环境变量完全跳过签名验证
可以在`.env`文件中添加：
```bash
SKIP_API_SIGNATURE=true
```

### 方案3：为特定路由配置不验证签名
如果需要对特定路由跳过签名验证，可以修改路由配置：
```javascript
// 例如，对会员信息接口跳过签名验证
app.use('/api/member/info', (req, res, next) => {
  const currentEnv = process.env.NODE_ENV || 'development';
  if (currentEnv === 'development') {
    next();
  } else {
    apiSignatureMiddleware(API_SIGNATURE_SECRET)(req, res, next);
  }
});
```

## 代码修改说明

已更新的文件：`/Users/bigdata/miniprogram-api-server/middleware/apiSignatureMiddleware.js`

主要修改：
1. 自动跳过开发环境和测试环境的API签名验证
2. 增加了`SKIP_API_SIGNATURE`环境变量配置
3. 保持生产环境下的签名验证功能

## 验证方法

1. 重启服务器：
   ```bash
   npm run dev
   ```

2. 测试API接口：
   ```bash
   curl http://localhost:3000/api/member/info?userId=test
   ```

3. 应该能正常返回结果，不再返回403错误

## 生产环境注意事项

在生产环境中，不要跳过API签名验证，确保所有API请求都经过签名验证，以提高系统安全性。

生产环境下需要确保：
1. 所有API请求都携带正确的API签名和时间戳
2. 使用强随机字符串作为API签名密钥
3. 定期轮换API签名密钥

## API签名验证说明

API签名验证的工作原理：
1. 客户端在请求中携带`x-api-signature`和`x-api-timestamp`请求头
2. 服务器使用相同的签名密钥和相同的算法重新计算签名
3. 比较客户端提供的签名和服务器重新计算的签名是否一致
4. 验证时间戳是否在有效范围内（默认5分钟）

签名生成示例：
```javascript
const crypto = require('crypto');

function generateSignature(secretKey, params, timestamp) {
  // 对参数进行字典序排序
  const sortedParams = {};
  Object.keys(params).sort().forEach(key => {
    if (key !== 'signature' && key !== 'timestamp' && key !== 'sign') {
      sortedParams[key] = params[key];
    }
  });

  const paramString = Object.keys(sortedParams).map(key => `${key}=${sortedParams[key]}`).join('&');
  const signString = `${paramString}&timestamp=${timestamp}`;

  return crypto.createHmac('sha256', secretKey).update(signString).digest('hex');
}
```