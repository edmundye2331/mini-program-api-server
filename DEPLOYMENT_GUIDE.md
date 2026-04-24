# 项目配置指南

## 项目概述

微信小程序API服务器 - 提供会员、订单、积分等功能的RESTful API。支持MySQL数据库、Redis缓存、JWT身份验证等功能。

## 技术栈

- **Node.js**：运行环境
- **Express.js**：Web框架
- **MySQL**：数据库
- **Redis**：缓存服务
- **JWT**：身份验证
- **Swagger**：API文档
- **Winston**：日志系统（可选）

## 配置文件说明

### 1. 环境变量配置

#### 核心配置文件

- `.env`：生产环境配置文件（需要创建）
- `.env.example`：配置文件模板（参考）

#### 配置步骤

1. 复制 `.env.example` 为 `.env`
2. 根据实际环境修改配置值
3. 确保 `.env` 文件被添加到 `.gitignore` 中（已配置）

### 2. 服务器运行条件

#### 必填依赖

- **Node.js**：14.x 或更高版本
- **MySQL**：5.7 或更高版本（支持UTF8MB4）
- **Redis**：6.x 或更高版本（可选，用于缓存）
- **npm** 或 **yarn**：包管理工具

#### 可选依赖

- **微信支付证书**：用于真实支付场景
- **SSL证书**：用于HTTPS部署

### 3. 详细配置项说明

#### 3.1 服务器基础配置

```env
# 服务器配置
NODE_ENV=development                          # 运行环境：development/production/test
PORT=3000                                     # 服务器监听端口
TIMEZONE=Asia/Shanghai                       # 时区配置

# 文件上传配置
UPLOAD_PATH=./uploads                        # 文件上传路径
MAX_FILE_SIZE=5242880                        # 最大文件大小（字节）：默认5MB

# 日志配置
LOG_LEVEL=info                                # 日志级别：debug/info/warn/error
LOG_FILE_PATH=./logs                         # 日志文件存放路径
```

#### 3.2 数据库配置

```env
# MySQL数据库配置
DB_HOST=localhost                            # 数据库主机地址
DB_PORT=3306                                 # 数据库端口
DB_USER=root                                 # 数据库用户名
DB_PASSWORD=your_password                    # 数据库密码
DB_NAME=miniprogram_db                       # 数据库名称
DB_POOL_SIZE=20                              # 连接池大小
DB_CONNECT_TIMEOUT=10000                     # 连接超时时间（毫秒）
```

#### 3.3 身份验证配置

```env
# JWT身份验证配置
JWT_SECRET=your-super-secret-jwt-key         # JWT密钥（至少32位）
JWT_EXPIRES_IN=7d                            # JWT过期时间
```

#### 3.4 微信小程序配置

```env
# 微信小程序基础配置
WX_APP_ID=your_app_id                        # 微信小程序AppID
WX_APP_SECRET=your_app_secret                # 微信小程序AppSecret

# 微信支付配置（可选，生产环境需要）
PAYMENT_SIMULATE=true                        # 是否启用支付模拟
WX_PAY_MCH_ID=your_mch_id                    # 微信支付商户号
WX_PAY_SERIAL_NO=your_serial_no              # 微信支付证书序列号
WX_PAY_APIV3_KEY=your_apiv3_key              # 微信支付APIv3密钥
WX_PAY_CERT_PATH=./cert/apiclient_cert.pem   # 微信支付证书路径
WX_PAY_KEY_PATH=./cert/apiclient_key.pem     # 微信支付私钥路径
WX_PAY_NOTIFY_URL=https://your-domain.com/api/order/pay/notify  # 支付回调地址
```

#### 3.5 Redis缓存配置（可选）

```env
# Redis缓存配置
REDIS_HOST=localhost                         # Redis主机地址
REDIS_PORT=6379                              # Redis端口
REDIS_PASSWORD=                              # Redis密码（无密码留空）
REDIS_DB=0                                    # Redis数据库编号
```

#### 3.6 其他配置

```env
# 文件服务配置（微信小程序相关）
WECHAT_DOWNLOAD_DOMAIN=https://mmbiz.qpic.cn  # 微信头像下载域名

# CORS配置（已在代码中配置，不需要在env中设置）
```

### 4. 首次启动步骤

#### 4.1 环境准备

1. 确保Node.js和npm/yarn已安装：

   ```bash
   node -v        # 检查Node.js版本
   npm -v         # 检查npm版本
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

#### 4.2 数据库初始化

1. **MySQL数据库准备**：
   - 创建数据库：
     ```sql
     CREATE DATABASE miniprogram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - 为应用程序创建专门的用户：
     ```sql
     CREATE USER 'miniprogram_user'@'localhost' IDENTIFIED BY 'your_password';
     GRANT ALL PRIVILEGES ON miniprogram_db.* TO 'miniprogram_user'@'localhost';
     FLUSH PRIVILEGES;
     ```

