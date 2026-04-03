# 数据库适配层使用指南

**版本**: 1.0
**创建时间**: 2026-04-03
**适配器文件**: `utils/databaseAdapter.js`

---

## 📋 目录

1. [快速开始](#快速开始)
2. [核心功能](#核心功能)
3. [API参考](#api参考)
4. [迁移示例](#迁移示例)
5. [最佳实践](#最佳实践)
6. [常见问题](#常见问题)

---

## 🚀 快速开始

### 引入适配器

```javascript
// 替换原有的 database 引用
// const { database } = require('../config/database');

// 使用适配器
const adapter = require('../utils/databaseAdapter');
```

### 基本使用

```javascript
// 获取用户信息
const user = await adapter.getUser(userId);

// 获取商品列表
const goods = await adapter.getGoodsList({ categoryId: 1 });

// 创建订单
const order = await adapter.createOrder({
  orderNo: 'DD20260403001',
  userId: 'xxx',
  orderType: 'dian',
  items: [
    { goodsId: 1, name: 'IPA精酿', price: 48, quantity: 2 }
  ],
  totalAmount: 96
});
```

---

## 🎯 核心功能

### 1. 自动字段名转换

适配器会自动在 **camelCase** 和 **snake_case** 之间转换：

```javascript
// 后端代码使用 camelCase
const goods = await adapter.getGoodsList({
  categoryId: 1,    // 自动转换为 category_id
  status: 'onsale'
});

// 返回的数据也是 camelCase
console.log(goods[0].categoryId);  // 来自 category_id
console.log(goods[0].createdAt);   // 来自 created_at
```

### 2. 订单items处理

自动处理orders表的items数组：

```javascript
// 创建订单时，直接传入items数组
const order = await adapter.createOrder({
  orderNo: 'DD001',
  userId: 'user-123',
  orderType: 'dian',
  items: [
    { goodsId: 1, name: 'IPA精酿', price: 48, quantity: 2 },
    { goodsId: 2, name: '炸薯条', price: 22, quantity: 1 }
  ],
  totalAmount: 118
});

// items会自动保存到order_items表

// 查询订单时，items会自动从order_items表加载
const order = await adapter.getOrder(orderId);
console.log(order.items);  // 数组格式
```

### 3. 购物车完整对象

模拟原有的Map数据结构：

```javascript
// 获取购物车 - 返回完整对象
const cart = await adapter.getCart(userId);
// {
//   userId: 'xxx',
//   items: [...],
//   createdAt: '2026-04-03 10:00:00',
//   updatedAt: '2026-04-03 10:00:00'
// }

// 保存购物车
await adapter.saveCart(userId, cart);
```

### 4. 类型转换

自动处理balance等字段的类型：

```javascript
// balance自动转换为字符串（后端期望）
const member = await adapter.getMember(userId);
console.log(member.balance);  // "1000.00" (字符串)
```

---

## 📚 API参考

### 用户操作

#### `adapter.getUser(userId)`
获取用户信息

**参数**:
- `userId` (string) - 用户ID

**返回**: User对象或null

**示例**:
```javascript
const user = await adapter.getUser('user-123');
// { id, phone, nickname, avatar, wechatOpenid, ... }
```

---

#### `adapter.getUserByPhone(phone)`
通过手机号获取用户

**示例**:
```javascript
const user = await adapter.getUserByPhone('13800000001');
```

---

#### `adapter.createUser(userData)`
创建新用户

**参数**:
- `userData` (object) - 用户数据（camelCase格式）

**示例**:
```javascript
await adapter.createUser({
  id: 'user-123',
  phone: '13800000001',
  nickname: '张三',
  avatar: '/images/avatar.png',
  gender: 'male'
});
```

---

#### `adapter.updateUser(userId, userData)`
更新用户信息

**示例**:
```javascript
await adapter.updateUser('user-123', {
  nickname: '新昵称',
  city: '北京'
});
```

---

### 会员操作

#### `adapter.getMember(userId)`
获取会员信息

**返回**: Member对象，balance为字符串格式

**示例**:
```javascript
const member = await adapter.getMember('user-123');
// {
//   userId: 'user-123',
//   balance: "1000.00",  // 字符串格式
//   points: 500,
//   coupons: 3,
//   level: 2
// }
```

---

#### `adapter.createMember(memberData)`
创建会员

**示例**:
```javascript
await adapter.createMember({
  userId: 'user-123',
  balance: '0.00',
  points: 0,
  coupons: 0,
  level: 1
});
```

---

#### `adapter.updateMember(userId, memberData)`
更新会员信息

**示例**:
```javascript
await adapter.updateMember('user-123', {
  balance: '1500.00',
  points: 600
});
```

---

### 订单操作

#### `adapter.createOrder(orderData)`
创建订单（包含订单明细）

**参数**:
- `orderData` (object) - 订单数据，包含items数组

**示例**:
```javascript
const order = await adapter.createOrder({
  id: 'order-123',
  orderNo: 'DD20260403001',
  userId: 'user-123',
  orderType: 'dian',
  storeId: 1,
  items: [
    {
      goodsId: 1,
      name: 'IPA精酿',
      image: '/images/beer-ipa.png',
      price: 48,
      quantity: 2
    }
  ],
  totalAmount: 96,
  discountAmount: 0,
  actualAmount: 96,
  status: 'pending',
  statusText: '待付款',
  remark: ''
});
```

---

#### `adapter.getOrder(orderId)`
获取订单详情（包含items）

**示例**:
```javascript
const order = await adapter.getOrder('order-123');
// {
//   id: 'order-123',
//   orderNo: 'DD20260403001',
//   items: [
//     { goodsId: 1, name: 'IPA精酿', price: 48, quantity: 2 }
//   ],
//   ...
// }
```

---

#### `adapter.getOrdersByUser(userId, options)`
获取用户的订单列表

**参数**:
- `userId` (string) - 用户ID
- `options` (object) - 查询选项
  - `orderType` (string) - 订单类型筛选
  - `status` (string) - 状态筛选
  - `limit` (number) - 限制数量，默认20
  - `offset` (number) - 偏移量

**示例**:
```javascript
// 获取所有订单
const orders = await adapter.getOrdersByUser('user-123');

// 筛选特定类型的订单
const orders = await adapter.getOrdersByUser('user-123', {
  orderType: 'dian',
  status: 'completed',
  limit: 10
});
```

---

#### `adapter.updateOrderStatus(orderId, status, statusText)`
更新订单状态

**示例**:
```javascript
await adapter.updateOrderStatus('order-123', 'paid', '已支付');
```

---

#### `adapter.updateOrderPayment(orderId, paymentMethod, paymentTime)`
更新订单支付状态

**示例**:
```javascript
await adapter.updateOrderPayment(
  'order-123',
  'wechat',
  new Date()
);
```

---

### 商品操作

#### `adapter.getGoodsCategories()`
获取商品分类列表

**返回**: 分类数组

**示例**:
```javascript
const categories = await adapter.getGoodsCategories();
// [
//   { id: 1, name: '精酿啤酒', icon: '...', sort: 1 },
//   { id: 2, name: '特色小食', icon: '...', sort: 2 }
// ]
```

---

#### `adapter.getGoodsList(options)`
获取商品列表

**参数**:
- `options` (object)
  - `categoryId` (number) - 分类ID筛选
  - `status` (string) - 状态筛选，默认'onsale'
  - `limit` (number) - 限制数量
  - `offset` (number) - 偏移量

**示例**:
```javascript
// 获取所有在售商品
const goods = await adapter.getGoodsList();

// 获取特定分类的商品
const goods = await adapter.getGoodsList({ categoryId: 1 });

// 分页查询
const goods = await adapter.getGoodsList({
  categoryId: 1,
  limit: 10,
  offset: 0
});
```

---

#### `adapter.getGoodsDetail(goodsId)`
获取商品详情

**示例**:
```javascript
const goods = await adapter.getGoodsDetail(1);
// { id: 1, categoryId: 1, name: 'IPA精酿', price: 48, ... }
```

---

### 购物车操作

#### `adapter.getCart(userId)`
获取用户购物车

**返回**: 完整的购物车对象

**示例**:
```javascript
const cart = await adapter.getCart('user-123');
// {
//   userId: 'user-123',
//   items: [
//     { goodsId: 1, name: 'IPA精酿', price: 48, quantity: 2 }
//   ],
//   createdAt: '2026-04-03 10:00:00',
//   updatedAt: '2026-04-03 10:00:00'
// }
```

---

#### `adapter.saveCart(userId, cartData)`
保存购物车

**示例**:
```javascript
await adapter.saveCart('user-123', {
  userId: 'user-123',
  items: [
    { goodsId: 1, name: 'IPA精酿', price: 48, quantity: 2 }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

#### `adapter.clearCart(userId)`
清空购物车

**示例**:
```javascript
await adapter.clearCart('user-123');
```

---

### 门店操作

#### `adapter.getStores(activeOnly)`
获取门店列表

**参数**:
- `activeOnly` (boolean) - 是否只返回营业中的门店，默认true

**示例**:
```javascript
// 获取所有营业中的门店
const stores = await adapter.getStores();

// 获取所有门店（包括已关闭的）
const stores = await adapter.getStores(false);
```

---

### 积分商品操作

#### `adapter.getPointsGoods(activeOnly)`
获取积分商品列表

**示例**:
```javascript
const goods = await adapter.getPointsGoods();
// [
//   { id: 1, name: '玲珑币-100积分', points: 100, stock: 99999 },
//   ...
// ]
```

---

#### `adapter.reducePointsGoodsStock(goodsId, quantity)`
扣减积分商品库存

**示例**:
```javascript
await adapter.reducePointsGoodsStock(1, 1);
```

---

### 协议操作

#### `adapter.getProtocol(type)`
获取特定类型的协议内容

**示例**:
```javascript
const content = await adapter.getProtocol('recharge');
// 返回协议文本内容
```

---

#### `adapter.getAllProtocols()`
获取所有协议（对象格式）

**示例**:
```javascript
const protocols = await adapter.getAllProtocols();
// {
//   recharge: '储值协议内容...',
//   privacy: '隐私政策内容...',
//   service: '服务条款内容...',
//   member: '会员协议内容...'
// }
```

---

### 记录操作

#### `adapter.createPointsRecord(recordData)`
创建积分记录

**示例**:
```javascript
await adapter.createPointsRecord({
  id: 'pr-001',
  userId: 'user-123',
  type: 'earn',
  amount: 100,
  balance: 600,
  description: '消费获得积分'
});
```

---

#### `adapter.getPointsRecords(userId, limit)`
获取用户的积分记录

**示例**:
```javascript
const records = await adapter.getPointsRecords('user-123', 50);
```

---

#### `adapter.createBalanceRecord(recordData)`
创建余额记录

**示例**:
```javascript
await adapter.createBalanceRecord({
  id: 'br-001',
  userId: 'user-123',
  type: 'consumption',
  amount: -50.00,
  balance: 950.00,
  description: '订单消费'
});
```

---

#### `adapter.createRechargeRecord(recordData)`
创建充值记录

**示例**:
```javascript
await adapter.createRechargeRecord({
  userId: 'user-123',
  amount: 100.00,
  bonusAmount: 20.00,
  totalAmount: 120.00,
  balanceBefore: 800.00,
  balanceAfter: 920.00,
  paymentMethod: 'wechat'
});
```

---

## 🔄 迁移示例

### 示例1: 迁移商品Controller

**原有代码** (`controllers/goodsController.js`):
```javascript
const { database } = require('../config/database');

exports.getGoodsList = (req, res) => {
  const { categoryId } = req.query;

  let goods = database.goods;

  if (categoryId) {
    goods = goods.filter(item => item.categoryId === parseInt(categoryId));
  }

  goods = goods.filter(item => item.status === 'onsale');

  res.json({
    success: true,
    data: { list: goods }
  });
};
```

**迁移后**:
```javascript
const adapter = require('../utils/databaseAdapter');

exports.getGoodsList = async (req, res) => {  // 注意async
  try {
    const { categoryId } = req.query;

    // 使用适配器查询
    const goods = await adapter.getGoodsList({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      status: 'onsale'
    });

    res.json({
      success: true,
      data: { list: goods }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取商品列表失败',
      error: error.message
    });
  }
};
```

---

### 示例2: 迁移订单Controller

**原有代码**:
```javascript
const createOrder = (req, res) => {
  const { userId, orderType, items, totalAmount, remark } = req.body;

  const order = {
    id: generateId(),
    orderNo: orderNo,
    userId: userId,
    orderType: orderType,
    items: items,
    totalAmount: totalAmount,
    status: 'pending',
    statusText: '待付款',
    remark: remark || ''
  };

  database.orders.set(order.id, order);

  res.json({
    success: true,
    data: order
  });
};
```

**迁移后**:
```javascript
const adapter = require('../utils/databaseAdapter');

const createOrder = async (req, res) => {
  try {
    const { userId, orderType, items, totalAmount, remark } = req.body;

    // 生成订单号
    const orderNo = 'DD' + Date.now();

    // 使用适配器创建订单（会自动处理items）
    const order = await adapter.createOrder({
      orderNo,
      userId,
      orderType,
      items,
      totalAmount,
      actualAmount: totalAmount,
      discountAmount: 0,
      remark: remark || ''
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
};
```

---

### 示例3: 迁移购物车Controller

**原有代码**:
```javascript
exports.addToCart = (req, res) => {
  const { userId, goodsId, quantity } = req.body;

  let userCart = database.carts.get(userId);

  if (!userCart) {
    userCart = {
      userId,
      items: [],
      createdAt: formatDate(),
      updatedAt: formatDate()
    };
    database.carts.set(userId, userCart);
  }

  const existingItem = userCart.items.find(item => item.goodsId === parseInt(goodsId));

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userCart.items.push({ goodsId: parseInt(goodsId), ...goods, quantity });
  }

  userCart.updatedAt = formatDate();

  res.json({ success: true, data: userCart });
};
```

**迁移后**:
```javascript
exports.addToCart = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    // 获取购物车
    let userCart = await adapter.getCart(userId);

    // 获取商品信息
    const goods = await adapter.getGoodsDetail(parseInt(goodsId));
    if (!goods) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 检查库存
    if (goods.stock < quantity) {
      return res.status(400).json({ success: false, message: '库存不足' });
    }

    // 检查是否已在购物车
    const existingItem = userCart.items.find(item => item.goodsId === parseInt(goodsId));

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCart.items.push({
        goodsId: parseInt(goodsId),
        name: goods.name,
        price: goods.price,
        image: goods.image,
        quantity
      });
    }

    userCart.updatedAt = new Date();

    // 保存购物车
    await adapter.saveCart(userId, userCart);

    res.json({ success: true, data: userCart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '加入购物车失败',
      error: error.message
    });
  }
};
```

---

### 示例4: 迁移会员Controller

**原有代码**:
```javascript
const getMemberInfo = (req, res) => {
  const { userId } = req.query;

  let member = database.members.get(userId);

  if (!member) {
    member = {
      userId,
      balance: '0.00',
      points: 0,
      coupons: 0,
      level: 1
    };
    database.members.set(userId, member);
  }

  res.json({ success: true, data: member });
};
```

**迁移后**:
```javascript
const getMemberInfo = async (req, res) => {
  try {
    const { userId } = req.query;

    let member = await adapter.getMember(userId);

    if (!member) {
      // 创建新会员
      member = {
        userId,
        balance: '0.00',
        points: 0,
        coupons: 0,
        level: 1
      };
      await adapter.createMember(member);
    }

    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取会员信息失败',
      error: error.message
    });
  }
};
```

---

## 💡 最佳实践

### 1. 使用async/await

所有适配器方法都是异步的，必须使用async/await：

```javascript
// ❌ 错误
const goods = adapter.getGoodsList();

// ✅ 正确
const goods = await adapter.getGoodsList();
```

### 2. 错误处理

始终使用try-catch处理错误：

```javascript
exports.getGoodsList = async (req, res) => {
  try {
    const goods = await adapter.getGoodsList();
    res.json({ success: true, data: goods });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### 3. 字段名使用camelCase

在使用适配器时，始终使用camelCase格式的字段名：

```javascript
// ✅ 正确
const goods = await adapter.getGoodsList({
  categoryId: 1,
  status: 'onsale'
});

// ❌ 错误（适配器会自动转换，不需要手动写snake_case）
const goods = await adapter.getGoodsList({
  category_id: 1,
  status: 'onsale'
});
```

### 4. 事务处理

对于需要原子性的操作，使用底层db的事务：

```javascript
const { db } = require('../utils/mysql');

await db.transaction(async (connection) => {
  // 多个数据库操作
  await connection.execute('UPDATE members SET balance = balance - ? WHERE user_id = ?', [amount, userId]);
  await connection.execute('INSERT INTO balance_records (...) VALUES (...)');
});
```

### 5. 渐进式迁移

不要一次性迁移所有controller，按以下顺序：

1. 先迁移简单的（stores, protocols）
2. 再迁移只读操作（getGoodsList, getPointsGoods）
3. 最后迁移复杂操作（orders, carts）

---

## ❓ 常见问题

### Q1: 为什么返回的数据字段名还是snake_case？

**A**: 确保你使用的是适配器方法，而不是直接使用db：

```javascript
// ✅ 使用适配器（自动转换为camelCase）
const goods = await adapter.getGoodsList();

// ❌ 直接使用db（返回snake_case）
const goods = await db.findMany('goods');
```

---

### Q2: 如何处理复杂查询？

**A**: 对于复杂查询，使用底层db方法，然后手动转换：

```javascript
const { db } = require('../utils/mysql');

// 复杂查询
const results = await db.query(`
  SELECT g.*, c.name as category_name
  FROM goods g
  LEFT JOIN goods_categories c ON g.category_id = c.id
  WHERE g.status = ?
`, ['onsale']);

// 手动转换为camelCase
const goods = adapter.toCamelCase(results);
```

---

### Q3: 订单的items是如何保存的？

**A**: 适配器会自动处理：
1. 创建订单时，items数组会自动保存到order_items表
2. 查询订单时，items会自动从order_items表加载并组装成数组

你不需要关心这些细节，就像使用内存数据库一样使用即可。

---

### Q4: 如何处理批量操作？

**A**: 使用底层db的批量操作：

```javascript
const { db } = require('../utils/mysql');

// 批量插入
const orders = [{ id: '1', ... }, { id: '2', ... }];
await db.batchInsert('orders', orders.map(o => adapter.toSnakeCase(o)));
```

---

### Q5: 适配器性能如何？

**A**: 适配器只是一个轻量级的转换层，性能开销极小：
- 字段名转换：O(n)复杂度，n为字段数量
- items组装：每次查询订单多一次数据库查询
- 连接池：使用mysql2的连接池，性能优秀

对于大多数应用，性能影响可以忽略不计。

---

## 📞 支持

如有问题，请查看：
- 完整API参考: 见上文的[API参考](#api参考)
- 迁移示例: 见上文的[迁移示例](#迁移示例)
- 兼容性报告: `docs/FINAL-COMPATIBILITY-REPORT.md`

---

**最后更新**: 2026-04-03
**维护者**: 玲珑酒馆技术团队
