-- 插入积分兑换记录测试数据
-- 针对用户 wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco

USE miniprogram_db;

-- 插入兑换记录
INSERT INTO exchange_records (id, user_id, goods_id, goods_name, points, status, redemption_code, created_at)
VALUES
  (
    '1',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    1,
    '玲珑币',
    100,
    'success',
    'CODE1001',
    '2026-04-18 10:30:00'
  ),
  (
    '2',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    1,
    '玲珑币',
    500,
    'success',
    'CODE1002',
    '2026-04-15 14:20:00'
  ),
  (
    '3',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    1,
    '玲珑币',
    1000,
    'pending',
    'CODE1003',
    '2026-04-10 09:15:00'
  ),
  (
    '4',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    1,
    '玲珑币',
    100,
    'failed',
    'CODE1004',
    '2026-04-05 16:45:00'
  ),
  (
    '5',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    1,
    '玲珑币',
    3000,
    'success',
    'CODE1005',
    '2026-03-28 16:10:00'
  ),
  (
    '6',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    1,
    '玲珑币',
    500,
    'success',
    'CODE1006',
    '2026-03-15 11:30:00'
  );

-- 查看插入的记录
SELECT * FROM exchange_records WHERE user_id = 'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco';
