-- ================================================
-- 微信小程序后端数据库完整Schema（已修复）
-- 数据库：miniprogram_db
-- 版本：2.0（修复版）
-- 创建时间：2026-04-03
--
-- 修复内容：
-- 1. ✅ 添加wechat_session_key字段到users表
-- 2. ✅ 重命名categories为goods_categories
-- 3. ✅ 重命名products为goods
-- 4. ✅ orders表已包含status_text和payment_method字段
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
    wechat_session_key VARCHAR(255) COMMENT '微信Session Key（用于解密手机号）',
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
-- 4. 商品分类表 (goods_categories) - 已重命名
-- ================================================
CREATE TABLE goods_categories (
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
-- 5. 商品表 (goods) - 已重命名
-- ================================================
CREATE TABLE goods (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
    category_id INT COMMENT '分类ID',
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

    FOREIGN KEY (category_id) REFERENCES goods_categories(id) ON DELETE SET NULL,
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

-- ================================================
-- 初始化数据
-- ================================================

-- 1. 初始化商品分类（使用新表名）
INSERT INTO goods_categories (name, icon, sort, is_active) VALUES
('精酿啤酒', '/images/category-beer.png', 1, TRUE),
('特色小食', '/images/category-snack.png', 2, TRUE),
('套餐组合', '/images/category-combo.png', 3, TRUE),
('饮品', '/images/category-drink.png', 4, TRUE);

-- 2. 初始化门店数据
INSERT INTO stores (name, address, phone, business_hours, latitude, longitude, features, is_active, sort) VALUES
('玲珑酒馆（中心店）', '北京市朝阳区三里屯路19号', '010-12345678', '10:00-02:00', 39.936, 116.447,
 JSON_ARRAY('堂食', '外带', '包间', '停车场', 'WiFi'), TRUE, 1),
('玲珑酒馆（海淀店）', '北京市海淀区中关村大街1号', '010-87654321', '11:00-01:00', 39.982, 116.318,
 JSON_ARRAY('堂食', '外带', 'WiFi'), TRUE, 2);

-- 3. 初始化商品数据（使用新表名）
INSERT INTO goods (category_id, name, description, price, original_price, image, stock, sales, sort, status, unit) VALUES
-- 精酿啤酒
(1, 'IPA精酿', '美式IPA，酒体饱满，苦味适中，带有柑橘香气', 48.00, 58.00, '/images/beer-ipa.png', 100, 256, 1, 'onsale', '杯'),
(1, '世涛啤酒', '黑啤，口感醇厚，带有咖啡和巧克力味', 52.00, 62.00, '/images/beer-stout.png', 80, 189, 2, 'onsale', '杯'),
(1, '小麦啤酒', '德式小麦，口感清爽，带有香蕉和丁香香气', 45.00, 55.00, '/images/beer-wheat.png', 120, 342, 3, 'onsale', '杯'),
(1, '青岛啤酒', '经典拉格，口感清爽', 28.00, 35.00, '/images/beer-tsingtao.png', 200, 567, 4, 'onsale', '杯'),
(1, '科罗娜', '墨西哥拉格，搭配青柠更佳', 38.00, 45.00, '/images/beer-corona.png', 150, 423, 5, 'onsale', '瓶'),
(1, '福佳白', '比利时小麦啤，口感柔滑', 42.00, 50.00, '/images/beer-hoegaarden.png', 90, 298, 6, 'onsale', '杯'),

-- 特色小食
(2, '炸薯条', '金黄酥脆，外酥里嫩', 22.00, 28.00, '/images/snack-fries.png', 150, 423, 1, 'onsale', '份'),
(2, '鸡翅膀', '蜜汁烤翅，香甜可口', 38.00, 48.00, '/images/snack-wings.png', 80, 267, 2, 'onsale', '份'),
(2, '花生米', '酒鬼花生，香辣开胃', 18.00, 22.00, '/images/snack-peanuts.png', 200, 689, 3, 'onsale', '份'),
(2, '烤肠', '德国烤肠，肉质鲜嫩', 25.00, 30.00, '/images/snack-sausage.png', 120, 345, 4, 'onsale', '根'),
(2, '土豆泥', '香浓土豆泥，口感细腻', 15.00, 20.00, '/images/snack-mash.png', 180, 567, 5, 'onsale', '份'),
(2, '洋葱圈', '金黄洋葱圈，香脆可口', 20.00, 25.00, '/images/snack-onion.png', 100, 234, 6, 'onsale', '份'),

-- 套餐组合
(3, '精酿三打套餐', '3款精酿啤酒+小吃组合', 128.00, 168.00, '/images/combo-three.png', 50, 134, 1, 'onsale', '套'),
(3, '竞标赛双人套餐', '4款啤酒+3份小吃+1小时游戏', 228.00, 298.00, '/images/combo-double.png', 30, 89, 2, 'onsale', '套'),
(3, '四人畅享套餐', '8款啤酒+6份小吃+2小时游戏', 398.00, 528.00, '/images/combo-four.png', 20, 56, 3, 'onsale', '套'),

-- 饮品
(4, '可乐', '冰爽可乐', 12.00, 15.00, '/images/drink-cola.png', 300, 823, 1, 'onsale', '杯'),
(4, '橙汁', '鲜榨橙汁', 18.00, 22.00, '/images/drink-orange.png', 150, 456, 2, 'onsale', '杯'),
(4, '苏打水', '柠檬苏打水', 10.00, 12.00, '/images/drink-soda.png', 200, 634, 3, 'onsale', '瓶'),
(4, '咖啡', '现磨美式咖啡', 22.00, 28.00, '/images/drink-coffee.png', 100, 234, 4, 'onsale', '杯');

-- 4. 初始化积分商品
INSERT INTO points_goods (name, description, points, stock, image, is_active, sort) VALUES
('玲珑币-100积分', '使用玲珑币可到桌子参与竞技运动游戏', 100, 99999, '/images/coin-100.png', TRUE, 1),
('玲珑币-500积分', '使用玲珑币可到桌子参与竞技运动游戏', 500, 99999, '/images/coin-500.png', TRUE, 2),
('玲珑币-1000积分', '使用玲珑币可到桌子参与竞技运动游戏', 1000, 99999, '/images/coin-1000.png', TRUE, 3),
('玲珑币-3000积分', '使用玲珑币可到桌子参与竞技运动游戏', 3000, 99999, '/images/coin-3000.png', TRUE, 4),
('生日优惠券-50元', '生日专享50元无门槛优惠券', 500, 1000, '/images/coupon-birthday.png', TRUE, 5);

-- 5. 初始化协议文档
INSERT INTO protocols (type, title, content, version, is_active, effective_date) VALUES
('recharge', '储值协议',
'欢迎使用玲珑酒馆储值服务！本协议是您与玲珑酒馆之间就储值服务所订立的协议。
1. 储值说明
2. 使用规则
3. 退款政策
4. 其他条款',
'1.0', TRUE, CURDATE()),

('privacy', '隐私政策',
'玲珑酒馆重视用户隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。
1. 信息收集
2. 信息使用
3. 信息存储
4. 信息保护',
'1.0', TRUE, CURDATE()),

('service', '服务条款',
'欢迎使用玲珑酒馆微信小程序！
1. 服务说明
2. 用户权利
3. 平台义务
4. 免责声明',
'1.0', TRUE, CURDATE()),

('member', '会员协议',
'玲珑酒馆会员服务协议
1. 会员等级
2. 积分规则
3. 优惠权益
4. 其他条款',
'1.0', TRUE, CURDATE());

-- 6. 创建测试用户（可选，用于开发测试）
-- 注意：生产环境应删除或注释此部分

-- 测试用户1：手机号登录
INSERT INTO users (id, phone, nickname, gender, city, is_active) VALUES
('test-user-001', '13800000001', '测试用户001', 'male', '北京', TRUE);

INSERT INTO members (id, user_id, balance, points, coupons, level) VALUES
('member-001', 'test-user-001', 1000.00, 500, 3, 2);

-- 测试用户2：微信登录
INSERT INTO users (id, wechat_openid, nickname, gender, is_active) VALUES
('test-user-002', 'wx_openid_001', '微信用户001', 'female', TRUE);

INSERT INTO members (id, user_id, balance, points, coupons, level) VALUES
('member-002', 'test-user-002', 500.00, 200, 1, 1);

-- 7. 创建测试订单（可选）
INSERT INTO orders (id, order_no, user_id, order_type, total_amount, actual_amount, status, status_text) VALUES
('order-001', 'DD20260402001', 'test-user-001', 'dian', 118.00, 118.00, 'completed', '已完成'),
('order-002', 'DD20260402002', 'test-user-001', 'dian', 158.00, 158.00, 'paid', '待使用');

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
('order-001', 1, 'IPA精酿', 48.00, 2, 96.00),
('order-001', 7, '炸薯条', 22.00, 1, 22.00),
('order-002', 2, '世涛啤酒', 52.00, 3, 156.00),
('order-002', 9, '鸡翅膀', 38.00, 1, 38.00);

-- 8. 创建测试记录（可选）
INSERT INTO balance_records (id, user_id, type, amount, balance, description) VALUES
('br-001', 'test-user-001', 'recharge', 1000.00, 1000.00, '初始充值'),
('br-002', 'test-user-001', 'consumption', -118.00, 882.00, '订单消费');

INSERT INTO points_records (id, user_id, type, amount, balance, description) VALUES
('pr-001', 'test-user-001', 'earn', 500, 500, '注册赠送积分');

-- ================================================
-- 9. 创建辅助视图
-- ================================================

-- 创建订单详情视图（包含items）
CREATE OR REPLACE VIEW v_orders_with_items AS
SELECT
  o.id,
  o.order_no,
  o.user_id,
  o.store_id,
  o.order_type,
  o.total_amount,
  o.discount_amount,
  o.actual_amount,
  o.status,
  o.status_text,
  o.payment_method,
  o.payment_time,
  o.remark,
  o.paid_at,
  o.used_at,
  o.completed_at,
  o.cancelled_at,
  o.refunded_at,
  o.created_at,
  o.updated_at,
  COUNT(oi.id) as item_count,
  SUM(oi.subtotal) as items_total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- ================================================
-- 10. 显示完成信息
-- ================================================
SELECT '========================================' AS '';
SELECT '✅ 数据库Schema创建完成！' AS '';
SELECT '========================================' AS '';
SELECT '版本：2.0（修复版）' AS '';
SELECT '修复内容：' AS '';
SELECT '1. ✅ 添加wechat_session_key字段' AS '';
SELECT '2. ✅ 重命名categories -> goods_categories' AS '';
SELECT '3. ✅ 重命名products -> goods' AS '';
SELECT '4. ✅ orders表包含status_text和payment_method' AS '';
SELECT '5. ✅ 创建订单详情视图' AS '';
SELECT '========================================' AS '';
SELECT '统计信息：' AS '';
SELECT CONCAT('商品分类: ', COUNT(*)) AS '' FROM goods_categories;
SELECT CONCAT('商品数量: ', COUNT(*)) AS '' FROM goods;
SELECT CONCAT('门店数量: ', COUNT(*)) AS '' FROM stores;
SELECT CONCAT('积分商品: ', COUNT(*)) AS '' FROM points_goods;
SELECT CONCAT('测试用户: ', COUNT(*)) AS '' FROM users WHERE phone LIKE '138%';
SELECT '========================================' AS '';