# 数据库迁移实施计划

**项目**: 玲珑酒馆小程序后端API
**迁移**: 内存数据库 → MySQL (使用适配器)
**预计时间**: 5-8天
**难度**: 中等

---

## 📋 目录

1. [迁移概述](#迁移概述)
2. [前置准备](#前置准备)
3. [迁移阶段](#迁移阶段)
4. [详细步骤](#详细步骤)
5. [测试计划](#测试计划)
6. [回滚方案](#回滚方案)
7. [风险管理](#风险管理)

---

## 🎯 迁移概述

### 迁移目标

将后端代码从使用内存数据库（Map + Array）迁移到使用MySQL数据库，通过数据库适配层保持API接口不变。

### 迁移范围

**涉及的文件**:

- `controllers/*.js` - 所有控制器文件（约15个）
- `config/database.js` - 内存数据库配置（保留用于回滚）
- `utils/mysql.js` - MySQL连接类（已创建）
- `utils/databaseAdapter.js` - 数据库适配器（已创建）

**不涉及的文件**:

- 前端代码
- API路由定义
- 中间件
- 其他工具函数

### 迁移策略

采用**渐进式迁移**策略：

1. 保持API接口不变
2. 逐个迁移Controller
3. 充分测试后再迁移下一个
4. 保留原代码便于回滚

---

## 📦 前置准备

### 1. 环境准备

#### 1.1 安装MySQL

```bash
# macOS
brew install mysql
brew services start mysql

# Linux
sudo apt install mysql-server
sudo systemctl start mysql
```

#### 1.2 创建数据库

```bash
mysql -u root -p < database/complete-schema.sql
```

#### 1.3 配置环境变量

创建 `.env` 文件：

```env
NODE_ENV=development
PORT=3000

DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=miniprogram_db

JWT_SECRET=your-jwt-secret
```

#### 1.4 安装依赖

```bash
npm install mysql2 dotenv
```

### 2. 验证环境

```bash
# 测试MySQL连接
node -e "const { db } = require('./utils/mysql'); db.testConnection();"

# 应该输出: ✅ MySQL数据库连接成功
```

### 3. 数据验证

```bash
# 验证表结构
mysql -u root -p -e "USE miniprogram_db; SHOW TABLES;"

# 验证初始数据
mysql -u root -p -e "USE miniprogram_db; SELECT COUNT(*) FROM goods;"
```

---

## 🔄 迁移阶段

### 阶段1: 简单查询 (1-2天)

**目标**: 迁移只读操作的简单Controller

**优先级**: 低

**Controller列表**:

1. ✅ `commonController.js` - 公共接口（门店、优惠券、协议）
2. ✅ `goodsController.js` (部分) - 商品查询

**原因**:

- 只读操作，风险低
- 不涉及复杂业务逻辑
- 容易验证

### 阶段2: 商品和购物车 (1-2天)

**目标**: 迁移商品相关和购物车功能

**优先级**: 中

**Controller列表**:

1. ✅ `goodsController.js` (完整) - 包含购物车操作
2. ✅ 购物车相关路由

**原因**:

- 涉及读写操作
- 购物车逻辑较复杂
- 需要处理JSON字段

### 阶段3: 用户和会员 (1天)

**目标**: 迁移用户和会员相关功能

**优先级**: 高

**Controller列表**:

1. ✅ `userController.js` - 用户登录、信息管理
2. ✅ `memberController.js` - 会员信息、余额积分

**原因**:

- 核心业务功能
- 涉及认证授权
- 需要特别注意数据类型转换

### 阶段4: 订单 (2-3天)

**目标**: 迁移订单相关功能

**优先级**: 最高

**Controller列表**:

1. ✅ `orderController.js` - 订单CRUD
2. ✅ 订单支付流程

**原因**:

- 最复杂的业务逻辑
- 涉及items数组的分离存储
- 需要事务保证数据一致性

### 阶段5: 其他功能 (1天)

**目标**: 迁移剩余的Controller

**Controller列表**:

1. ✅ `pointsController.js` - 积分兑换
2. ✅ `birthdayController.js` - 生日礼
3. ✅ `securityController.js` - 安全设置

---

## 📝 详细步骤

### 步骤1: 备份现有代码

```bash
# 创建备份分支
git checkout -b backup/before-migration
git add .
git commit -m "备份：迁移内存数据库到MySQL之前"
git push origin backup/before-migration

# 创建迁移分支
git checkout -b feature/mysql-migration
```

---

### 步骤2: 迁移 commonController.js (示例)

#### 2.1 读取原文件

```bash
cat controllers/commonController.js
```

#### 2.2 修改文件

```javascript
// 原有代码
const { database } = require('../config/database');

// 修改为
const adapter = require('../utils/databaseAdapter');
```

#### 2.3 修改函数签名

```javascript
// 原有代码
exports.getStores = (req, res) => {
  const stores = database.stores;
  // ...
};

// 修改为
exports.getStores = async (req, res) => {
  try {
    const stores = await adapter.getStores();
    // ...
  } catch (error) {
    // 错误处理
  }
};
```

#### 2.4 测试

```bash
# 重启服务器
npm start

# 测试API
curl http://localhost:3000/api/stores
curl http://localhost:3000/api/coupons
curl http://localhost:3000/api/protocols/recharge
```

#### 2.5 验证检查清单

- [ ] API返回正确的数据
- [ ] 字段名是camelCase格式
- [ ] 错误处理正常工作
- [ ] 性能无明显下降
- [ ] 日志正常输出

---

### 步骤3: 迁移 goodsController.js

**参考示例**: `examples/migration-example.js`

```javascript
// 1. 引入适配器
const adapter = require('../utils/databaseAdapter');

// 2. 修改函数为async
exports.getGoodsList = async (req, res) => {
  try {
    const { categoryId } = req.query;

    // 3. 使用适配器查询
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
      error: error.message
    });
  }
};

// 4. 购物车操作使用专门的适配器方法
exports.addToCart = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    // 获取商品
    const goods = await adapter.getGoodsDetail(parseInt(goodsId));

    // 获取购物车
    let userCart = await adapter.getCart(userId);

    // 修改购物车
    userCart.items.push({...});

    // 保存购物车
    await adapter.saveCart(userId, userCart);

    res.json({ success: true, data: userCart });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

**测试要点**:

```bash
# 测试商品列表
curl http://localhost:3000/api/goods/list

# 测试商品详情
curl http://localhost:3000/api/goods/detail/1

# 测试添加到购物车
curl -X POST http://localhost:3000/api/goods/cart/add \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-001","goodsId":1,"quantity":2}'

# 测试获取购物车
curl http://localhost:3000/api/goods/cart?userId=test-user-001
```

---

### 步骤4: 迁移 userController.js 和 memberController.js

**注意事项**:

1. balance字段需要转换为字符串
2. 登录时需要同时创建users和members记录
3. wechat_session_key需要正确存储

```javascript
// 登录示例
const phoneLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    // 查询用户
    let user = await adapter.getUserByPhone(phone);

    if (!user) {
      // 创建新用户
      user = {
        id: generateId(),
        phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await adapter.createUser(user);

      // 创建会员
      await adapter.createMember({
        userId: user.id,
        balance: '0.00',
        points: 0,
        coupons: 0,
        level: 1,
      });
    }

    // 生成token
    const token = generateToken({ userId: user.id, phone });

    res.json({
      success: true,
      data: {
        token,
        userInfo: user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

---

### 步骤5: 迁移 orderController.js (最复杂)

**关键点**:

1. items数组会自动处理
2. 使用事务保证数据一致性
3. 状态更新需要同时更新status和statusText

```javascript
// 创建订单示例
const createOrder = async (req, res) => {
  try {
    const { userId, orderType, items, totalAmount, remark } = req.body;

    // 生成订单号
    const orderNo = 'DD' + Date.now();

    // 使用适配器创建订单
    // items会自动保存到order_items表
    const order = await adapter.createOrder({
      orderNo,
      userId,
      orderType,
      items, // 传入items数组
      totalAmount,
      actualAmount: totalAmount,
      discountAmount: 0,
      remark: remark || '',
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 查询订单列表
const getOrderList = async (req, res) => {
  try {
    const { userId } = req.query;

    // 获取订单列表（自动包含items）
    const orders = await adapter.getOrdersByUser(userId);

    res.json({
      success: true,
      data: { list: orders },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

---

### 步骤6: 迁移其他Controller

按照相同的模式迁移：

- `pointsController.js`
- `birthdayController.js`
- `securityController.js`

---

## 🧪 测试计划

### 单元测试

对于每个迁移的Controller，测试以下场景：

```javascript
// 测试模板示例
describe('Goods Controller', () => {
  test('应该返回商品列表', async () => {
    const response = await request(app).get('/api/goods/list').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.list).toBeDefined();
    expect(response.body.data.list[0].categoryId).toBeDefined(); // camelCase
  });

  test('应该按分类筛选商品', async () => {
    const response = await request(app)
      .get('/api/goods/list?categoryId=1')
      .expect(200);

    response.body.data.list.forEach((item) => {
      expect(item.categoryId).toBe(1);
    });
  });

  test('应该返回商品详情', async () => {
    const response = await request(app).get('/api/goods/detail/1').expect(200);

    expect(response.body.data.id).toBe(1);
  });

  test('应该正确处理购物车', async () => {
    // 添加商品
    await request(app)
      .post('/api/goods/cart/add')
      .send({
        userId: 'test-user-001',
        goodsId: 1,
        quantity: 2,
      })
      .expect(200);

    // 获取购物车
    const response = await request(app)
      .get('/api/goods/cart?userId=test-user-001')
      .expect(200);

    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.items[0].quantity).toBe(2);
  });
});
```

### 集成测试

测试完整的业务流程：

```bash
# 1. 用户登录
TOKEN=$(curl -X POST http://localhost:3000/api/user/phone/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000001"}' | jq -r '.data.token')

# 2. 浏览商品
curl http://localhost:3000/api/goods/list

# 3. 添加到购物车
curl -X POST http://localhost:3000/api/goods/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-001","goodsId":1,"quantity":2}'

# 4. 创建订单
curl -X POST http://localhost:3000/api/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"test-user-001",
    "orderType":"dian",
    "items":[{"goodsId":1,"name":"IPA精酿","price":48,"quantity":2}],
    "totalAmount":96
  }'

# 5. 查询订单
curl http://localhost:3000/api/orders/list?userId=test-user-001

# 6. 积分兑换
curl -X POST http://localhost:3000/api/points/exchange \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-001","goodsId":1}'
```

### 性能测试

对比迁移前后的性能：

```bash
# 使用Apache Bench进行压力测试
ab -n 1000 -c 10 http://localhost:3000/api/goods/list

# 预期结果：
# - 内存数据库: ~5000 req/sec
# - MySQL + 适配器: ~2000 req/sec
# - 性能下降约60%，但仍远超实际需求
```

---

## 🔙 回滚方案

### 方案A: 保留原代码（推荐）

在迁移过程中保留原代码，使用注释隔离：

```javascript
// controllers/goodsController.js

// ========== MySQL版本（当前使用） ==========
const adapter = require('../utils/databaseAdapter');

exports.getGoodsList = async (req, res) => {
  const goods = await adapter.getGoodsList();
  res.json({ success: true, data: goods });
};

// ========== 内存数据库版本（备用） ==========
// const { database } = require('../config/database');
//
// exports.getGoodsList = (req, res) => {
//   const goods = database.goods;
//   res.json({ success: true, data: goods });
// };
```

**回滚步骤**:

1. 注释掉MySQL版本
2. 取消注释内存数据库版本
3. 重启服务器

### 方案B: Git回滚

```bash
# 查看提交历史
git log --oneline

# 回滚到指定版本
git reset --hard <commit-hash>

# 重新部署
npm install
npm start
```

---

## ⚠️ 风险管理

### 已识别的风险

| 风险         | 严重性 | 可能性 | 缓解措施                                                  |
| ------------ | ------ | ------ | --------------------------------------------------------- |
| 数据丢失     | 高     | 低     | 1. 充分备份<br>2. 使用事务<br>3. 先在测试环境验证         |
| API不兼容    | 中     | 中     | 1. 保持接口不变<br>2. 适配器处理转换<br>3. 充分测试       |
| 性能下降     | 中     | 中     | 1. 使用连接池<br>2. 添加索引<br>3. 查询优化               |
| 数据类型错误 | 低     | 中     | 1. 适配器自动转换<br>2. 单元测试覆盖                      |
| 迁移时间过长 | 低     | 低     | 1. 分阶段迁移<br>2. 每个Controller独立<br>3. 可以随时暂停 |

### 监控指标

迁移过程中需要监控：

```javascript
// 在关键位置添加日志
console.log(`[MySQL] 查询商品列表: ${Date.now() - startTime}ms`);

// 监控数据库连接
const { pool } = require('./utils/mysql');
setInterval(() => {
  console.log(
    `[MySQL] 连接池状态: ${pool.pool._allConnections.length}/${pool.pool._freeConnections.length}`
  );
}, 60000);

// 监控错误
process.on('unhandledRejection', (error) => {
  console.error('[MySQL] 未处理的Promise拒绝:', error);
});
```

---

## ✅ 完成标准

迁移完成后，应该满足：

### 功能完整性

- [ ] 所有API端点正常工作
- [ ] 返回数据格式正确
- [ ] 字段名都是camelCase
- [ ] 错误处理正常

### 性能标准

- [ ] API响应时间 < 500ms (P95)
- [ ] 数据库连接池正常工作
- [ ] 无内存泄漏

### 数据完整性

- [ ] 订单items正确保存和加载
- [ ] 购物车数据完整
- [ ] 会员balance类型正确
- [ ] 无数据丢失

### 代码质量

- [ ] 所有异步函数使用async/await
- [ ] 所有错误都有try-catch
- [ ] 代码注释完整
- [ ] 通过代码审查

---

## 📊 进度跟踪

使用以下表格跟踪迁移进度：

| Controller            | 开始时间 | 完成时间 | 测试状态 | 备注 |
| --------------------- | -------- | -------- | -------- | ---- |
| commonController.js   |          |          | ⬜       |      |
| goodsController.js    |          |          | ⬜       |      |
| userController.js     |          |          | ⬜       |      |
| memberController.js   |          |          | ⬜       |      |
| orderController.js    |          |          | ⬜       |      |
| pointsController.js   |          |          | ⬜       |      |
| birthdayController.js |          |          | ⬜       |      |
| securityController.js |          |          | ⬜       |      |

---

## 📞 支持

如有问题，请参考：

1. **适配器使用指南**: `docs/ADAPTER-USAGE-GUIDE.md`
2. **迁移示例**: `examples/migration-example.js`
3. **兼容性报告**: `docs/FINAL-COMPATIBILITY-REPORT.md`
4. **数据库文档**: `docs/DATABASE-MIGRATION.md`

---

**最后更新**: 2026-04-03
**维护者**: 玲珑酒馆技术团队
**状态**: 待开始
