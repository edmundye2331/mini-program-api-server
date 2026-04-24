# 微信小程序后端API服务器安全增强文档

## 一、已完成的安全增强措施

### 1. 敏感信息清理

- ✅ 修复了`config/jwt.js`中的硬编码JWT密钥问题
- ✅ 创建了`.env.example`文件作为配置示例，不包含真实敏感信息
- ✅ 确保`.gitignore`已配置忽略实际的`.env`文件
- ✅ 移除了所有打印敏感信息的调试日志
- ✅ 统一使用环境变量管理所有敏感配置

### 2. JWT认证强化

- ✅ 实现了JWT Token黑名单机制（使用Redis存储已注销的token）
- ✅ 新增了访问token和刷新token分离的认证方案
- ✅ 实现了token刷新功能，支持使用refreshToken获取新的accessToken
- ✅ 实现了注销登录功能，将token加入黑名单
- ✅ 增强了认证中间件，检查token是否在黑名单中
- ✅ 新增了token类型验证，确保使用正确的token类型

### 3. 输入验证增强

- ✅ 新增了更多的输入验证规则：
  - 刷新token验证
  - 注销登录验证
  - 文件上传验证
  - 修改密码验证（包含确认密码匹配检查）
  - 商品查询验证
  - 订单状态过滤验证
- ✅ 增强了现有验证规则，添加了更多的格式检查和边界控制
- ✅ 统一了验证错误信息格式

## 二、新增的功能模块

### 1. JWT黑名单工具 (`utils/jwt-blacklist.js`)

- 用于存储已注销的JWT token
- 支持添加、检查、移除黑名单token
- 支持批量清除和统计功能
- 自动使用token的过期时间设置缓存过期

### 2. 认证路由 (`routes/auth.js`)

- `/api/v1/auth/refresh` - 使用刷新token获取新的访问token
- `/api/v1/auth/logout` - 注销登录，将token加入黑名单
- 完整的Swagger API文档

### 3. 增强的验证中间件 (`middleware/validationMiddleware.js`)

- 新增了多种验证schema
- 统一的参数验证处理
- 更严格的输入检查

## 三、配置文件更新

### `.env` 环境变量新增

```bash
# JWT配置
JWT_REFRESH_EXPIRES_IN=30d

# Redis配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# API签名验证配置
API_SIGNATURE_SECRET=your_api_signature_secret_key_change_in_production
```

### 新增的配置文件

- `middleware/securityHeaders.js` - 安全响应头中间件配置
- `utils/securityAuditor.js` - 安全审计工具模块
- `utils/dataMasking.js` - 数据脱敏工具函数
- `utils/encryption.js` - 数据加密工具模块
- `middleware/apiSignatureMiddleware.js` - API签名验证中间件

### `config/jwt.js` 更新

- 从环境变量加载JWT配置
- 使用更安全的默认值

## 四、安全最佳实践建议

### 生产环境部署建议

1. **务必修改JWT_SECRET为强随机字符串**

   ```bash
   # 生成强随机密钥
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **配置HTTPS**
   - 使用合法的SSL证书
   - 强制所有API请求使用HTTPS
   - 配置HSTS头

3. **Redis安全配置**
   - 设置Redis密码
   - 限制Redis访问IP
   - 禁用危险命令

4. **数据库安全配置**
   - 创建专用数据库用户
   - 限制数据库用户权限
   - 定期备份数据库

### 安全运维建议

1. **定期轮换密钥和密码**
2. **监控异常登录和请求**
3. **定期进行安全审计**
4. **及时更新依赖包**
5. **配置安全告警**

## 五、API安全增强

### 新增的安全API端点

- `POST /api/v1/auth/refresh` - 刷新token
- `POST /api/v1/auth/logout` - 注销登录

### 增强的现有API

- 所有需要认证的API现在都会检查token是否在黑名单中
- 所有API请求都经过更严格的输入验证
- 添加了更详细的错误信息

## 六、已完成的安全增强措施（新增）

### 1. API安全增强

- ✅ 实现了API签名验证中间件，防止API被篡改或重放攻击
- ✅ 支持请求时间戳验证，防止重放攻击
- ✅ 实现了基于Helmet的安全响应头设置
- ✅ 配置了完整的安全响应头（CSP, XSS防护, 点击劫持防护等）
- ✅ 添加了速率限制中间件，防止暴力攻击和DoS攻击

### 2. 数据保护

- ✅ 实现了数据脱敏工具函数，支持手机号、身份证号、银行卡号、姓名、邮箱等敏感信息的脱敏
- ✅ 实现了密码加密和验证功能，使用bcryptjs进行密码哈希
- ✅ 实现了数据加密工具模块，支持随机字符串生成和哈希计算
- ✅ 在API响应中自动对敏感数据进行脱敏处理

### 3. 日志与监控

- ✅ 实现了专业的日志系统，记录请求日志和错误日志
- ✅ 日志按日期分割，便于管理和分析
- ✅ 记录了请求方法、URL、IP地址、用户ID、响应状态码、响应时间等信息
- ✅ 错误日志记录了错误堆栈信息，便于问题排查

### 4. 安全审计

- ✅ 创建了安全审计工具模块，可检查文件权限、敏感配置、密码复杂度等
- ✅ 支持生成文本和HTML格式的审计报告
- ✅ 实现了自动化安全检查功能

### 5. 其他安全增强

- ✅ 优化了错误处理机制，避免泄露敏感信息
- ✅ 统一了响应格式，确保所有错误响应都包含标准化的错误信息
- ✅ 移除了X-Powered-By头，减少服务器信息泄露

## 七、后续安全优化计划

1. **实现多因素认证**
2. **添加IP访问控制**
3. **集成Web应用防火墙(WAF)**
4. **实现安全事件审计日志**
5. **添加更多的数据加密和脱敏功能**

## 七、快速开始

1. 安装依赖：

   ```bash
   npm install
   ```

2. 配置环境变量：

   ```bash
   cp .env.example .env
   # 编辑.env文件，填写真实配置
   ```

3. 启动服务器：

   ```bash
   npm start
   ```

4. 访问API文档：
   ```
   http://localhost:3000/api-docs
   ```

## 八、安全检查清单

- [x] 敏感信息已从代码中移除
- [x] JWT认证机制已强化
- [x] 输入验证已增强
- [x] 实现了token注销和黑名单机制
- [x] 实现了token刷新功能
- [x] 配置文件已安全化
- [x] 调试日志已清理
- [x] 实现了API签名验证
- [x] 实现了数据脱敏和加密
- [x] 实现了日志系统
- [x] 配置了安全响应头
- [x] 实现了安全审计工具
- [x] 配置了速率限制

---

**最后更新时间**: 2026-04-23
**版本**: 1.1.0
**作者**: Claude Code
