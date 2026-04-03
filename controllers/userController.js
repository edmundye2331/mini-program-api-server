/**
 * 用户控制器
 */

const { database, generateId, formatDate } = require('../config/database');
const { generateToken } = require('../utils/jwt');

/**
 * 手机号登录
 */
const phoneLogin = (req, res) => {
  try {
    const { phone, code } = req.body;

    // 验证参数
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空'
      });
    }

    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 验证验证码（简化版，实际应验证真实的验证码）
    if (code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: '验证码格式不正确'
      });
    }

    // 查找或创建用户
    let userId = null;
    let user = null;

    for (const [id, u] of database.users.entries()) {
      if (u.phone === phone) {
        userId = id;
        user = u;
        break;
      }
    }

    if (!user) {
      // 创建新用户
      userId = generateId();
      user = {
        id: userId,
        phone: phone,
        avatar: '/images/avatar.png',
        nickname: '用户' + phone.slice(-4),
        gender: null,
        city: null,
        province: null,
        country: null,
        createdAt: formatDate(),
        updatedAt: formatDate()
      };
      database.users.set(userId, user);

      // 创建会员数据
      database.members.set(userId, {
        userId: userId,
        balance: '0.00',
        points: 0,
        coupons: 0,
        level: 1,
        createdAt: formatDate(),
        updatedAt: formatDate()
      });
    }

    // 生成JWT token
    const token = generateToken({
      userId: userId,
      phone: phone
    });

    // 返回用户信息和token
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token: token,  // JWT token
        tokenType: 'Bearer',
        expiresIn: '7天',
        userInfo: user
      }
    });
  } catch (error) {
    console.error('手机登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
};

/**
 * 微信登录
 */
const wechatLogin = (req, res) => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少微信登录code'
      });
    }

    // 实际应使用code调用微信API获取openid和session_key
    // TODO: 实际项目中需要调用微信API：
    // const wxResponse = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`);
    // const { openid, session_key } = wxResponse.data;

    // 这里简化处理，模拟生成session_key
    const crypto = require('crypto');
    const mockSessionKey = Buffer.from(crypto.randomBytes(24)).toString('base64');

    const userId = generateId();
    const user = {
      id: userId,
      phone: null,
      avatar: userInfo?.avatarUrl || '/images/avatar.png',
      nickname: userInfo?.nickName || '微信用户',
      gender: userInfo?.gender === 1 ? 'male' : 'female',
      city: userInfo?.city || null,
      province: userInfo?.province || null,
      country: userInfo?.country || null,
      wechat_openid: `wx_openid_${userId}`, // 模拟openid
      wechat_session_key: mockSessionKey,    // 保存session_key用于后续解密
      createdAt: formatDate(),
      updatedAt: formatDate()
    };

    database.users.set(userId, user);

    // 创建会员数据
    database.members.set(userId, {
      userId: userId,
      balance: '0.00',
      points: 0,
      coupons: 0,
      level: 1,
      createdAt: formatDate(),
      updatedAt: formatDate()
    });

    // 生成JWT token
    const token = generateToken({
      userId: userId,
      phone: null  // 微信登录可能没有手机号
    });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token: token,  // JWT token
        tokenType: 'Bearer',
        expiresIn: '7天',
        userInfo: user
      }
    });
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
};

/**
 * 获取用户信息
 */
const getUserInfo = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const user = database.users.get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

/**
 * 更新用户信息
 */
