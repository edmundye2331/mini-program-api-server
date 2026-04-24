-- ================================================
-- 初始化优惠券数据
-- ================================================

USE miniprogram_db;

-- 插入优惠券数据
-- 注意：这些是示例数据，实际应用中应根据业务需求生成

-- 1. 新用户注册礼券（固定金额）
INSERT INTO coupons (user_id, name, description, type, value, min_amount, start_date, end_date, status) VALUES
-- 新用户礼券，每个用户注册时需要动态生成，这里只是模板数据
-- ('user_id_here', '新用户专享', '欢迎加入玲珑酒馆！', 'fixed', 20.00, 0.00,
--  CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'unused');

-- 2. 满减优惠券（无门槛）
INSERT INTO coupons (user_id, name, description, type, value, min_amount, start_date, end_date, status) VALUES
-- 满100减20
-- ('user_id_here', '满100减20', '满100元减20元优惠券', 'fixed', 20.00, 100.00,
--  CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'unused'),
-- 满200减50
-- ('user_id_here', '满200减50', '满200元减50元优惠券', 'fixed', 50.00, 200.00,
--  CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'unused');

-- 3. 折扣优惠券（百分比）
INSERT INTO coupons (user_id, name, description, type, value, min_amount, start_date, end_date, status) VALUES
-- 8折优惠券
-- ('user_id_here', '全场8折', '全场通用，最高减50元', 'percentage', 0.80, 50.00,
--  CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'unused'),
-- 9折优惠券
-- ('user_id_here', '全场9折', '全场通用，最高减100元', 'percentage', 0.90, 100.00,
--  CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'unused');

-- 4. 生日专享券
INSERT INTO coupons (user_id, name, description, type, value, min_amount, max_discount, start_date, end_date, status) VALUES
-- ('user_id_here', '生日专享券', '生日当月可使用，满100减50', 'fixed', 50.00, 100.00, 50.00,
--  DATE_FORMAT(CURDATE(), '%Y-%m-01'), DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 7 DAY), 'unused');

-- 注意：实际使用时需要将 user_id 替换为实际的用户ID
-- 可以通过以下方式为特定用户生成优惠券：
-- INSERT INTO coupons (user_id, name, description, type, value, min_amount, start_date, end_date, status) VALUES
-- ('actual_user_id', '会员专享', '会员用户专享福利', 'fixed', 30.00, 100.00,
--  CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'unused');
