-- ================================================
-- 修复优惠券表结构
-- ================================================

USE miniprogram_db;

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS coupons;

-- 创建新表
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '优惠券ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    description TEXT COMMENT '优惠券描述',
    type ENUM('fixed', 'percentage') NOT NULL COMMENT '优惠类型：固定金额/百分比',
    value DECIMAL(10, 2) NOT NULL COMMENT '优惠金额/百分比',
    min_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT '最低消费金额',
    max_discount DECIMAL(10, 2) COMMENT '最大优惠金额',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    status ENUM('unused', 'used', 'expired') DEFAULT 'unused' COMMENT '使用状态',
    used_at TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
    order_id VARCHAR(36) COMMENT '使用的订单ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    INDEX FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';
