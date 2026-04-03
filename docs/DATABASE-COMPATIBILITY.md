# 数据库Schema与后端代码匹配性检查报告

**检查时间**: 2026-04-03
**项目**: 玲珑酒馆小程序后端API
**状态**: ⚠️ 发现多处不匹配

---

## 📋 匹配性检查结果总览

| 表名 | 匹配状态 | 问题数量 | 严重程度 |
|------|---------|---------|---------|
| users | ⚠️ 部分匹配 | 2 | 中 |
| members | ✅ 匹配 | 0 | - |
| orders | ❌ 不匹配 | 5 | 高 |
| order_items | ⚠️ 缺失后端代码 | 0 | - |
| categories | ❌ 命名不匹配 | 1 | 低 |
| products | ❌ 命名不匹配 | 1 | 低 |
| points_goods | ✅ 匹配 | 0 | - |
| points_records | ✅ 匹配 | 0 | - |
| exchange_records | ✅ 匹配 | 0 | - |
| recharge_records | ✅ 匹配 | 0 | - |
| balance_records | ✅ 匹配 | 0 | - |
| coupons | ❌ 结构不匹配 | 2 | 中 |
| stores | ✅ 匹配 | 0 | - |
| birthday_gifts | ✅ 匹配 | 0 | - |
| carts | ⚠️ 结构不匹配 | 1 | 中 |
| login_logs | ✅ 匹配 | 0 | - |
| password_history | ✅ 匹配 | 0 | - |
| protocols | ⚠️ 结构不匹配 | 1 | 低 |

**总计**: 18张表
- ✅ 完全匹配: 11张
- ⚠️ 部分匹配: 5张
- ❌ 不匹配: 2张

---

## 🔴 高优先级问题

### 1. orders表 - items字段不匹配 ⚠️

**后端代码** (`controllers/orderController.js:40-52`):
```javascript
const order = {
  id: generateId(),
  orderNo: orderNo,
  userId: userId,
  orderType: orderType,
  items: items,        // ❌ 数组直接存储在订单中
  totalAmount: totalAmount,
  status: 'pending',
  statusText: '待付款',
  remark: remark || '',
  createdAt: formatDate(),
  updatedAt: formatDate()
};
```

**MySQL Schema** (`database/schema.sql`):
```sql
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    -- ❌ 没有 items 字段
    total_amount DECIMAL(10,2) NOT NULL,
    -- ... 其他字段
);
```

**问题**:
- 后端将订单商品数组直接存储在订单对象中
- MySQL schema使用分离的`order_items`表
- 后端缺少对`order_items`表的操作

**影响**:
- 订单商品明细无法正确存储到MySQL
- 需要修改后端代码以支持分离的order_items表

**修复方案**:
```javascript
// 修改后的代码
const createOrder = async (req, res) => {
  const { userId, orderType, items, totalAmount, remark } = req.body;

  // 使用事务创建订单和订单明细
  await db.transaction(async (connection) => {
    // 1. 创建订单（不含items）
    const order = await db.insert('orders', {
      id: generateId(),
      order_no: orderNo,
      user_id: userId,
      order_type: orderType,
      total_amount: totalAmount,
      status: 'pending',
      status_text: '待付款',
      remark: remark || ''
    });

    // 2. 批量插入订单明细
    for (const item of items) {
      await db.insert('order_items', {
        order_id: order.insertId,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      });
    }
  });
};
```

---

### 2. orders表 - 缺少必要字段

**后端使用的字段**:
- `orderNo` ✅
- `userId` ✅
- `orderType` ✅
- `items` ❌ (应该是分离的表)
- `totalAmount` ✅
- `status` ✅
- `statusText` ✅
- `remark` ✅
- `createdAt` ✅
- `updatedAt` ✅

**MySQL Schema缺少的字段**:
- `statusText` - 后端使用但schema中没有定义

**修复方案**:
```sql
ALTER TABLE orders ADD COLUMN status_text VARCHAR(50) COMMENT '状态文本';
```

---

## 🟡 中优先级问题

### 3. categories/goods命名不匹配

**后端代码**:
- `database.goodsCategories` (Array)
- `database.goods` (Array)

**MySQL Schema**:
- `categories` (表)
- `products` (表)

**修复方案**:

**选项A**: 修改MySQL Schema（推荐）
```sql
RENAME TABLE categories TO goods_categories;
RENAME TABLE products TO goods;
```