const updateUserInfo = (req, res) => {
  try {
    const { userId } = req.body;
    const updateData = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    let user = database.users.get(userId);

    if (!user) {
      // 用户不存在，创建新用户（可能服务器重启导致数据丢失）
      console.log(`用户 ${userId} 不存在，自动创建用户`);

      user = {
        id: userId,
        phone: updateData.phone || null,
        avatar: updateData.avatar || '/images/avatar.png',
        nickname: updateData.nickname || '用户',
        gender: updateData.gender || null,
        birthday: updateData.birthday || null,
        city: updateData.city || null,
        province: updateData.province || null,
        country: updateData.country || null,
        createdAt: formatDate(),
        updatedAt: formatDate()
      };

      database.users.set(userId, user);

      // 同时创建会员数据
      if (!database.members.has(userId)) {
        database.members.set(userId, {
          userId: userId,
          balance: '0.00',
          points: 0,
          coupons: 0,
          level: 1,
          createdAt: formatDate(),
          updatedAt: formatDate()
        });
      }

      console.log(`用户 ${userId} 创建成功`);
    }

    // 更新用户信息
    const updatedUser = {
      ...user,
      ...updateData,
      id: user.id, // 保持ID不变
      createdAt: user.createdAt, // 保持创建时间不变
      updatedAt: formatDate()
    };

    database.users.set(userId, updatedUser);

    res.json({
      success: true,
      message: '更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
};

/**
 * 上传头像（Base64格式）
 */
const uploadAvatar = (req, res) => {
  try {
    const { userId, avatar } = req.body;

    // 验证参数
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: '缺少头像数据'
      });
    }

    // 验证Base64格式
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: '头像格式不正确，需要Base64格式的图片'
      });
    }

    // 获取用户
    let user = database.users.get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 限制Base64数据大小（约2MB）
    const base64Length = avatar.length;
    const sizeInBytes = (base64Length * 3) / 4; // Base64解码后的大小
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 2) {
      return res.status(400).json({
        success: false,
        message: '头像大小不能超过2MB'
      });
    }

    // 更新用户头像
    user.avatar = avatar;
    user.updatedAt = formatDate();

    database.users.set(userId, user);

    console.log(`用户 ${userId} 的头像已更新`);

    res.json({
      success: true,
      message: '头像上传成功',
      data: {
        avatar: avatar
      }
    });
  } catch (error) {
    console.error('上传头像错误:', error);
    res.status(500).json({
      success: false,
      message: '上传头像失败'
    });
  }
};

/**
 * 解密微信手机号
 * 注意：这需要用户之前通过微信登录，并且保存了session_key
 */
const decryptWechatPhone = (req, res) => {
  try {
    const { encryptedData, iv } = req.body;
    const userId = req.user.id;

    // 验证参数
    if (!encryptedData || !iv) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的解密参数'
      });
    }

    // 获取用户信息
    const user = database.users.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查用户是否有session_key（需要之前通过微信登录）
    if (!user.wechat_session_key) {
      return res.status(400).json({
        success: false,
        message: '请先通过微信登录'
      });
    }

    // 解密手机号
    const crypto = require('crypto');

    try {
      // 使用session_key解密
      const sessionKey = Buffer.from(user.wechat_session_key, 'base64');
      const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');

      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, ivBuffer);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
      decrypted += decipher.final('utf8');

      const phoneData = JSON.parse(decrypted);

      if (!phoneData.phoneNumber) {
        return res.status(400).json({
          success: false,
          message: '解密失败：未找到手机号'
        });
      }

      // 更新用户手机号
      user.phone = phoneData.phoneNumber;
      user.phoneNumber = phoneData.phoneNumber;
      user.purePhoneNumber = phoneData.purePhoneNumber;
      user.countryCode = phoneData.countryCode;
      user.updatedAt = formatDate();

      database.users.set(userId, user);

      console.log(`用户 ${userId} 的手机号已更新`);

      res.json({
        success: true,
        message: '手机号获取成功',
        data: {
          phone: phoneData.phoneNumber,
          purePhoneNumber: phoneData.purePhoneNumber,
          countryCode: phoneData.countryCode
        }
      });
    } catch (decryptError) {
      console.error('解密微信手机号失败:', decryptError);
      return res.status(400).json({
        success: false,
        message: '解密失败，请重新登录',
        error: decryptError.message
      });
    }
  } catch (error) {
    console.error('获取微信手机号错误:', error);
    res.status(500).json({
      success: false,
      message: '获取手机号失败'
    });
  }
};

module.exports = {
  phoneLogin,
  wechatLogin,
  getUserInfo,
  updateUserInfo,
  uploadAvatar,
  decryptWechatPhone
};
