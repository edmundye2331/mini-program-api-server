const { database, generateId, formatDate } = require('../config/database.js');

/**
 * 获取生日礼信息
 */
exports.getBirthdayGift = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 查找用户
    const user = database.users.get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 查找用户的生日礼记录
    let birthdayGift = database.birthdayGifts.get(userId);

    // 如果没有记录，创建默认记录
    if (!birthdayGift) {
      birthdayGift = {
        userId,
        isClaimed: false,
        gift: {
          name: '生日特饮',
          description: '精美鸡尾酒一杯，价值68元',
          value: 68,
          image: '/images/birthday-gift.png'
        },
        createdAt: formatDate()
      };
      database.birthdayGifts.set(userId, birthdayGift);
    }

    // 检查是否已领取
    const data = {
      canClaim: !birthdayGift.isClaimed,
      isClaimed: birthdayGift.isClaimed,
      gift: birthdayGift.gift,
      claimedAt: birthdayGift.claimedAt || null
    };

    res.json({
      success: true,
      message: '获取生日礼成功',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取生日礼失败',
      error: error.message
    });
  }
};

/**
 * 领取生日礼
 */
exports.claimBirthdayGift = (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 查找用户
    const user = database.users.get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 查找用户的生日礼记录
    const birthdayGift = database.birthdayGifts.get(userId);

    if (!birthdayGift) {
      return res.status(404).json({
        success: false,
        message: '生日礼不存在'
      });
    }

    // 检查是否已领取
    if (birthdayGift.isClaimed) {
      return res.status(400).json({
        success: false,
        message: '生日礼已领取'
      });
    }

    // 领取生日礼
    birthdayGift.isClaimed = true;
    birthdayGift.claimedAt = formatDate();

    // 创建兑换记录（增加到积分记录）
    database.pointsRecords.push({
      id: generateId(),
      userId,
      type: 'birthday',
      amount: birthdayGift.gift.value,
      description: `生日礼：${birthdayGift.gift.name}`,
      createdAt: formatDate()
    });

    res.json({
      success: true,
      message: '生日礼领取成功',
      data: {
        gift: birthdayGift.gift,
        claimedAt: birthdayGift.claimedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '领取生日礼失败',
      error: error.message
    });
  }
};

/**
 * 获取生日礼领取记录
 */
exports.getBirthdayGiftRecords = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 获取该用户的生日礼记录
    const birthdayGift = database.birthdayGifts.get(userId);

    if (!birthdayGift) {
      return res.json({
        success: true,
        message: '暂无生日礼记录',
        data: {
          records: []
        }
      });
    }

    // 获取相关的积分记录
    const pointsRecords = database.pointsRecords.filter(
      record => record.userId === userId && record.type === 'birthday'
    );

    const records = pointsRecords.map(record => ({
      id: record.id,
      giftName: record.description.replace('生日礼：', ''),
      value: record.amount,
      claimedAt: record.createdAt
    }));

    res.json({
      success: true,
      message: '获取生日礼记录成功',
      data: {
        records,
        total: records.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取生日礼记录失败',
      error: error.message
    });
  }
};
