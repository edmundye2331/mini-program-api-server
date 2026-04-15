const { db, generateId, formatDate } = require('../config/mysql');
const { generateToken } = require('../utils/jwt');
const { hashPassword } = require('../utils/encryption');

/**
 * 手机号登录
 */
const phoneLogin = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.error('手机号和验证码不能为空', 400);
    }

    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return res.error('手机号格式不正确', 400);
    }

    if (code.length !== 6) {
      return res.error('验证码格式不正确', 400);
    }

    const existingUser = await db.findOne('users', { phone: phone });
    let userId = existingUser?.id;
    let user = existingUser;

    if (!user) {
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
        wechat_openid: null,
        wechat_session_key: null,
        createdAt: formatDate(),
        updatedAt: formatDate()
      };
      // 如果请求中有密码，加密后存储
      if (req.body.password) {
        user.password = await hashPassword(req.body.password);
      }
      await db.insert('users', user);
      await db.insert('members', {
        id: generateId(),
        user_id: userId,
        balance: '0.00',
        points: 0,
        coupons: 0,
        level: 1,
        created_at: formatDate(),
        updated_at: formatDate()
      });
    } else {
      if (user.wechat_openid || user.wechat_session_key) {
        await db.update('users', {
          wechat_openid: null,
          wechat_session_key: null,
          updatedAt: formatDate()
        }, { id: userId });
        user.wechat_openid = null;
        user.wechat_session_key = null;
        user.updatedAt = formatDate();
        console.log(`用户 ${userId} 从微信登录切换为手机号登录，已清除微信字段`);
      }
    }

    const token = generateToken({
      userId: userId,
      phone: phone
    });

    res.success({
      token: token,
      tokenType: 'Bearer',
      expiresIn: '7天',
      userInfo: user
    }, '登录成功');
  } catch (error) {
    console.error('手机登录错误:', error);
    res.error('登录失败', 500, error);
  }
};

const axios = require('axios');
const crypto = require('crypto');
const WX_APP_ID = process.env.WX_APP_ID || 'your_wechat_app_id';
const WX_APP_SECRET = process.env.WX_APP_SECRET || 'your_wechat_app_secret';

const wechatLogin = async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    console.log('[微信登录后端] 收到请求，code:', code ? '已收到' : '未收到', 'userInfo:', userInfo ? '已收到' : '未收到');

    if (!code) {
      return res.error('缺少微信登录code', 400);
    }

    console.log('调用微信接口:', { appid: WX_APP_ID, code: code });
    const wxResponse = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
      params: {
        appid: WX_APP_ID,
        secret: WX_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = wxResponse.data;

    if (errcode) {
      console.error('微信登录接口错误:', errmsg);
      return res.error(`微信登录失败: ${errmsg}`, 400);
    }

    if (!openid || !session_key) {
      return res.error('无法获取微信用户信息', 400);
    }

    const userId = 'wx_' + openid;
    const existingUser = await db.findOne('users', { id: userId });

    if (existingUser) {
      const updateData = {};
      if (userInfo && userInfo.avatarUrl && userInfo.avatarUrl !== existingUser.avatar) {
        updateData.avatar = userInfo.avatarUrl;
      }
      if (userInfo && userInfo.nickName && userInfo.nickName !== existingUser.nickname) {
        updateData.nickname = userInfo.nickName;
      }
      if (userInfo && userInfo.gender !== undefined) {
        updateData.gender = userInfo.gender === 1 ? 'male' : 'female';
      }
      if (userInfo && userInfo.city) {
        updateData.city = userInfo.city;
      }
      if (userInfo && userInfo.province) {
        updateData.province = userInfo.province;
      }
      if (userInfo && userInfo.country) {
        updateData.country = userInfo.country;
      }
      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = formatDate();
        await db.update('users', updateData, { id: userId });
        Object.assign(existingUser, updateData);
      }

      await db.update('users', {
        wechat_session_key: session_key,
        wechat_openid: openid,
        updatedAt: formatDate()
      }, { id: userId });

      const token = generateToken({
        userId: userId,
        phone: existingUser.phone,
        openid: openid
      });

      res.success({
        token: token,
        tokenType: 'Bearer',
        expiresIn: '7天',
        userInfo: existingUser,
        sessionKey: session_key
      }, '登录成功');
      return;
    }

    const user = {
      id: userId,
      phone: null,
      avatar: userInfo?.avatarUrl || '/images/avatar.png',
      nickname: userInfo?.nickName || '微信用户',
      gender: userInfo?.gender === 1 ? 'male' : 'female',
      city: userInfo?.city || null,
      province: userInfo?.province || null,
      country: userInfo?.country || null,
      wechat_openid: openid,
      wechat_session_key: session_key,
      createdAt: formatDate(),
      updatedAt: formatDate()
    };

    await db.insert('users', user);
    await db.insert('members', {
      id: generateId(),
      user_id: userId,
      balance: '0.00',
      points: 0,
      coupons: 0,
      level: 1,
      created_at: formatDate(),
      updated_at: formatDate()
    });

    const token = generateToken({
      userId: userId,
      phone: null,
      openid: openid
    });

    res.success({
      token: token,
      tokenType: 'Bearer',
      expiresIn: '7天',
      userInfo: user,
      sessionKey: session_key
    }, '登录成功');
  } catch (error) {
    console.error('微信登录错误:', error);
    res.error('登录失败', 500, error);
  }
};

