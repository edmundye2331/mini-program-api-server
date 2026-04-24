-- 插入积分明细测试数据
-- 针对用户 wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco

USE miniprogram_db;

-- 插入积分记录
INSERT INTO points_records (id, user_id, type, amount, balance, description, created_at)
VALUES
  (
    '1',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'earn',
    100,
    100,
    '消费获得积分',
    '2026-04-18 10:30:00'
  ),
  (
    '2',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'spend',
    -100,
    0,
    '兑换商品: 玲珑币',
    '2026-04-18 10:30:00'
  ),
  (
    '3',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'earn',
    500,
    500,
    '充值赠送积分',
    '2026-04-15 14:20:00'
  ),
  (
    '4',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'spend',
    -500,
    0,
    '兑换商品: 玲珑币',
    '2026-04-15 14:20:00'
  ),
  (
    '5',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'earn',
    1000,
    1000,
    '消费获得积分',
    '2026-04-10 09:15:00'
  ),
  (
    '6',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'earn',
    3000,
    4000,
    '充值赠送积分',
    '2026-03-28 16:10:00'
  ),
  (
    '7',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'spend',
    -3000,
    1000,
    '兑换商品: 玲珑币',
    '2026-03-28 16:10:00'
  ),
  (
    '8',
    'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco',
    'earn',
    500,
    1500,
    '消费获得积分',
    '2026-03-15 11:30:00'
  );

-- 查看插入的记录
SELECT * FROM points_records WHERE user_id = 'wx_okixZ1yQs2eu-l-EZpzwQ2yf-lco';