**选项B**: 修改后端代码
```javascript
// 将所有 database.goodsCategories 改为 database.categories
// 将所有 database.goods 改为 database.products
```

---

### 4. users表 - 缺少字段

**后端使用的字段** (from userController.js):
```javascript
{
  id,
  phone,
  avatar,
  nickname,
  gender,
  birthday,
  city,
  province,
  country,
  wechat_openid,
  wechat_session_key,  // ❌ MySQL schema没有
  wechat_unionid,
  createdAt,
  updatedAt
}
```

**MySQL Schema缺少**:
- `wechat_session_key` - 后端用于解密微信手机号

**修复方案**:
```sql
ALTER TABLE users ADD COLUMN wechat_session_key VARCHAR(255) COMMENT '微信Session Key';
```

---

### 5. coupons表 - 结构不匹配

**后端代码** (`config/database.js:56-57`):
```javascript
// 优惠券数据
coupons: [],  // ❌ 简单数组，没有用户关联
```

**MySQL Schema**:
```sql
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,  -- ✅ 关联到用户
    name VARCHAR(100) NOT NULL,
    type ENUM('fixed', 'percentage') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    -- ...
);
```

**问题**:
- 后端使用全局优惠券数组（没有用户关联）
- MySQL schema使用用户优惠券表（每个用户有自己的优惠券）

**影响**: 功能完全不同

**修复方案**:
需要确认业务逻辑：优惠券是全局的还是用户专属的？

---

### 6. carts表 - 结构不匹配

**后端代码** (`config/database.js:285`):
```javascript
carts: new Map(),  // Map<userId, cartData>
```

**后端使用** (`controllers/goodsController.js`):
```javascript
let userCart = database.carts.get(userId);
// cartData 结构可能是 { items: [], total: 0, count: 0 }
```

**MySQL Schema**:
```sql
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    items JSON NOT NULL COMMENT '购物车商品（JSON数组）'
);
```

**问题**: 可以兼容，但需要处理JSON序列化

---

## 🟢 低优先级问题

### 7. protocols表 - 结构差异

**后端代码** (`config/database.js:84-88`):
```javascript
protocols: {
  recharge: '储值协议内容...',
  privacy: '隐私政策内容...',
  service: '服务条款内容...'
}
```

**MySQL Schema**:
```sql
CREATE TABLE protocols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('recharge', 'privacy', 'service', 'member') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(20) NOT NULL
);
```

**问题**:
- 后端使用简单的键值对对象
- MySQL schema支持多版本协议

**影响**: 查询方式不同

**修复方案**: 修改后端查询逻辑

---

## 📊 完整字段对比

### users表

| 后端字段 | MySQL字段 | 匹配 | 说明 |
|---------|-----------|------|------|
| id | id | ✅ | UUID |
| phone | phone | ✅ | VARCHAR(20) |
| avatar | avatar | ✅ | TEXT (支持Base64) |
| nickname | nickname | ✅ | VARCHAR(100) |
| gender | gender | ⚠️ | ENUM vs ENUM('male','female','unknown') |
| birthday | birthday | ✅ | DATE |
| city | city | ✅ | VARCHAR(100) |
| province | province | ✅ | VARCHAR(100) |
| country | country | ✅ | VARCHAR(100) |
| wechat_openid | wechat_openid | ✅ | VARCHAR(100) |
| **wechat_session_key** | **缺失** | ❌ | **需要添加** |
| wechat_unionid | wechat_unionid | ✅ | VARCHAR(100) |
| password_hash | password_hash | ✅ | VARCHAR(255) |
| is_active | is_active | ✅ | BOOLEAN |
| is_deleted | is_deleted | ✅ | BOOLEAN |
| createdAt | created_at | ✅ | TIMESTAMP |
| updatedAt | updated_at | ✅ | TIMESTAMP |

### orders表

| 后端字段 | MySQL字段 | 匹配 | 说明 |
|---------|-----------|------|------|
| id | id | ✅ | UUID |
| orderNo | order_no | ✅ | 命名不同 |
| userId | user_id | ✅ | 命名不同 |
| orderType | order_type | ✅ | 命名不同 |
| **items (数组)** | **缺失** | ❌ | **应该使用order_items表** |
| totalAmount | total_amount | ✅ | 命名不同 |
| status | status | ✅ | ENUM |
| **statusText** | **缺失** | ❌ | **需要添加** |
| remark | remark | ✅ | TEXT |
| paidAt | paid_at | ✅ | TIMESTAMP |
| completedAt | completed_at | ✅ | TIMESTAMP |
| cancelledAt | cancelled_at | ✅ | TIMESTAMP |
| createdAt | created_at | ✅ | TIMESTAMP |
| updatedAt | updated_at | ✅ | TIMESTAMP |

