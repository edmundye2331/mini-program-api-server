const { db, generateId, formatDate } = require('../config/mysql.js');

/**
 * 获取生日礼信息
 */
exports.getBirthdayGift = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 查找用户
    const user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('用户不存在', 404);
    }

    // 查找用户的生日礼记录
    let birthdayGift = await db.findOne('birthday_gifts', { user_id: userId });

    // 如果没有记录，创建默认记录
    if (!birthdayGift) {
      const currentYear = new Date().getFullYear();
      const giftData = {
        id: generateId(),
        user_id: userId,
        year: currentYear,
        is_claimed: 0,
        gift_name: '生日特饮',
        gift_description: '精美鸡尾酒一杯，价值68元',
        gift_value: 68,
        gift_image: '/images/cake.png',
        gift_type: 'points',
        created_at: formatDate()
      };
      const result = await db.insert('birthday_gifts', giftData);
      birthdayGift = {
        id: giftData.id,
        user_id: userId,
        year: currentYear,
        is_claimed: 0,
        gift_name: '生日特饮',
        gift_description: '精美鸡尾酒一杯，价值68元',
        gift_value: 68,
        gift_image: '/images/cake.png',
        gift_type: 'points',
        created_at: formatDate()
      };
    } else {
      birthdayGift.gift = {
        name: birthdayGift.gift_name,
        description: birthdayGift.gift_description,
        value: birthdayGift.gift_value,
        image: birthdayGift.gift_image
      };
    }

    // 检查是否已领取
    const data = {
      canClaim: !birthdayGift.is_claimed,
      isClaimed: birthdayGift.is_claimed,
      gift: birthdayGift.gift,
      claimedAt: birthdayGift.claimed_at || null
    };

    res.success(data, '获取生日礼成功');
  } catch (error) {
    res.error('获取生日礼失败', 500, error);
  }
};

/**
 * 领取生日礼
 */
exports.claimBirthdayGift = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 查找用户
    const user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('用户不存在', 404);
    }

    // 查找用户的生日礼记录
    const birthdayGift = await db.findOne('birthday_gifts', { user_id: userId });

    if (!birthdayGift) {
      return res.error('生日礼不存在', 404);
    }

    // 检查是否已领取
    if (birthdayGift.is_claimed) {
      return res.error('生日礼已领取', 400);
    }

    // 获取当前会员积分
    const member = await db.findOne('members', { user_id: userId });
    const giftValue = parseInt(birthdayGift.gift_value);
    const newPoints = (member.points || 0) + giftValue;

    // 领取生日礼
    await db.update('birthday_gifts', {
      is_claimed: 1,
      claimed_at: formatDate()
    }, { user_id: userId });

    // 创建积分记录
    const pointsRecord = {
      id: generateId(),
      user_id: userId,
      type: 'birthday',
      amount: giftValue,
      balance: newPoints,
      description: `生日礼：${birthdayGift.gift_name}`,
      created_at: formatDate()
    };
    await db.insert('points_records', pointsRecord);

    // 更新会员积分
    await db.update('members', {
      points: newPoints
    }, { user_id: userId });

    res.success({
      gift: {
        name: birthdayGift.gift_name,
        description: birthdayGift.gift_description,
        value: birthdayGift.gift_value,
        image: birthdayGift.gift_image
      },
      claimedAt: formatDate()
    }, '生日礼领取成功');
  } catch (error) {
    res.error('领取生日礼失败', 500, error);
  }
};

/**
 * 获取生日礼领取记录
 */
exports.getBirthdayGiftRecords = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 获取该用户的生日礼记录
    const birthdayGift = await db.findOne('birthday_gifts', { user_id: userId });

    if (!birthdayGift) {
      return res.success({
        records: []
      }, '暂无生日礼记录');
    }

    // 获取相关的积分记录
    const pointsRecords = await db.findMany('points_records', {
      user_id: userId,
      type: 'birthday'
    });

    const records = pointsRecords.map(record => ({
      id: record.id,
      giftName: record.description.replace('生日礼：', ''),
      value: record.amount,
      claimedAt: record.created_at
    }));

    res.success({
      records,
      total: records.length
    }, '获取生日礼记录成功');
  } catch (error) {
    res.error('获取生日礼记录失败', 500, error);
  }
};
