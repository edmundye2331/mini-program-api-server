/**
 * 数据脱敏工具函数
 * 用于处理用户敏感数据，在API响应中隐藏敏感信息
 */

/**
 * 手机号脱敏
 * @param {String} phone - 原始手机号
 * @returns {String} 脱敏后的手机号（如 138****1234）
 */
const maskPhone = (phone) => {
  if (!phone || phone.length !== 11) {
    return phone;
  }
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
};

/**
 * 身份证号脱敏
 * @param {String} idCard - 原始身份证号
 * @returns {String} 脱敏后的身份证号（如 110*******1234）
 */
const maskIdCard = (idCard) => {
  if (!idCard || idCard.length < 8) {
    return idCard;
  }
  return `${idCard.slice(0, 3)}*******${idCard.slice(-4)}`;
};

/**
 * 银行卡号脱敏
 * @param {String} bankCard - 原始银行卡号
 * @returns {String} 脱敏后的银行卡号（如 6222****1234）
 */
const maskBankCard = (bankCard) => {
  if (!bankCard || bankCard.length < 12) {
    return bankCard;
  }
  return `${bankCard.slice(0, 4)}****${bankCard.slice(-4)}`;
};

/**
 * 姓名脱敏
 * @param {String} name - 原始姓名
 * @returns {String} 脱敏后的姓名（如 张*）
 */
const maskName = (name) => {
  if (!name) {
    return name;
  }
  if (name.length === 2) {
    return `${name.slice(0, 1)}*`;
  }
  if (name.length > 2) {
    return `${name.slice(0, 1)}**${name.slice(-1)}`;
  }
  return name;
};

/**
 * 邮箱脱敏
 * @param {String} email - 原始邮箱
 * @returns {String} 脱敏后的邮箱（如 t****@example.com）
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) {
    return email;
  }
  const [local, domain] = email.split('@');
  if (local.length <= 1) {
    return `${local}****@${domain}`;
  }
  return `${local.slice(0, 1)}****@${domain}`;
};

/**
 * 脱敏用户敏感数据
 * @param {Object} user - 用户对象
 * @returns {Object} 脱敏后的用户对象
 */
const maskUserData = (user) => {
  if (!user || typeof user !== 'object') {
    return user;
  }

  const masked = { ...user };

  // 脱敏手机号
  if (masked.phone) {
    masked.phone = maskPhone(masked.phone);
  }

  // 脱敏身份证号
  if (masked.id_card || masked.idCard) {
    masked.id_card = maskIdCard(masked.id_card || masked.idCard);
    if (masked.idCard) {
      masked.idCard = maskIdCard(masked.idCard);
    }
  }

  // 脱敏银行卡号
  if (masked.bank_card || masked.bankCard) {
    masked.bank_card = maskBankCard(masked.bank_card || masked.bankCard);
    if (masked.bankCard) {
      masked.bankCard = maskBankCard(masked.bankCard);
    }
  }

  // 脱敏姓名
  if (masked.name || masked.nickname) {
    masked.name = maskName(masked.name);
    masked.nickname = maskName(masked.nickname);
  }

  // 脱敏邮箱
  if (masked.email) {
    masked.email = maskEmail(masked.email);
  }

  // 移除敏感字段
  delete masked.password_hash;
  delete masked.wechat_session_key;
  delete masked.openid;
  delete masked.unionid;

  return masked;
};

/**
 * 脱敏地址信息
 * @param {String} address - 原始地址
 * @returns {String} 脱敏后的地址（如 北京市朝阳区****）
 */
const maskAddress = (address) => {
  if (!address) {
    return address;
  }
  // 保留省市区，隐藏详细地址
  const parts = address.split(/[省市区]/);
  if (parts.length >= 2) {
    return `${parts[0]}${parts[1]}****`;
  }
  return address;
};

module.exports = {
  maskPhone,
  maskIdCard,
  maskBankCard,
  maskName,
  maskEmail,
  maskUserData,
  maskAddress,
};
