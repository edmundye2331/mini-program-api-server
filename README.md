# 微信小程序API服务器

提供会员、订单、积分等功能的RESTful API后端服务。

## 安装依赖

```bash
cd /Users/bigdata/miniprogram-api-server
npm install
```

## 启动服务器

```bash
npm start
```

开发模式（自动重启）：
```bash
npm run dev
```

## API接口文档

### 基础URL
```
http://localhost:3000/api
```

### 用户相关接口

#### 1. 手机号登录
```
POST /api/user/login/phone
```
请求参数：
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

#### 2. 微信登录
```
POST /api/user/login/wechat
```
请求参数：
```json
{
  "code": "wx_code",
  "userInfo": {
    "avatarUrl": "头像URL",
    "nickName": "昵称",
    "gender": 1,
    "city": "城市",
    "province": "省份",
    "country": "国家"
  }
}
```

#### 3. 获取用户信息
```
GET /api/user/info?userId=xxx
```

#### 4. 更新用户信息
```
POST /api/user/update
```

### 会员相关接口

#### 1. 获取会员信息
```
GET /api/member/info?userId=xxx
```

#### 2. 获取余额
```
GET /api/member/balance?userId=xxx
```

#### 3. 充值
```
POST /api/member/recharge
```
请求参数：
```json
{
  "userId": "xxx",
  "amount": 500,
  "bonusAmount": 80
}
```

#### 4. 获取充值记录
```
GET /api/member/recharge-records?userId=xxx&page=1&limit=20
```

#### 5. 获取余额记录
```
GET /api/member/balance-records?userId=xxx&page=1&limit=20
```

### 订单相关接口

#### 1. 创建订单
```
POST /api/order/create
```
请求参数：
```json
{
  "userId": "xxx",
  "orderType": "dian",
  "items": [
    { "id": 1, "name": "商品名", "quantity": 2, "price": 100 }
  ],
  "totalAmount": 200,
  "remark": "备注"
}
```

#### 2. 获取订单列表
```
GET /api/order/list?userId=xxx&orderType=dian&page=1&limit=20
```

#### 3. 获取订单详情
```
GET /api/order/detail/:orderId
```

#### 4. 取消订单
```
POST /api/order/cancel/:orderId
```

### 积分相关接口

#### 1. 获取积分余额
```
GET /api/points/balance?userId=xxx
```

#### 2. 获取积分商城商品
```
GET /api/points/goods
```

#### 3. 积分兑换
```
POST /api/points/exchange
```
请求参数：
```json
{
  "userId": "xxx",
  "goodsId": 1
}
```

#### 4. 获取积分明细
```
GET /api/points/records?userId=xxx&page=1&limit=20
```

#### 5. 获取兑换记录
```
GET /api/points/exchange-records?userId=xxx&page=1&limit=20
```

### 其他接口

#### 1. 获取优惠券列表
```
GET /api/common/coupons?userId=xxx&status=available
```

#### 2. 获取门店列表
```
GET /api/common/stores
```

#### 3. 获取协议内容
```
GET /api/common/protocol?type=recharge
```

#### 4. 发送验证码
```
POST /api/common/sms/send
```
请求参数：
```json
{
  "phone": "13800138000"
}
```

## 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 失败响应
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 注意事项

1. 当前使用内存数据库，服务器重启后数据会丢失
2. 生产环境应使用MongoDB、MySQL等数据库
3. token验证当前是简化版本，生产环境应使用JWT
4. 验证码发送当前是模拟的，生产环境需要对接短信服务
