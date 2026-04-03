# MySQL数据库快速启动指南

## ⚡ 5分钟快速开始

### 步骤1: 安装MySQL（如果还没有）

```bash
# macOS
brew install mysql
brew services start mysql

# Linux
sudo apt install mysql-server
sudo systemctl start mysql
```

### 步骤2: 创建数据库

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE IF NOT EXISTS miniprogram_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

# 退出
EXIT;
```

### 步骤3: 导入Schema和数据

```bash
cd /Users/bigdata/miniprogram-api-server

# 导入表结构
mysql -u root -p miniprogram_db < database/schema.sql

# 导入初始数据
mysql -u root -p miniprogram_db < database/init-data.sql
```

### 步骤4: 配置环境变量

```bash
# 复制配置文件
cp .env.example .env

# 编辑配置（使用nano或vim）
nano .env
```

修改以下配置：
```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=miniprogram_db
```

### 步骤5: 启动服务器

```bash
npm install
npm start
```

看到以下输出表示成功：
```
✅ MySQL数据库连接成功
服务器运行在 http://localhost:3000
```

---

## 🧪 快速测试

### 测试数据库连接
```bash
mysql -u root -p -e "USE miniprogram_db; SHOW TABLES;"
```

应该看到18张表。

### 测试API
```bash
# 获取商品分类
curl http://localhost:3000/api/goods/categories

# 获取门店列表
curl http://localhost:3000/api/stores

# 获取积分商品
curl http://localhost:3000/api/points/goods
```

---

## 📝 下一步

- 阅读完整的迁移指南: [DATABASE-MIGRATION.md](./DATABASE-MIGRATION.md)
- 查看数据库设计: [`../database/schema.sql`](../database/schema.sql)
- 测试数据库操作: [`../utils/mysql.js`](../utils/mysql.js)
