-- ================================================
-- 修复 users 表 avatar 列长度问题
-- 将 VARCHAR(255) 改为 TEXT 类型以支持 Base64 图片数据
-- ================================================

USE miniprogram_db;

-- 修改 avatar 列为 TEXT 类型
ALTER TABLE users
MODIFY COLUMN avatar TEXT COMMENT '头像URL或Base64数据';

-- 验证修改结果
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'miniprogram_db'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'avatar';

-- 查看当前表结构（可选）
-- DESCRIBE users;
