-- ================================================
-- 修复 users 表 avatar 列长度问题 v2
-- 将 TEXT 改为 MEDIUMTEXT 类型支持大图片
-- ================================================

USE miniprogram_db;

-- 修改 avatar 列为 MEDIUMTEXT 类型
ALTER TABLE users
MODIFY COLUMN avatar MEDIUMTEXT COMMENT '头像URL或Base64数据';

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