2. **系统自动初始化**：
   - 首次运行服务器时，系统会自动创建必要的表结构
   - 检查数据库连接是否正常：
     ```bash
     node -e "require('./config/mysql').testConnection().then(() => console.log('✅ 数据库连接成功')).catch(err => console.log('❌ 数据库连接失败:', err))"
     ```

#### 4.3 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm run start

# 调试模式（使用Inspector）
npm run debug
```

#### 4.4 验证启动

- 访问 `http://localhost:3000/health` 检查服务器状态
- 访问 `http://localhost:3000/api-docs` 查看API文档（Swagger UI）

### 5. 开发环境快速配置

#### 5.1 使用Docker（推荐）

```bash
# 启动MySQL和Redis容器（需要安装Docker）
docker-compose up -d

# 等待服务启动后，修改.env配置：
DB_HOST=localhost
REDIS_HOST=localhost
```

#### 5.2 手动安装依赖（macOS/Linux）

```bash
# 安装MySQL（使用Homebrew）
brew install mysql

# 启动MySQL服务
brew services start mysql

# 安装Redis
brew install redis

# 启动Redis服务
brew services start redis
```

### 6. 生产环境部署建议

#### 6.1 安全配置

1. **JWT密钥**：生成强密码

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **MySQL密码**：使用复杂密码
3. **微信支付证书**：确保证书文件权限为600
4. **Nginx代理**：使用Nginx进行反向代理和HTTPS配置

**Nginx配置示例**：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /path/to/your-cert.pem;
    ssl_certificate_key /path/to/your-key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 代理配置
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传大小限制
    client_max_body_size 10m;

    # 日志配置
    access_log /var/log/nginx/miniprogram-api-access.log;
    error_log /var/log/nginx/miniprogram-api-error.log;
}
```

#### 6.2 PM2进程管理（推荐）

**安装PM2**：

```bash
npm install -g pm2
```

**启动应用**：

```bash
pm2 start server.js --name miniprogram-api --env production
```

**常用PM2命令**：

```bash
pm2 list                          # 查看运行中的进程
pm2 logs miniprogram-api          # 查看应用日志
pm2 reload miniprogram-api        # 平滑重启
pm2 stop miniprogram-api          # 停止应用
pm2 delete miniprogram-api        # 删除应用
```

**开机自启动**：

```bash
pm2 startup
pm2 save
```

#### 6.3 性能优化配置

```env
# 生产环境优化配置
NODE_ENV=production
DB_POOL_SIZE=50                              # 增大连接池
LOG_LEVEL=warn                               # 降低日志级别
REDIS_HOST=127.0.0.1                         # 使用本地Redis
```

#### 6.4 监控配置

- **PM2 Monitor**：内置监控面板

  ```bash
  pm2 monit
  ```

- **Prometheus + Grafana**：性能监控
- **ELK Stack**：日志分析

### 7. 常见问题排查

#### 7.1 数据库连接失败

```bash
# 检查MySQL是否运行
mysqladmin ping

# 检查连接参数
telnet localhost 3306
```

#### 7.2 Redis连接失败

```bash
# 检查Redis是否运行
redis-cli ping

# 检查连接参数
telnet localhost 6379
```

#### 7.3 端口被占用

```bash
# 查找占用端口的进程
lsof -ti :3000

# 杀死进程
kill -9 <PID>
```

#### 7.4 微信API调用失败

- 检查网络连通性
- 验证AppID和AppSecret是否有效
- 检查服务器IP白名单配置

### 8. 开发命令

```bash
npm run dev          # 开发模式（自动重启）
npm run start        # 生产模式
npm run debug        # 调试模式
npm run test         # 运行测试
npm run lint         # 代码检查
npm run build        # 生产构建（可选）
```

### 9. 项目架构概览

```
miniprogram-api-server/
├── config/          # 配置文件
├── controllers/     # 请求处理
├── services/        # 业务逻辑
├── models/          # 数据模型
├── routes/          # 路由配置
├── middleware/      # 中间件
├── utils/           # 工具函数
├── tests/           # 测试文件
├── uploads/         # 文件上传目录
├── logs/            # 日志文件目录
└── cert/            # 证书文件目录
```

### 10. API文档

项目使用Swagger 3.0自动生成API文档：

- 访问地址：`http://localhost:3000/api-docs`
- 文档格式：OpenAPI 3.0
- 支持接口测试和参数验证

---

## 最后更新

**更新时间**：2024年1月
**版本号**：1.0.0
**维护人员**：开发团队