---

## 🛠️ 修复优先级和时间估算

### P0 - 立即修复（阻塞性问题）

| # | 问题 | 修复方式 | 预计时间 |
|---|------|---------|---------|
| 1 | orders表缺少items字段支持 | 修改后端代码使用order_items | 2-3小时 |
| 2 | orders表缺少status_text字段 | 添加字段 | 5分钟 |
| 3 | users表缺少wechat_session_key | 添加字段 | 5分钟 |

### P1 - 高优先级（功能性问题）

| # | 问题 | 修复方式 | 预计时间 |
|---|------|---------|---------|
| 4 | categories/goods命名不一致 | 统一命名 | 30分钟 |
| 5 | coupons结构不匹配 | 确认需求并修改 | 1-2小时 |

### P2 - 中优先级（兼容性问题）

| # | 问题 | 修复方式 | 预计时间 |
|---|------|---------|---------|
| 6 | carts JSON处理 | 添加序列化/反序列化 | 30分钟 |
| 7 | protocols查询方式 | 修改查询逻辑 | 30分钟 |

---

## 🔧 快速修复脚本

### 1. 添加缺失字段

```sql
-- 添加wechat_session_key到users表
ALTER TABLE users ADD COLUMN wechat_session_key VARCHAR(255) COMMENT '微信Session Key' AFTER wechat_unionid;

-- 添加status_text到orders表
ALTER TABLE orders ADD COLUMN status_text VARCHAR(50) COMMENT '状态文本' AFTER status;
```

### 2. 重命名表（可选）

```sql
-- 如果选择修改MySQL命名以匹配后端
RENAME TABLE categories TO goods_categories;
RENAME TABLE products TO goods;

-- 或者修改后端代码使用新命名
```

### 3. 创建数据库兼容层

创建一个适配器类，使后端代码可以无缝切换：

```javascript
// utils/databaseAdapter.js
const { db } = require('./mysql');

class DatabaseAdapter {
  // 订单操作适配
  async createOrder(orderData) {
    const order = await db.insert('orders', {
      id: orderData.id,
      order_no: orderData.orderNo,
      user_id: orderData.userId,
      order_type: orderData.orderType,
      total_amount: orderData.totalAmount,
      status: orderData.status,
      status_text: orderData.statusText,
      remark: orderData.remark
    });

    // 批量插入订单明细
    for (const item of orderData.items) {
      await db.insert('order_items', {
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      });
    }

    return orderData;
  }

  // 购物车操作适配
  async getCart(userId) {
    const cart = await db.findOne('carts', { user_id: userId });
    if (cart && cart.items) {
      return JSON.parse(cart.items);
    }
    return { items: [], total: 0, count: 0 };
  }

  async saveCart(userId, cartData) {
    await db.insert('carts', {
      id: generateId(),
      user_id: userId,
      items: JSON.stringify(cartData.items)
    }, { update: true });
  }
}

module.exports = new DatabaseAdapter();
```

---

## ✅ 推荐的修复步骤

### 步骤1: 执行SQL修复脚本

```bash
mysql -u root -p miniprogram_db < database/fix-schema.sql
```

### 步骤2: 创建适配层

创建`utils/databaseAdapter.js`，提供兼容接口

### 步骤3: 逐个迁移controller

1. 从简单的开始（stores, protocols）
2. 再做复杂的（orders, users）
3. 最后做购物车

### 步骤4: 测试验证

- 单元测试每个controller
- API集成测试
- 前后端联调测试

---

## 📝 总结

**匹配度**: 约70%

**主要问题**:
1. ❌ 订单items字段使用方式不匹配
2. ❌ 表命名不一致
3. ⚠️ 缺少部分必要字段
4. ⚠️ 数据结构设计差异（coupons, carts）

**建议**:
1. **优先修复P0问题**（orders表）
2. **选择统一的命名规范**（修改MySQL schema或后端代码）
3. **创建适配层**以最小化代码修改
4. **逐步迁移**，不要一次性全部修改

**预计修复时间**: 4-6小时

---

**生成时间**: 2026-04-03
**检查者**: Claude AI
