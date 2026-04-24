# 微信小程序API服务器

## 项目简介

这是一个基于Express.js的微信小程序后端API服务器，提供用户管理、会员系统、商品管理、订单系统、积分系统等完整的后端服务。支持统一错误码系统、多语言国际化和Redis缓存。

## 技术栈

- Node.js + Express.js
- MySQL + mysql2/promise
- Redis（缓存）
- JWT 身份验证
- CORS 跨域支持
- Swagger API文档
- 统一错误码系统
- 国际化支持（中文/英文）
- Helmet + XSS Clean 安全防护

## 环境配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

首先创建MySQL数据库并初始化表结构：

```bash
mysql -u root -p < init_db.sql
```

### 3. 配置环境变量

创建.env文件，或者直接修改config/mysql.js中的数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=miniprogram_db
PORT=3000
NODE_ENV=development
```

### 4. 配置环境变量

创建.env文件：

```bash
cp .env.example .env
```

根据您的环境修改.env文件中的配置，主要包括：

- 数据库配置
- JWT密钥
- 微信小程序配置
- Redis配置（可选）

### 5. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm run start

# 调试模式
npm run debug
```

服务器启动后：

- 主服务地址：http://localhost:3000
- API文档地址：http://localhost:3000/api-docs
- 健康检查：http://localhost:3000/health

## API接口

### 用户接口

- POST /api/user/login/phone - 手机号登录
- POST /api/user/login/wechat - 微信登录
- GET /api/user/info - 获取用户信息
- POST /api/user/update - 更新用户信息
- POST /api/user/avatar/upload - 上传头像
- POST /api/user/phone/decrypt - 解密微信手机号

### 会员接口

- GET /api/member/info - 获取会员信息
- GET /api/member/balance - 获取余额
- POST /api/member/recharge - 充值
- GET /api/member/recharge-records - 获取充值记录
- GET /api/member/balance-records - 获取余额记录

### 商品接口

- GET /api/goods/categories - 获取商品分类
- GET /api/goods/list - 获取商品列表
- GET /api/goods/detail/:id - 获取商品详情
- POST /api/goods/cart/add - 添加到购物车
- GET /api/goods/cart/list - 获取购物车列表
- POST /api/goods/cart/update - 更新购物车商品数量
- POST /api/goods/cart/delete - 删除购物车商品
- POST /api/goods/cart/clear - 清空购物车

### 订单接口

- POST /api/order/create - 创建订单
- GET /api/order/list - 获取订单列表
- GET /api/order/detail/:orderId - 获取订单详情
- POST /api/order/cancel/:orderId - 取消订单
- POST /api/order/pay/:orderId - 支付订单
- PUT /api/order/status/:orderId - 更新订单状态

### 积分接口

- GET /api/points/balance - 获取积分余额
- GET /api/points/goods - 获取积分商城商品
- POST /api/points/exchange - 积分兑换
- GET /api/points/records - 获取积分明细
- GET /api/points/exchange-records - 获取兑换记录

### 安全接口

- POST /api/security/password/change - 修改密码
- POST /api/security/phone/bind - 绑定/更换手机号
- GET /api/security/login/logs - 获取登录记录
- POST /api/security/account/delete - 注销账号

### 生日礼接口

- GET /api/birthday/gift - 获取生日礼信息
- POST /api/birthday/gift/claim - 领取生日礼
- GET /api/birthday/gift/records - 获取生日礼领取记录

### 通用接口

- GET /api/common/coupons - 获取优惠券列表
- GET /api/common/stores - 获取门店列表
- GET /api/common/protocol - 获取协议内容
- POST /api/common/sms/send - 发送验证码

## 项目结构

```
.
├── config/              # 配置文件
│   ├── mysql.js        # MySQL数据库配置
│   ├── cors.js         # CORS配置
│   ├── errorCodes.js   # 统一错误码系统
│   ├── jwt.js          # JWT配置
│   └── swagger.js      # Swagger API文档配置
├── controllers/         # 控制器
│   ├── userController.js
│   ├── memberController.js
│   ├── goodsController.js
│   ├── orderController.js
│   ├── pointsController.js
│   ├── securityController.js
│   ├── birthdayController.js
│   └── commonController.js
├── middleware/          # 中间件
│   ├── auth.js         # 身份验证中间件
│   ├── rateLimiter.js # 速率限制中间件
│   ├── requestLogger.js # 请求日志中间件
│   ├── errorLogger.js  # 错误日志中间件
│   └── responseMiddleware.js # 统一响应格式中间件
├── routes/             # 路由
│   ├── user.js
│   ├── member.js
│   ├── goods.js
│   ├── order.js
│   ├── points.js
│   ├── security.js
│   ├── birthday.js
│   └── common.js
├── services/           # 业务逻辑层
│   ├── userService.js
│   ├── memberService.js
│   ├── goodsService.js
│   ├── orderService.js
│   ├── pointsService.js
│   └── ...
├── utils/              # 工具函数
│   ├── jwt.js         # JWT工具
│   ├── encryption.js  # 加密工具
│   └── ...
├── init_db.sql        # 数据库初始化脚本
├── server.js          # 服务器入口文件
├── package.json       # 项目配置
├── README.md          # 项目说明
└── DEPLOYMENT_GUIDE.md # 部署指南
```

## 注意事项

1. 确保MySQL服务已启动
2. 首次运行前请先执行init_db.sql创建数据库表
3. 请根据实际情况修改数据库配置
4. 生产环境请修改NODE_ENV为production
5. 请确保端口3000未被占用

## 新功能特性

### 统一错误码系统

项目现在采用了统一的错误码系统，所有API响应都使用标准化的错误码和消息格式：

```json
{
  "success": false,
  "code": "99001",
  "message": "请求参数错误",
  "data": null
}
```

错误码格式：`模块编码(2位) + 错误类型(2位) + 具体错误号(3位)`

- 通用模块：99
- 用户模块：10
- 订单模块：20
- 商品模块：30
- 支付模块：50

### 国际化支持

所有API接口现在支持多语言，自动根据请求头`Accept-Language`返回对应语言的错误消息和成功提示：

- 中文：`Accept-Language: zh-CN`
- 英文：`Accept-Language: en-US`

### 健康检查

新增健康检查接口：`GET /health`，可以检查服务器、数据库和Redis的连接状态。

### API文档

项目使用Swagger 3.0自动生成API文档，访问地址：`http://localhost:3000/api-docs`

## 配置指南

详细的部署和配置指南请查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 文件。
