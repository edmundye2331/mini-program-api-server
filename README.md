# 微信小程序后端API服务器

## 项目简介

这是一个基于Express.js的微信小程序后端API服务器，提供用户管理、会员系统、商品管理、订单系统、积分系统等完整的后端服务。

## 技术栈

- Node.js + Express.js
- MySQL + mysql2/promise
- JWT 身份验证
- CORS 跨域支持

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

### 4. 启动服务器

```bash
node server.js
```

或者使用nodemon自动重启：

```bash
npm run dev
```

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
│   └── cors.js         # CORS配置
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
│   └── rateLimiter.js # 速率限制中间件
├── routes/             # 路由
│   ├── user.js
│   ├── member.js
│   ├── goods.js
│   ├── order.js
│   ├── points.js
│   ├── security.js
│   ├── birthday.js
│   └── common.js
├── utils/              # 工具函数
│   └── jwt.js         # JWT工具
├── init_db.sql        # 数据库初始化脚本
├── server.js          # 服务器入口文件
└── package.json       # 项目配置
```

## 注意事项

1. 确保MySQL服务已启动
2. 首次运行前请先执行init_db.sql创建数据库表
3. 请根据实际情况修改数据库配置
4. 生产环境请修改NODE_ENV为production
5. 请确保端口3000未被占用
