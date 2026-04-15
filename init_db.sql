-- 微信小程序后端数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS miniprogram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE miniprogram_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '用户ID',
  phone VARCHAR(11) COMMENT '手机号',
  password TEXT COMMENT '密码（加密后）',
  avatar TEXT COMMENT '头像地址',
  nickname VARCHAR(50) COMMENT '昵称',
  gender VARCHAR(10) COMMENT '性别',
  birthday VARCHAR(20) COMMENT '生日',
  city VARCHAR(50) COMMENT '城市',
  province VARCHAR(50) COMMENT '省份',
  country VARCHAR(50) COMMENT '国家',
  wechat_openid VARCHAR(255) COMMENT '微信openid',
  wechat_session_key TEXT COMMENT '微信session_key',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 会员表
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  balance DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '余额',
  points INT NOT NULL DEFAULT 0 COMMENT '积分',
  coupons INT NOT NULL DEFAULT 0 COMMENT '优惠券数量',
  level INT NOT NULL DEFAULT 1 COMMENT '会员等级',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  UNIQUE KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员表';

-- 商品分类表
CREATE TABLE IF NOT EXISTS goods_categories (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS goods (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  category_id INT NOT NULL COMMENT '分类ID',
  name VARCHAR(100) NOT NULL COMMENT '商品名称',
  price DECIMAL(10,2) NOT NULL COMMENT '商品价格',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存',
  image TEXT COMMENT '商品图片',
  description TEXT COMMENT '商品描述',
  status VARCHAR(20) NOT NULL DEFAULT 'onsale' COMMENT '商品状态: onsale(上架), offsale(下架)',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 购物车表
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  items JSON NOT NULL COMMENT '购物车商品',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  UNIQUE KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '订单ID',
  order_no VARCHAR(50) NOT NULL COMMENT '订单号',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  order_type VARCHAR(20) NOT NULL COMMENT '订单类型',
  items JSON NOT NULL COMMENT '订单商品',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态: pending(待付款), paid(待使用), using(使用中), completed(已完成), cancelled(已取消), refunded(已退款)',
  status_text VARCHAR(50) NOT NULL COMMENT '订单状态文本',
  payment_method VARCHAR(20) COMMENT '支付方式',
  paid_at DATETIME COMMENT '支付时间',
  remark TEXT COMMENT '订单备注',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 充值记录表
CREATE TABLE IF NOT EXISTS recharge_records (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
  bonus_amount DECIMAL(10,2) NOT NULL DEFAULT '0.00' COMMENT '赠送金额',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '总到账金额',
  balance_before DECIMAL(10,2) NOT NULL COMMENT '充值前余额',
  balance_after DECIMAL(10,2) NOT NULL COMMENT '充值后余额',
  status VARCHAR(20) NOT NULL DEFAULT 'success' COMMENT '充值状态',
  created_at DATETIME NOT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值记录表';

-- 余额变动记录表
CREATE TABLE IF NOT EXISTS balance_records (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  type VARCHAR(20) NOT NULL COMMENT '变动类型: recharge(充值), consume(消费)',
  amount DECIMAL(10,2) NOT NULL COMMENT '变动金额',
  balance DECIMAL(10,2) NOT NULL COMMENT '变动后余额',
  description TEXT COMMENT '变动描述',
  created_at DATETIME NOT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='余额变动记录表';

-- 积分商城商品表
CREATE TABLE IF NOT EXISTS points_goods (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '商品名称',
  points INT NOT NULL COMMENT '所需积分',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存',
  image TEXT COMMENT '商品图片',
  description TEXT COMMENT '商品描述',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分商城商品表';

-- 积分记录表
CREATE TABLE IF NOT EXISTS points_records (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  type VARCHAR(20) NOT NULL COMMENT '变动类型: exchange(兑换), sign(签到), activity(活动)',
  amount INT NOT NULL COMMENT '变动积分',
  balance INT NOT NULL COMMENT '变动后积分',
  description TEXT COMMENT '变动描述',
  created_at DATETIME NOT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分记录表';

-- 兑换记录表
CREATE TABLE IF NOT EXISTS exchange_records (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  goods_id INT NOT NULL COMMENT '商品ID',
  goods_name VARCHAR(100) NOT NULL COMMENT '商品名称',
  points INT NOT NULL COMMENT '消耗积分',
  status VARCHAR(20) NOT NULL DEFAULT 'success' COMMENT '兑换状态',
  created_at DATETIME NOT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='兑换记录表';

-- 生日礼表
CREATE TABLE IF NOT EXISTS birthday_gifts (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  gift_name VARCHAR(100) NOT NULL COMMENT '礼品名称',
  gift_description TEXT COMMENT '礼品描述',
  gift_value INT NOT NULL COMMENT '礼品价值',
  gift_image TEXT COMMENT '礼品图片',
  is_claimed TINYINT NOT NULL DEFAULT 0 COMMENT '是否已领取: 0未领取, 1已领取',
  claimed_at DATETIME COMMENT '领取时间',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  UNIQUE KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生日礼表';

-- 优惠券表
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id VARCHAR(32) COMMENT '用户ID',
  name VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  type VARCHAR(20) NOT NULL COMMENT '优惠券类型: discount(满减), reduction(立减)',
  condition_amount DECIMAL(10,2) COMMENT '满减条件',
  reduce_amount DECIMAL(10,2) COMMENT '减免金额',
  discount_rate DECIMAL(5,2) COMMENT '折扣率',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME NOT NULL COMMENT '结束时间',
  status VARCHAR(20) NOT NULL DEFAULT 'unused' COMMENT '优惠券状态: unused(未使用), used(已使用), expired(已过期)',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- 门店表
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '门店名称',
  address TEXT NOT NULL COMMENT '门店地址',
  phone VARCHAR(20) COMMENT '联系电话',
  latitude DECIMAL(10,8) COMMENT '纬度',
  longitude DECIMAL(11,8) COMMENT '经度',
  business_hours TEXT COMMENT '营业时间',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店表';

-- 协议表
CREATE TABLE IF NOT EXISTS protocols (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  type VARCHAR(50) NOT NULL COMMENT '协议类型: user(用户协议), privacy(隐私政策)',
  title VARCHAR(100) NOT NULL COMMENT '协议标题',
  content TEXT NOT NULL COMMENT '协议内容',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  UNIQUE KEY idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='协议表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '日志ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  login_type VARCHAR(20) NOT NULL COMMENT '登录类型: phone(手机号), wechat(微信)',
  login_time DATETIME NOT NULL COMMENT '登录时间',
  ip VARCHAR(50) COMMENT '登录IP',
  device VARCHAR(50) COMMENT '登录设备',
  created_at DATETIME NOT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';

-- 密码修改历史表
CREATE TABLE IF NOT EXISTS password_history (
  id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  changed_at DATETIME NOT NULL COMMENT '修改时间',
  ip VARCHAR(50) COMMENT '修改IP',
  created_at DATETIME NOT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='密码修改历史表';