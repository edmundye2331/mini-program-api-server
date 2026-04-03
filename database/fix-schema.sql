-- ==========================================
-- MySQL Schema修复脚本
-- 修复与后端代码不匹配的问题
-- ==========================================

USE miniprogram_db;

-- ==========================================
-- 1. 添加缺失字段
-- ==========================================

-- 添加wechat_session_key到users表
ALTER TABLE users
ADD COLUMN wechat_session_key VARCHAR(255) COMMENT '微信Session Key（用于解密手机号）'
AFTER wechat_unionid;

-- 添加status_text到orders表
ALTER TABLE orders
ADD COLUMN status_text VARCHAR(50) COMMENT '状态文本'
AFTER status;

-- 添加discount_amount到orders表（后端未使用但schema有）
-- ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- 添加actual_amount到orders表（后端未使用但schema有）
-- ALTER TABLE orders ADD COLUMN actual_amount DECIMAL(10,2) AFTER total_amount;

-- 添加payment_method到orders表
ALTER TABLE orders
ADD COLUMN payment_method ENUM('wechat', 'alipay', 'balance', 'points') COMMENT '支付方式'
AFTER cancelled_at;

-- ==========================================
-- 2. 重命名表以匹配后端代码
-- ==========================================

-- 重命名categories为goods_categories
RENAME TABLE categories TO goods_categories;

-- 重命名products为goods
RENAME TABLE products TO goods;

-- 更新外键约束
ALTER TABLE goods
ADD FOREIGN KEY (category_id) REFERENCES goods_categories(id) ON DELETE SET NULL;

-- ==========================================
-- 3. 修改字段名以匹配后端命名习惯
-- ==========================================

-- orders表：将snake_case改为camelCase（可选，这里保持snake_case）
-- 已在schema中定义，无需修改

-- ==========================================
-- 4. 添加缺失的索引
-- ==========================================

-- 为常用查询添加索引
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD INDEX idx_wechat_openid (wechat_openid);

ALTER TABLE orders ADD INDEX idx_user_id (user_id);
ALTER TABLE orders ADD INDEX idx_status (status);
ALTER TABLE orders ADD INDEX idx_created_at (created_at);

ALTER TABLE goods ADD INDEX idx_category_id (category_id);
ALTER TABLE goods ADD INDEX idx_status (status);

-- ==========================================
-- 5. 修改 carts 表以支持JSON数据
-- ==========================================

-- 确保carts表的items字段类型正确
ALTER TABLE carts MODIFY COLUMN items JSON NOT NULL COMMENT '购物车商品（JSON数组）';

-- ==========================================
-- 6. 创建视图以简化查询
-- ==========================================

-- 创建订单详情视图（包含items）
CREATE OR REPLACE VIEW v_orders_with_items AS
SELECT
  o.id,
  o.order_no,
  o.user_id,
  o.order_type,
  o.total_amount,
  o.status,
  o.status_text,
  o.remark,
  o.paid_at,
  o.completed_at,
  o.cancelled_at,
  o.created_at,
  o.updated_at,
  COUNT(oi.id) as item_count,
  SUM(oi.subtotal) as items_total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- ==========================================
-- 7. 数据验证
-- ==========================================

-- 显示修复后的表结构
SELECT 'users表结构:' AS '';
DESCRIBE users;

SELECT 'orders表结构:' AS '';
DESCRIBE orders;

SELECT 'goods_categories表结构:' AS '';
DESCRIBE goods_categories;

SELECT 'goods表结构:' AS '';
DESCRIBE goods;

-- 显示所有表
SELECT '所有表:' AS '';
SHOW TABLES;

-- ==========================================
-- 8. 完成
-- ==========================================

SELECT '========================================' AS '';
SELECT 'Schema修复完成！' AS '';
SELECT '========================================' AS '';
SELECT '修复内容:' AS '';
SELECT '1. ✅ 添加wechat_session_key字段' AS '';
SELECT '2. ✅ 添加status_text字段' AS '';
SELECT '3. ✅ 重命名categories -> goods_categories' AS '';
SELECT '4. ✅ 重命名products -> goods' AS '';
SELECT '5. ✅ 添加必要的索引' AS '';
SELECT '6. ✅ 创建订单详情视图' AS '';
SELECT '========================================' AS '';
