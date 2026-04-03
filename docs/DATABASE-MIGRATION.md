# MySQL数据库迁移指南

**项目**: 玲珑酒馆小程序后端API
**数据库**: MySQL 8.0+
**迁移时间**: 2026-04-03
**状态**: ✅ 已完成设计

---

## 📋 目录

1. [数据库架构](#数据库架构)
2. [环境准备](#环境准备)
3. [数据库安装](#数据库安装)
4. [数据库创建](#数据库创建)
5. [数据迁移](#数据迁移)
6. [代码配置](#代码配置)
7. [测试验证](#测试验证)
8. [常见问题](#常见问题)

---

## 🗄️ 数据库架构

### 数据表清单

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 用户表 | id, phone, wechat_openid, nickname, avatar |
| `members` | 会员表 | user_id, balance, points, coupons, level |
| `stores` | 门店表 | name, address, phone, latitude, longitude |
| `categories` | 商品分类表 | name, icon, sort |
| `products` | 商品表 | category_id, name, price, stock, sales |
| `orders` | 订单表 | order_no, user_id, total_amount, status |
| `order_items` | 订单明细表 | order_id, product_id, quantity, subtotal |
| `points_goods` | 积分商品表 | name, points, stock |
| `points_records` | 积分记录表 | user_id, type, amount, balance |
| `exchange_records` | 兑换记录表 | user_id, goods_id, points |
| `recharge_records` | 充值记录表 | user_id, amount, bonus_amount |
| `balance_records` | 余额记录表 | user_id, type, amount, balance |
| `coupons` | 优惠券表 | user_id, type, value, start_date, end_date |
| `birthday_gifts` | 生日礼表 | user_id, year, is_claimed |
| `carts` | 购物车表 | user_id, items (JSON) |
| `login_logs` | 登录日志表 | user_id, login_type, ip, device |
| `password_history` | 密码历史表 | user_id, password_hash |
| `protocols` | 协议表 | type, title, content, version |

**总计**: 18张表

---

## 🔧 环境准备

### 1. 安装MySQL

#### macOS (Homebrew)
```bash
# 安装MySQL
brew install mysql

# 启动MySQL服务
brew services start mysql

# 设置root密码
mysql_secure_installation
```

#### Ubuntu/Debian
```bash
# 安装MySQL
sudo apt update
sudo apt install mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

#### Windows
1. 下载MySQL Installer: https://dev.mysql.com/downloads/installer/
2. 运行安装程序
3. 选择"Developer Default"安装类型
4. 设置root密码

### 2. 验证MySQL安装

```bash
mysql --version
# 应该显示: mysql  Ver 8.0.x for ...
```

### 3. 登录MySQL

```bash
mysql -u root -p
# 输入密码后应该看到: mysql>
```

---

## 📦 数据库创建

### 1. 创建数据库和用户

```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE IF NOT EXISTS miniprogram_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（可选，生产环境推荐）
CREATE USER IF NOT EXISTS 'miniprogram_user'@'localhost' IDENTIFIED BY 'your_password';

-- 授予权限
GRANT ALL PRIVILEGES ON miniprogram_db.* TO 'miniprogram_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 2. 导入数据库Schema

```bash
# 进入项目目录
cd /Users/bigdata/miniprogram-api-server

# 导入schema
mysql -u root -p miniprogram_db < database/schema.sql

# 导入初始数据
mysql -u root -p miniprogram_db < database/init-data.sql
```

### 3. 验证数据库创建

```bash
# 登录MySQL
mysql -u root -p

# 使用数据库
USE miniprogram_db;

-- 查看所有表
SHOW TABLES;

-- 应该看到18张表:
-- users, members, stores, categories, products, orders,
-- order_items, points_goods, points_records, exchange_records,
-- recharge_records, balance_records, coupons, birthday_gifts,
-- carts, login_logs, password_history, protocols

-- 查看表结构
DESCRIBE users;
DESCRIBE orders;

-- 查看初始数据
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM stores;

-- 退出
EXIT;
```

---

## 🚀 数据迁移

### 选项1: 从内存数据库迁移（当前项目）

如果你已经在使用内存数据库并有数据需要迁移：

```bash
# 导出内存数据（需要在代码中实现导出功能）
# 然后导入到MySQL

node scripts/migrate-memory-to-mysql.js
```

### 选项2: 使用MySQL启动（推荐）

直接使用MySQL，从头开始：

```bash
# 1. 创建数据库
mysql -u root -p < database/schema.sql

# 2. 导入初始数据
mysql -u root -p < database/init-data.sql

# 3. 配置环境变量
cp .env.example .env

# 4. 编辑.env文件
# 设置 MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
# 设置 DB_TYPE=mysql

# 5. 启动服务器
npm start
```

---

## ⚙️ 代码配置

### 1. 安装依赖

```bash
cd /Users/bigdata/miniprogram-api-server
npm install
```

确认package.json中已包含：
```json
{
  "dependencies": {
    "mysql2": "^3.20.0",
    "dotenv": "^16.0.0"
  }
}
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件
nano .env
```

修改以下配置：

```env
# 数据库类型选择（memory或mysql）
DB_TYPE=mysql

# MySQL配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=miniprogram_db

# 服务器配置
NODE_ENV=development
PORT=3000
```

### 3. 使用MySQL数据库类

在controller中使用MySQL：

```javascript
const { db } = require('../utils/mysql');

// 查询单个用户
const user = await db.findOne('users', { id: userId });

// 查询多个用户
const users = await db.findMany('users', { is_active: true }, {
  orderBy: 'created_at',
  order: 'DESC',
  limit: 10
});

// 插入数据
const result = await db.insert('users', {
  id: userId,
  phone: '13800000000',
  nickname: '测试用户'
});

// 更新数据
await db.update('users',
  { nickname: '新昵称' },
  { id: userId }
);

// 删除数据（软删除）
await db.update('users',
  { is_deleted: true },
  { id: userId }
);

// 查询数量
const count = await db.count('users', { is_active: true });

// 执行事务
await db.transaction(async (connection) => {
  await connection.execute(
    'INSERT INTO orders (id, user_id, total_amount) VALUES (?, ?, ?)',
    [orderId, userId, amount]
  );
  await connection.execute(
    'UPDATE members SET balance = balance - ? WHERE user_id = ?',
    [amount, userId]
  );
});
```

### 4. 原有代码迁移示例

**迁移前**（使用内存数据库）:
```javascript
const { database } = require('../config/database');

// 获取用户
const user = database.users.get(userId);

// 保存用户
database.users.set(userId, userData);
```

**迁移后**（使用MySQL）:
```javascript
const { db } = require('../utils/mysql');

// 获取用户
const user = await db.findOne('users', { id: userId });

// 保存用户
await db.update('users', userData, { id: userId });
```

---

## ✅ 测试验证

### 1. 测试数据库连接

```bash
# 运行测试脚本
node -e "const { db } = require('./utils/mysql'); db.testConnection();"
```

应该看到：`✅ MySQL数据库连接成功`

### 2. 测试基本操作

创建测试脚本 `test-db.js`:

```javascript
const { db } = require('./utils/mysql');

async function testDatabase() {
  try {
    console.log('=== 测试数据库连接 ===');
    await db.testConnection();

    console.log('\n=== 测试查询分类 ===');
    const categories = await db.findMany('categories');
    console.log('分类数量:', categories.length);

    console.log('\n=== 测试查询商品 ===');
    const products = await db.findMany('products', { status: 'onsale' }, {
      limit: 5
    });
    console.log('商品数量:', products.length);

    console.log('\n=== 测试查询单条 ===');
    const user = await db.findOne('users', { phone: '13800000001' });
    console.log('测试用户:', user ? user.nickname : '未找到');

    console.log('\n=== 测试插入 ===');
    const result = await db.insert('login_logs', {
      id: require('uuid').v4(),
      user_id: 'test-user-001',
      login_type: 'phone',
      ip: '127.0.0.1'
    });
    console.log('插入结果:', result);

    console.log('\n=== 所有测试通过 ✅ ===');
    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

testDatabase();
```

运行测试：
```bash
node test-db.js
```

### 3. 测试API端点

```bash
# 启动服务器
npm start

# 测试获取商品分类
curl http://localhost:3000/api/goods/categories

# 测试获取商品列表
curl http://localhost:3000/api/goods/list

# 测试获取会员信息
curl http://localhost:3000/api/member/info?userId=test-user-001
```

---

## ❓ 常见问题

### Q1: 连接数据库失败

**错误**: `Access denied for user 'root'@'localhost'`

**解决**:
```bash
# 检查MySQL服务是否运行
brew services list | grep mysql  # macOS
sudo systemctl status mysql  # Linux

# 重置root密码
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Q2: 字符集问题

**错误**: 中文乱码

**解决**: 确保数据库、表、连接都使用utf8mb4：

```sql
-- 检查数据库字符集
SHOW VARIABLES LIKE 'character%';

-- 应该看到:
-- character_set_database = utf8mb4
-- character_set_server = utf8mb4
```

### Q3: 时区问题

**错误**: 时间相差8小时

**解决**: 在连接配置中设置时区：

```javascript
// utils/mysql.js
const dbConfig = {
  // ...
  timezone: '+08:00',  // 中国时区
  charset: 'utf8mb4'
};
```

### Q4: 连接池耗尽

**错误**: `Too many connections`

**解决**: 调整连接池配置或MySQL最大连接数：

```javascript
// utils/mysql.js
const dbConfig = {
  connectionLimit: 20,  // 增加连接池大小
  queueLimit: 0
};
```

```sql
-- MySQL配置
SET GLOBAL max_connections = 200;
```

### Q5: 外键约束失败

**错误**: `Cannot add or update a child row`

**解决**: 检查外键关系，确保先插入父表数据：

```sql
-- 检查外键约束
SELECT
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME
FROM
  information_schema.KEY_COLUMN_USAGE
WHERE
  TABLE_SCHEMA = 'miniprogram_db'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## 📊 数据库维护

### 定期备份

```bash
# 备份数据库
mysqldump -u root -p miniprogram_db > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p miniprogram_db < backup_20260403.sql
```

### 查看数据库大小

```sql
SELECT
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM
  information_schema.tables
WHERE
  table_schema = 'miniprogram_db'
GROUP BY
  table_schema;
```

### 性能优化

```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query%';

-- 查看索引使用情况
SHOW INDEX FROM users;
SHOW INDEX FROM orders;

-- 分析表
ANALYZE TABLE users, orders, order_items;
```

---

## 🔄 数据库版本控制

### 使用Git管理schema变更

1. **修改schema时**:
```bash
# 创建新的迁移文件
touch database/migrations/002_add_user_avatar_index.sql
```

2. **迁移文件格式**:
```sql
-- 002_add_user_avatar_index.sql
-- 添加用户头像索引

ALTER TABLE users ADD INDEX idx_avatar (avatar);
```

3. **版本管理**:
```sql
CREATE TABLE schema_migrations (
  version VARCHAR(20) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (version) VALUES ('001');
```

---

## 📚 参考资源

- [MySQL官方文档](https://dev.mysql.com/doc/)
- [mysql2文档](https://github.com/sidorares/node-mysql2)
- [Node.js最佳实践](https://nodejs.org/en/docs/guides/)
- [数据库设计规范](https://dev.mysql.com/doc/refman/8.0/en/sql-syntax.html)

---

**最后更新**: 2026-04-03
**维护者**: 玲珑酒馆技术团队