const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    const user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('用户不存在', 404);
    }

    res.success(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.error('获取用户信息失败', 500, error);
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const { userId } = req.body;
    const updateData = req.body;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    let user = await db.findOne('users', { id: userId });

    if (!user) {
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
      await db.insert('users', user);
      const existingMember = await db.findOne('members', { user_id: userId });
      if (!existingMember) {
        await db.insert('members', {
          id: generateId(),
          user_id: userId,
          balance: '0.00',
          points: 0,
          coupons: 0,
          level: 1,
          created_at: formatDate(),
          updated_at: formatDate()
        });
      }
      console.log(`用户 ${userId} 创建成功`);
    }

    const { id: _, createdAt: __, ...updatableData } = updateData;
    const updatedData = {
      ...updatableData,
      updatedAt: formatDate()
    };

    await db.update('users', updatedData, { id: userId });

    const updatedUser = {
      ...user,
      ...updatedData
    };

    res.success(updatedUser, '更新成功');
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.error('更新用户信息失败', 500, error);
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const { userId, avatar } = req.body;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    if (!avatar) {
      return res.error('缺少头像数据', 400);
    }

    if (!avatar.startsWith('data:image/')) {
      return res.error('头像格式不正确，需要Base64格式的图片', 400);
    }

    let user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('用户不存在', 404);
    }

    const base64Length = avatar.length;
    const sizeInBytes = (base64Length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 2) {
      return res.error('头像大小不能超过2MB', 400);
    }

    await db.update('users', {
      avatar: avatar,
      updatedAt: formatDate()
    }, { id: userId });

    user.avatar = avatar;
    user.updatedAt = formatDate();

    console.log(`用户 ${userId} 的头像已更新`);

    res.success({ avatar: avatar }, '头像上传成功');
  } catch (error) {
    console.error('上传头像错误:', error);
    res.error('上传头像失败', 500, error);
  }
};

const decryptWechatPhone = async (req, res) => {
  try {
    const { encryptedData, iv } = req.body;
    const userId = req.user.id;

    if (!encryptedData || !iv) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的解密参数'
      });
    }

    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (!user.wechat_session_key) {
      return res.status(400).json({
        success: false,
        message: '请先通过微信登录'
      });
    }

    console.log(`[微信手机号] 用户 ${userId} 尝试解密，开发环境返回特殊错误码`);

    return res.status(400).json({
      success: false,
      message: '开发环境暂不支持微信手机号解密，请使用验证码绑定手机号',
      code: 'DEV_ENV_NO_REAL_SESSION_KEY'
    });
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
