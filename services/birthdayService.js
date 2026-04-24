/**
 * 生日礼服务层
 * 处理生日礼相关业务逻辑
 */

const birthdayDao = require('../dao/birthdayDao');
const memberService = require('./memberService');
const pointsService = require('./pointsService');
const { generateId, formatDate } = require('../config/mysql');

/**
 * 获取用户生日礼信息
 * @param {String} userId - 用户ID
 * @returns {Object} 生日礼信息
 */
const getBirthdayGift = async (userId) => {
  const currentYear = new Date().getFullYear();

  let birthdayGift = await birthdayDao.findByUserIdAndYear(userId, currentYear);

  // 如果没有记录，创建默认记录
  if (!birthdayGift) {
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
      created_at: formatDate(),
    };

    await birthdayDao.insert(giftData);
    birthdayGift = giftData;
  }

  return {
    canClaim: !birthdayGift.is_claimed,
    isClaimed: birthdayGift.is_claimed,
    gift: {
      name: birthdayGift.gift_name,
      description: birthdayGift.gift_description,
      value: birthdayGift.gift_value,
      image: birthdayGift.gift_image,
    },
    claimedAt: birthdayGift.claimed_at || null,
  };
};

/**
 * 领取生日礼
 * @param {String} userId - 用户ID
 * @returns {Object} 领取结果
 */
const claimBirthdayGift = async (userId) => {
  const currentYear = new Date().getFullYear();

  const birthdayGift = await birthdayDao.findByUserIdAndYear(
    userId,
    currentYear
  );

  if (!birthdayGift) {
    throw new Error('生日礼不存在');
  }

  if (birthdayGift.is_claimed) {
    throw new Error('生日礼已领取');
  }

  // 领取生日礼
  await birthdayDao.updateStatus(userId, currentYear, true);

  // 添加积分
  const giftValue = parseInt(birthdayGift.gift_value);
  await pointsService.createPointsRecord(
    userId,
    giftValue,
    'birthday',
    `生日礼：${birthdayGift.gift_name}`
  );

  // 更新会员积分
  await memberService.updatePoints(
    userId,
    (await memberService.getOrCreateMember(userId)).points + giftValue
  );

  return {
    gift: {
      name: birthdayGift.gift_name,
      description: birthdayGift.gift_description,
      value: birthdayGift.gift_value,
      image: birthdayGift.gift_image,
    },
    claimedAt: formatDate(),
  };
};

/**
 * 获取生日礼领取记录
 * @param {String} userId - 用户ID
 * @returns {Array} 生日礼记录
 */
const getBirthdayGiftRecords = async (userId) => {
  const records = await birthdayDao.findByUserId(userId);

  return records.map((record) => ({
    id: record.id,
    giftName: record.gift_name,
    value: record.gift_value,
    claimedAt: record.claimed_at || record.created_at,
  }));
};

module.exports = {
  getBirthdayGift,
  claimBirthdayGift,
  getBirthdayGiftRecords,
};
