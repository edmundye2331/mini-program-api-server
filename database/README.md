# MySQL数据库设置和使用指南

**版本**：1.0
**创建时间**：2026-04-02
**数据库**：MySQL 5.7+ 或 MariaDB 10.3+

---

## 📋 目录

1. [数据库安装](#数据库安装)
2. [数据库创建](#数据库创建)
3. [环境配置](#环境配置)
4. [数据库初始化](#数据库初始化)
5. [测试连接](#测试连接)
6. [数据迁移](#数据迁移)
7. [常见问题](#常见问题)
8. [性能优化](#性能优化)

---

## 1. 数据库安装

### macOS（使用Homebrew）

```bash
# 安装MySQL
brew install mysql

# 启动MySQL服务
brew services start mysql

# 设置root密码
mysql_secure_installation
```

### macOS（使用官方安装包）

1. 下载MySQL安装包：https://dev.mysql.com/downloads/mysql/
2. 安装MySQL
3. 记录设置的root密码
4. 启动MySQL：`系统偏好设置` → `MySQL` → `Start`

### Ubuntu/Debian

```bash
# 更新包列表
sudo apt update

# 安装MySQL服务器
sudo apt install mysql-server

# 安全配置
sudo mysql_secure_installation

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Windows

1. 下载MySQL安装器：https://dev.mysql.com/downloads/installer/
2. 运行安装程序
3. 选择"Developer Default"安装类型
4. 设置root密码并记住
5. 完成安装

---

## 2. 数据库创建

### 方法1：使用MySQL命令行

```bash
# 登录MySQL（首次登录可能需要密码）
mysql -u root -p

# 创建数据库
CREATE DATABASE miniprogram_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

# 创建专用数据库用户（推荐）
CREATE USER 'miniprogram'@'localhost' IDENTIFIED BY 'your_password';

# 授权
GRANT ALL PRIVILEGES ON miniprogram_db.* TO 'miniprogram'@'localhost';

# 刷新权限
FLUSH PRIVILEGES;

# 退出
EXIT;
```

### 方法2：使用MySQL Workbench

1. 打开MySQL Workbench
2. 连接到本地MySQL服务器
3. 点击`Server` → `Data Import`
4. 选择`Create New Schema`
5. 输入`miniprogram_db`
6. 设置字符集为`utf8mb4`
7. 点击`Apply`

---

## 3. 环境配置

### 步骤1：复制环境变量文件

```bash
cd /Users/bigdata/miniprogram-api-server
cp .env.example .env
```

### 步骤2：编辑.env文件

```bash
# 使用你喜欢的编辑器打开.env文件
nano .env
# 或
vim .env
# 或
code .env
```

### 步骤3：配置数据库连接

```env
# 修改以下配置项
DB_HOST=localhost
DB_PORT=3306
DB_USER=root           # 或 miniprogram
DB_PASSWORD=your-mysql-password    # 修改为实际密码
DB_NAME=miniprogram_db

# JWT密钥（建议修改）
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
```

### 保存并退出

---

## 4. 数据库初始化

### 步骤1：创建数据库表结构

```bash
# 进入项目目录
cd /Users/bigdata/miniprogram-api-server

# 执行schema.sql
mysql -u root -p miniprogram_db < database/schema.sql

# 输入MySQL root密码
```

### 步骤2：初始化数据

```bash
# 执行init-data.sql
mysql -u root -p miniprogram_db < database/init-data.sql

# 输入MySQL root密码
```

### 验证初始化

```bash
# 登录MySQL
mysql -u root -p

# 使用数据库
USE miniprogram_db;

# 查看表
SHOW TABLES;

# 查看数据统计
SELECT '商品' as type, COUNT(*) as count FROM products
UNION ALL
SELECT '用户', COUNT(*) FROM users
UNION ALL
SELECT '订单', COUNT(*) FROM orders;

# 退出
EXIT;
```

---

## 5. 测试连接

### 方法1：使用Node.js脚本测试

创建测试脚本 `test-db-connection.js`：

```javascript
const { testConnection } = require('./config/mysql');

testConnection().then(success => {
  if (success) {
    console.log('✅ 数据库连接测试成功！');
    process.exit(0);
  } else {
    console.log('❌ 数据库连接测试失败！');
    process.exit(1);
  }
});
```

运行测试：

```bash
node test-db-connection.js
```

### 方法2：使用MySQL命令行测试

```bash
mysql -u root -p miniprogram_db -e "SELECT '连接成功' as status;"
```

---

## 6. 数据迁移

### 从内存数据库迁移到MySQL

如果你的系统已经在使用内存数据库，可以按照以下步骤迁移：

#### 步骤1：导出内存数据

在迁移前，先添加数据导出功能到现有的内存数据库系统：

```javascript
// export-memory-data.js
const { database } = require('./config/database');
const fs = require('fs');

// 导出数据
const exportData = {
  users: Array.from(database.users.entries()),
  members: Array.from(database.members.entries()),
  orders: Array.from(database.orders.entries()),
  products: database.goods,
  categories: database.goodsCategories,
  pointsGoods: database.pointsGoods,
  stores: database.stores
};

// 保存为JSON
fs.writeFileSync(
  './database/memory-data-export.json',
  JSON.stringify(exportData, null, 2)
);

console.log('✅ 内存数据已导出到 memory-data-export.json');
```

#### 步骤2：导入数据到MySQL

创建数据导入脚本并执行。

---

## 7. 常见问题

### 问题1：连接被拒绝

**错误信息**：`Access denied for user 'root'@'localhost'`

**解决方案**：
```bash
# 重置root密码
mysql -u root -p

# 在MySQL中执行
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### 问题2：字符集问题

**错误信息**：`Incorrect string value`

**解决方案**：
确保数据库、表和字段都使用utf8mb4字符集。

```sql
-- 检查数据库字符集
SHOW VARIABLES LIKE 'character%';

-- 修改数据库字符集
ALTER DATABASE miniprogram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题3：连接池耗尽

**错误信息**：`Connection limit exceeded`

**解决方案**：
```javascript
// config/mysql.js
const dbConfig = {
  // ...
  connectionLimit: 20,  // 增加连接池大小
  waitForConnections: true,
  queueLimit: 0
};
```

### 问题4：时区问题

**错误信息**：时间不正确

**解决方案**：
```sql
-- 检查MySQL时区设置
SELECT @@global.time_zone, @@session.time_zone;

-- 设置为北京时区
SET GLOBAL time_zone = '+8:00';
```

### 问题5：外键约束失败

**错误信息**：`Cannot add or update a child row`

**解决方案**：
```sql
-- 临时禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 执行数据操作
-- ...

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 8. 性能优化

### 优化1：索引优化

```sql
-- 查看索引使用情况
SHOW INDEX FROM orders;

-- 分析查询性能
EXPLAIN SELECT * FROM orders WHERE user_id = 'xxx';

-- 添加复合索引
CREATE INDEX idx_user_status ON orders(user_id, status);
```

### 优化2：查询优化

```sql
-- 使用LIMIT限制返回结果
SELECT * FROM orders ORDER BY created_at DESC LIMIT 100;

-- 避免SELECT *
SELECT id, order_no, status FROM orders WHERE user_id = 'xxx';

-- 使用JOIN代替子查询
SELECT o.*, u.nickname
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';
```

### 优化3：配置优化

编辑MySQL配置文件（`my.cnf` 或 `my.ini`）：

```ini
[mysqld]
# 连接数
max_connections = 200

# 缓冲区大小
innodb_buffer_pool_size = 256M

# 日志文件大小
innodb_log_file_size = 64M

# 查询缓存（MySQL 5.7及以下）
query_cache_size = 32M
query_cache_type = 1
```

### 优化4：定期维护

```sql
-- 分析表
ANALYZE TABLE users, members, orders, products;

-- 优化表
OPTIMIZE TABLE users, members, orders, products;

-- 检查表
CHECK TABLE users, members, orders, products;
```

---

## 9. 备份和恢复

### 备份数据库

```bash
# 完整备份
mysqldump -u root -p miniprogram_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 仅备份数据（不含结构）
mysqldump -u root -p --no-create-info miniprogram_db > data_$(date +%Y%m%d_%H%M%S).sql

# 仅备份结构（不含数据）
mysqldump -u root -p --no-data miniprogram_db > schema_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库

```bash
# 从备份文件恢复
mysql -u root -p miniprogram_db < backup_20260402_120000.sql
```

### 自动化备份脚本

```bash
#!/bin/bash
# auto-backup.sh

BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/miniprogram_db_$TIMESTAMP.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mysqldump -u root -pYOUR_PASSWORD miniprogram_db > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 删除30天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "备份完成: $BACKUP_FILE.sql.gz"
```

添加到crontab：

```bash
# 每天凌晨2点执行备份
0 2 * * * /path/to/auto-backup.sh
```

---

## 10. 监控和日志

### 启用慢查询日志

编辑MySQL配置：

```ini
[mysqld]
# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2

# 通用查询日志（开发环境）
general_log = 1
general_log_file = /var/log/mysql/general.log
```

### 查看慢查询

```sql
-- 查看慢查询日志
SELECT * FROM mysql.slow_log
WHERE query_time > 2
ORDER BY query_time DESC
LIMIT 10;
```

---

## 11. 安全建议

### 1. 用户权限

```sql
-- 创建只读用户（用于查询）
CREATE USER 'readonly'@'localhost' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON miniprogram_db.* TO 'readonly'@'localhost';

-- 创建读写用户（用于应用）
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON miniprogram_db.* TO 'app_user'@'localhost';
```

### 2. 连接加密

修改连接配置以使用SSL：

```javascript
const dbConfig = {
  // ...
  ssl: {
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
    key: fs.readFileSync('/path/to/client-key.pem'),
    cert: fs.readFileSync('/path/to/client-cert.pem')
  }
};
```

### 3. SQL注入防护

使用参数化查询（已实现）：

```javascript
// ✅ 正确：使用参数化
const results = await query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// ❌ 错误：直接拼接SQL
const sql = 'SELECT * FROM users WHERE id = ' + userId;  // 危险！
```

---

## 12. 数据库管理工具推荐

### GUI工具

1. **MySQL Workbench**（官方推荐）
   - 下载：https://dev.mysql.com/downloads/workbench/
   - 功能：SQL开发、服务器管理、数据迁移

2. **phpMyAdmin**（Web界面）
   - 安装：`brew install phpmyadmin` 或通过Web服务器
   - 功能：Web管理界面

3. **DBeaver**（免费通用工具）
   - 下载：https://dbeaver.io/
   - 功能：支持多种数据库

4. **Sequel Pro**（macOS，付费）
   - 下载：https://www.sequelpro.com/
   - 功能：优秀的macOS MySQL客户端

### 命令行工具

```bash
# mysql命令行客户端
mysql -u root -p

# 监控工具
mysqladmin -u root -p processlist
mysqladmin -u root -p status

# 备份工具
mysqldump -u root -p miniprogram_db > backup.sql
```

---

## 13. 下一步

完成数据库设置后，你需要：

1. ✅ 更新后端代码以使用MySQL
2. ✅ 实现数据访问层（DAO）
3. ✅ 测试所有API端点
4. ✅ 性能测试
5. ✅ 部署到生产环境

详细的代码实现请参考：
- `/miniprogram-api-server/config/mysql.js` - 数据库配置
- `/miniprogram-api-server/database/schema.sql` - 数据库结构
- `/miniprogram-api-server/database/init-data.sql` - 初始化数据

---

## 📞 技术支持

如遇到问题，请检查：
1. MySQL服务是否正在运行
2. 数据库配置是否正确
3. 用户权限是否足够
4. 防火墙是否阻止连接

**快速检查命令**：

```bash
# 检查MySQL状态
brew services list | grep mysql  # macOS
systemctl status mysql           # Linux

# 检查MySQL端口
netstat -an | grep 3306

# 测试连接
mysql -u root -p -e "SELECT VERSION();"
```

---

**文档版本**：1.0
**最后更新**：2026-04-02
**维护者**：Claude Code Assistant
