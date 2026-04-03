-- ================================================
-- 微信小程序数据库初始化数据
-- 数据库：miniprogram_db
-- ================================================

USE miniprogram_db;

-- ================================================
-- 1. 初始化商品分类
-- ================================================
INSERT INTO categories (name, icon, sort, is_active) VALUES
('精酿啤酒', '/images/category-beer.png', 1, TRUE),
('特色小食', '/images/category-snack.png', 2, TRUE),
('套餐组合', '/images/category-combo.png', 3, TRUE),
('饮品', '/images/category-drink.png', 4, TRUE);

-- ================================================
-- 2. 初始化门店数据
-- ================================================
INSERT INTO stores (name, address, phone, business_hours, latitude, longitude, features, is_active, sort) VALUES
('玲珑酒馆（中心店）', '北京市朝阳区三里屯路19号', '010-12345678', '10:00-02:00', 39.936, 116.447,
 JSON_ARRAY('堂食', '外带', '包间', '停车场', 'WiFi'), TRUE, 1),
('玲珑酒馆（海淀店）', '北京市海淀区中关村大街1号', '010-87654321', '11:00-01:00', 39.982, 116.318,
 JSON_ARRAY('堂食', '外带', 'WiFi'), TRUE, 2);

-- ================================================
-- 3. 初始化商品数据
-- ================================================
INSERT INTO products (category_id, name, description, price, original_price, image, stock, sales, sort, status, unit) VALUES
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

-- ================================================
-- 4. 初始化积分商品
-- ================================================
INSERT INTO points_goods (name, description, points, stock, image, is_active, sort) VALUES
('玲珑币-100积分', '使用玲珑币可到桌子参与竞技运动游戏', 100, 99999, '/images/coin-100.png', TRUE, 1),
('玲珑币-500积分', '使用玲珑币可到桌子参与竞技运动游戏', 500, 99999, '/images/coin-500.png', TRUE, 2),
('玲珑币-1000积分', '使用玲珑币可到桌子参与竞技运动游戏', 1000, 99999, '/images/coin-1000.png', TRUE, 3),
('玲珑币-3000积分', '使用玲珑币可到桌子参与竞技运动游戏', 3000, 99999, '/images/coin-3000.png', TRUE, 4),
('生日优惠券-50元', '生日专享50元无门槛优惠券', 500, 1000, '/images/coupon-birthday.png', TRUE, 5);

-- ================================================
-- 5. 初始化协议文档
-- ================================================
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

-- ================================================
-- 6. 创建测试用户（可选，用于开发测试）
-- ================================================
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

-- ================================================
-- 7. 创建测试订单（可选）
-- ================================================
INSERT INTO orders (id, order_no, user_id, order_type, total_amount, actual_amount, status, status_text) VALUES
('order-001', 'DD20260402001', 'test-user-001', 'dian', 118.00, 118.00, 'completed', '已完成'),
('order-002', 'DD20260402002', 'test-user-001', 'dian', 158.00, 158.00, 'paid', '待使用');

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
('order-001', 1, 'IPA精酿', 48.00, 2, 96.00),
('order-001', 7, '炸薯条', 22.00, 1, 22.00),
('order-002', 2, '世涛啤酒', 52.00, 3, 156.00),
('order-002', 9, '鸡翅膀', 38.00, 1, 38.00);

-- ================================================
-- 8. 创建测试记录（可选）
-- ================================================
INSERT INTO balance_records (id, user_id, type, amount, balance, description) VALUES
('br-001', 'test-user-001', 'recharge', 1000.00, 1000.00, '初始充值'),
('br-002', 'test-user-001', 'consumption', -118.00, 882.00, '订单消费');

INSERT INTO points_records (id, user_id, type, amount, balance, description) VALUES
('pr-001', 'test-user-001', 'earn', 500, 500, '注册赠送积分');

-- ================================================
-- 9. 显示初始化完成信息
-- ================================================
SELECT '========================================' AS '';
SELECT '数据库初始化完成！' AS '';
SELECT '========================================' AS '';
SELECT '统计信息：' AS '';
SELECT CONCAT('商品分类: ', COUNT(*)) AS '' FROM categories;
SELECT CONCAT('商品数量: ', COUNT(*)) AS '' FROM products;
SELECT CONCAT('门店数量: ', COUNT(*)) AS '' FROM stores;
SELECT CONCAT('积分商品: ', COUNT(*)) AS '' FROM points_goods;
SELECT CONCAT('测试用户: ', COUNT(*)) AS '' FROM users WHERE phone LIKE '138%';
SELECT '========================================' AS '';
