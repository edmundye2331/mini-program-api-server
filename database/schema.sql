-- ================================================
-- 微信小程序后端数据库Schema
-- 数据库：miniprogram_db
-- 版本：1.0
-- 创建时间：2026-04-02
-- ================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS miniprogram_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE miniprogram_db;

-- ================================================
-- 1. 用户表 (users)
-- ================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY COMMENT '用户ID（UUID）',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    wechat_openid VARCHAR(100) UNIQUE COMMENT '微信OpenID',
    wechat_unionid VARCHAR(100) COMMENT '微信UnionID',
    avatar VARCHAR(255) DEFAULT '/images/avatar.png' COMMENT '头像URL',
    nickname VARCHAR(100) COMMENT '昵称',
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown' COMMENT '性别',
    birthday DATE COMMENT '生日',
    city VARCHAR(100) COMMENT '城市',
    province VARCHAR(100) COMMENT '省份',
    country VARCHAR(100) DEFAULT '中国' COMMENT '国家',
    password_hash VARCHAR(255) COMMENT '密码哈希（bcrypt）',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否已注销（软删除）',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_phone (phone),
    INDEX idx_wechat_openid (wechat_openid),
    INDEX idx_wechat_unionid (wechat_unionid),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ================================================
-- 2. 会员表 (members)
-- ================================================
CREATE TABLE members (
    id VARCHAR(36) PRIMARY KEY COMMENT '会员ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',
    points INT DEFAULT 0 COMMENT '积分',
    coupons INT DEFAULT 0 COMMENT '优惠券数量',
    level INT DEFAULT 1 COMMENT '会员等级（1-5）',
    total_recharge DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计充值金额',
    total_consumption DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计消费金额',
    total_orders INT DEFAULT 0 COMMENT '累计订单数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_level (level),
    INDEX idx_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

-- ================================================
-- 3. 门店表 (stores)
-- ================================================
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '门店ID',
    name VARCHAR(200) NOT NULL COMMENT '门店名称',
    address VARCHAR(500) NOT NULL COMMENT '门店地址',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    business_hours VARCHAR(50) NOT NULL COMMENT '营业时间',
    latitude DECIMAL(10,6) NOT NULL COMMENT '纬度',
    longitude DECIMAL(10,6) NOT NULL COMMENT '经度',
    features JSON COMMENT '特色服务（数组）',
    images JSON COMMENT '门店图片（数组）',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否营业',
    sort INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_is_active (is_active),
    INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='门店表';

-- ================================================
-- 4. 商品分类表 (categories)
-- ================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    icon VARCHAR(255) COMMENT '图标URL',
    sort INT DEFAULT 0 COMMENT '排序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_sort (sort),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ================================================
-- 5. 商品表 (products)
-- ================================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
    category_id INT NOT NULL COMMENT '分类ID',
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    description TEXT COMMENT '商品描述',
    price DECIMAL(10,2) NOT NULL COMMENT '现价',
    original_price DECIMAL(10,2) COMMENT '原价',
    image VARCHAR(255) COMMENT '图片URL',
    images JSON COMMENT '商品图片组（数组）',
    stock INT DEFAULT 0 COMMENT '库存数量',
    sales INT DEFAULT 0 COMMENT '销量',
    sort INT DEFAULT 0 COMMENT '排序',
    status ENUM('onsale', 'offline', 'out_of_stock') DEFAULT 'onsale' COMMENT '商品状态',
    unit VARCHAR(20) DEFAULT '份' COMMENT '单位',
    tags JSON COMMENT '标签（数组）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_sort (sort),
    INDEX idx_sales (sales)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ================================================
-- 6. 订单主表 (orders)
-- ================================================
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY COMMENT '订单ID（UUID）',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号（业务编号）',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    store_id INT COMMENT '门店ID',
    order_type ENUM('dian', 'shang', 'hui', 'pin', 'li') NOT NULL COMMENT '订单类型：点单/商城/会员/拼团/礼品卡',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    discount_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
    actual_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    status ENUM('pending', 'paid', 'using', 'completed', 'cancelled', 'refunded') DEFAULT 'pending' COMMENT '订单状态',
    status_text VARCHAR(50) COMMENT '状态文本',
    payment_method ENUM('wechat', 'alipay', 'balance', 'points') COMMENT '支付方式',
    payment_time TIMESTAMP NULL COMMENT '支付时间',
    remark TEXT COMMENT '订单备注',
    paid_at TIMESTAMP NULL COMMENT '支付完成时间',
    used_at TIMESTAMP NULL COMMENT '使用时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    cancelled_at TIMESTAMP NULL COMMENT '取消时间',
    refunded_at TIMESTAMP NULL COMMENT '退款时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL,
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_store_id (store_id),
    INDEX idx_order_type (order_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单主表';

-- ================================================
-- 7. 订单项表 (order_items)
-- ================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单项ID',
    order_id VARCHAR(36) NOT NULL COMMENT '订单ID',
    product_id INT COMMENT '商品ID',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称（快照）',
    product_image VARCHAR(255) COMMENT '商品图片（快照）',
    product_price DECIMAL(10,2) NOT NULL COMMENT '商品单价（快照）',
    quantity INT NOT NULL COMMENT '数量',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小计',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单项表';

-- ================================================
-- 8. 优惠券表 (coupons)
-- ================================================
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '优惠券ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    description TEXT COMMENT '优惠券描述',
    type ENUM('fixed', 'percentage') NOT NULL COMMENT '优惠类型：固定金额/百分比',
    value DECIMAL(10,2) NOT NULL COMMENT '优惠金额/百分比',
    min_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '最低消费金额',
    max_discount DECIMAL(10,2) COMMENT '最大优惠金额',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    status ENUM('unused', 'used', 'expired') DEFAULT 'unused' COMMENT '使用状态',
    used_at TIMESTAMP NULL COMMENT '使用时间',
    order_id VARCHAR(36) COMMENT '使用的订单ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_date_range (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- ================================================
-- 9. 积分商品表 (points_goods)
-- ================================================
CREATE TABLE points_goods (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '积分商品ID',
    name VARCHAR(100) NOT NULL COMMENT '商品名称',
    description TEXT COMMENT '商品描述',
    points INT NOT NULL COMMENT '所需积分',
    stock INT DEFAULT 99999 COMMENT '库存数量',
    image VARCHAR(255) COMMENT '图片URL',
    images JSON COMMENT '商品图片组（数组）',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    sort INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_is_active (is_active),
    INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分商品表';

-- ================================================
-- 10. 积分记录表 (points_records)
-- ================================================
CREATE TABLE points_records (
    id VARCHAR(36) PRIMARY KEY COMMENT '积分记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    type ENUM('earn', 'spend', 'birthday', 'purchase', 'refund', 'system') NOT NULL COMMENT '类型',
    amount INT NOT NULL COMMENT '积分变化量（正数=增加，负数=减少）',
    balance INT NOT NULL COMMENT '变化后余额',
    description VARCHAR(500) NOT NULL COMMENT '描述',
    related_order_id VARCHAR(36) COMMENT '关联订单ID',
    related_goods_id INT COMMENT '关联商品ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';

-- ================================================
-- 11. 积分兑换记录表 (exchange_records)
-- ================================================
CREATE TABLE exchange_records (
    id VARCHAR(36) PRIMARY KEY COMMENT '兑换记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    goods_id INT NOT NULL COMMENT '积分商品ID',
    goods_name VARCHAR(200) NOT NULL COMMENT '商品名称（快照）',
    points INT NOT NULL COMMENT '消耗积分',
    status ENUM('success', 'failed', 'pending') DEFAULT 'success' COMMENT '状态',
    redemption_code VARCHAR(50) COMMENT '兑换码',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goods_id) REFERENCES points_goods(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_goods_id (goods_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分兑换记录表';

-- ================================================
-- 12. 充值记录表 (recharge_records)
-- ================================================
CREATE TABLE recharge_records (
    id VARCHAR(36) PRIMARY KEY COMMENT '充值记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
    bonus_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '赠送金额',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '到账总额',
    balance_before DECIMAL(10,2) NOT NULL COMMENT '充值前余额',
    balance_after DECIMAL(10,2) NOT NULL COMMENT '充值后余额',
    payment_method ENUM('wechat', 'alipay', 'card', 'balance') NOT NULL COMMENT '支付方式',
    transaction_id VARCHAR(100) COMMENT '第三方交易流水号',
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending' COMMENT '状态',
    paid_at TIMESTAMP NULL COMMENT '支付完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='充值记录表';

-- ================================================
-- 13. 余额记录表 (balance_records)
-- ================================================
CREATE TABLE balance_records (
    id VARCHAR(36) PRIMARY KEY COMMENT '余额记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    type ENUM('recharge', 'consumption', 'refund', 'bonus', 'withdraw') NOT NULL COMMENT '类型',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额（正数=增加，负数=减少）',
    balance DECIMAL(10,2) NOT NULL COMMENT '变化后余额',
    description VARCHAR(500) NOT NULL COMMENT '描述',
    related_order_id VARCHAR(36) COMMENT '关联订单ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='余额记录表';

-- ================================================
-- 14. 生日礼表 (birthday_gifts)
-- ================================================
CREATE TABLE birthday_gifts (
    id VARCHAR(36) PRIMARY KEY COMMENT '生日礼ID',
    user_id VARCHAR(36) NOT NULL UNIQUE COMMENT '用户ID',
    year INT NOT NULL COMMENT '年份',
    is_claimed BOOLEAN DEFAULT FALSE COMMENT '是否已领取',
    gift_name VARCHAR(100) NOT NULL COMMENT '礼品名称',
    gift_description TEXT COMMENT '礼品描述',
    gift_value DECIMAL(10,2) NOT NULL COMMENT '礼品价值（积分或金额）',
    gift_type ENUM('points', 'balance', 'coupon') DEFAULT 'points' COMMENT '礼品类型',
    gift_image VARCHAR(255) COMMENT '礼品图片',
    claimed_at TIMESTAMP NULL COMMENT '领取时间',
    expires_at TIMESTAMP NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_year (year),
    INDEX idx_is_claimed (is_claimed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生日礼表';

-- ================================================
-- 15. 购物车表 (carts)
-- ================================================
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY COMMENT '购物车ID',
    user_id VARCHAR(36) NOT NULL UNIQUE COMMENT '用户ID',
    items JSON NOT NULL COMMENT '购物车商品（JSON数组）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ================================================
-- 16. 登录日志表 (login_logs)
-- ================================================
CREATE TABLE login_logs (
    id VARCHAR(36) PRIMARY KEY COMMENT '日志ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    login_type ENUM('phone', 'wechat') NOT NULL COMMENT '登录类型',
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    ip VARCHAR(45) COMMENT 'IP地址',
    device VARCHAR(100) COMMENT '设备信息',
    user_agent TEXT COMMENT '浏览器信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- ================================================
-- 17. 密码历史表 (password_history)
-- ================================================
CREATE TABLE password_history (
    id VARCHAR(36) PRIMARY KEY COMMENT '历史ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
    ip VARCHAR(45) COMMENT '修改IP',
    user_agent TEXT COMMENT '浏览器信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='密码历史表';

-- ================================================
-- 18. 协议表 (protocols)
-- ================================================
CREATE TABLE protocols (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '协议ID',
    type ENUM('recharge', 'privacy', 'service', 'member') NOT NULL COMMENT '协议类型',
    title VARCHAR(200) NOT NULL COMMENT '协议标题',
    content TEXT NOT NULL COMMENT '协议内容',
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    effective_date DATE COMMENT '生效日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    UNIQUE KEY uk_type_version (type, version),
    INDEX idx_type (type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='协议表';
