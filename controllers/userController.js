/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */

/**
 * @swagger
 * tags:
 *   name: 用户管理
 *   description: 用户相关API
 */

const axios = require('axios');
const crypto = require('crypto');
const userService = require('../services/userService');
const memberService = require('../services/memberService');
const { generateToken } = require('../utils/jwt');

const WX_APP_ID = process.env.WX_APP_ID || 'your_wechat_app_id';
const WX_APP_SECRET = process.env.WX_APP_SECRET || 'your_wechat_app_secret';

/**
 * 手机号登录
 * @swagger
 * /api/user/login/phone:
 *   post:
 *     summary: 手机号密码登录
 *     tags: [用户]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 description: 密码（可选）
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     tokenType:
 *                       type: string
 *                       example: "Bearer"
 *                     expiresIn:
 *                       type: string
 *                       example: "7天"
 *                     userInfo:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "登录成功"
 */
const phoneLogin = async (req, res) => {
  try {
    const { phone, code, password } = req.validatedData;

    let user = await userService.getUserByPhone(phone);
    let userId = user?.id;

    if (!user) {
      userId = require('../config/mysql').generateId();
      const userData = {
        id: userId,
        phone,
        avatar: '/images/avatar.png',
        nickname: `用户${phone.slice(-4)}`,
        gender: null,
        city: null,
        province: null,
        country: null,
        wechat_openid: null,
        wechat_session_key: null,
      };

      // 如果请求中有密码，加密后存储
      if (password) {
        await userService.createUser(userData, password);
      } else {
        await userService.createUser(userData);
      }

      console.log(`自动创建会员数据: ${userId}`);
    } else if (user.wechat_openid || user.wechat_session_key) {
      await userService.updateUser(userId, {
        wechat_openid: null,
        wechat_session_key: null,
      });
      console.log(`用户 ${userId} 从微信登录切换为手机号登录，已清除微信字段`);
    }

    user = await userService.getUserById(userId);

    const token = generateToken({
      userId,
      phone,
    });

    res.success(
      {
        token,
        tokenType: 'Bearer',
        expiresIn: '7天',
        userInfo: user,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('手机登录错误:', error);
    res.error('USER.LOGIN_FAILED', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/user/login/wechat:
 *   post:
 *     summary: 微信登录
 *     tags: [用户管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信登录临时code
 *                 example: "011a5w0000a00000000000000000"
 *               userInfo:
 *                 type: object
 *                 description: 用户信息（可选）
 *                 properties:
 *                   avatarUrl:
 *                     type: string
 *                     description: 头像URL
 *                   nickName:
 *                     type: string
 *                     description: 昵称
 *                   gender:
 *                     type: integer
 *                     description: 性别（1男，2女）
 *                   city:
 *                     type: string
 *                     description: 城市
 *                   province:
 *                     type: string
 *                     description: 省份
 *                   country:
 *                     type: string
 *                     description: 国家
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     tokenType:
 *                       type: string
 *                       example: "Bearer"
 *                     expiresIn:
 *                       type: string
 *                       example: "7天"
 *                     userInfo:
 *                       type: object
 *                     sessionKey:
 *                       type: string
 *                       example: "session_key_value"
 *                 message:
 *                   type: string
 *                   example: "登录成功"
 *       400:
 *         description: 微信登录失败
 */
const wechatLogin = async (req, res) => {
  try {
    const { code, userInfo } = req.validatedData;
    const wxResponse = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session`,
      {
        params: {
          appid: WX_APP_ID,
          secret: WX_APP_SECRET,
          js_code: code,
          grant_type: 'authorization_code',
        },
      }
    );

    const { openid, session_key, errcode, errmsg } = wxResponse.data;

    if (errcode) {
      console.error('微信登录接口错误:', errmsg);
      return res.error('USER.WECHAT_LOGIN_FAILED', 400, new Error(errmsg), req);
    }

    if (!openid || !session_key) {
      return res.error('USER.WECHAT_LOGIN_FAILED', 400, null, req);
    }

    let existingUser = await userService.getUserByWechatOpenId(openid);

    if (existingUser) {
      const updateData = {};
      if (
        userInfo &&
        userInfo.avatarUrl &&
        userInfo.avatarUrl !== existingUser.avatar
      ) {
        updateData.avatar = userInfo.avatarUrl;
      }
      if (
        userInfo &&
        userInfo.nickName &&
        userInfo.nickName !== existingUser.nickname
      ) {
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
        await userService.updateUser(existingUser.id, updateData);
        existingUser = { ...existingUser, ...updateData };
      }

      await userService.updateUser(existingUser.id, {
        wechat_session_key: session_key,
        wechat_openid: openid,
      });

      const token = generateToken({
        userId: existingUser.id,
        phone: existingUser.phone,
        openid,
      });

      res.success(
        {
          token,
          tokenType: 'Bearer',
          expiresIn: '7天',
          userInfo: existingUser,
          sessionKey: session_key,
        },
        'COMMON.SUCCESS',
        200,
        req
      );
      return;
    }

    const userId = require('../config/mysql').generateId();
    const userData = {
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
    };

    await userService.createUser(userData);

    const user = await userService.getUserById(userId);

    const token = generateToken({
      userId,
      phone: null,
      openid,
    });

    res.success(
      {
        token,
        tokenType: 'Bearer',
        expiresIn: '7天',
        userInfo: user,
        sessionKey: session_key,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    console.error('微信登录错误:', error);
    res.error('USER.WECHAT_LOGIN_FAILED', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/user/info:
 *   get:
 *     summary: 获取用户信息
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取用户信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "wx_openid123456"
 *                     phone:
 *                       type: string
 *                       example: "13800138000"
 *                     avatar:
 *                       type: string
 *                       example: "/images/avatar.png"
 *                     nickname:
 *                       type: string
 *                       example: "微信用户"
 *                     gender:
 *                       type: string
 *                       example: "male"
 *                     city:
 *                       type: string
 *                       example: "北京"
 *                     province:
 *                       type: string
 *                       example: "北京"
 *                     country:
 *                       type: string
 *                       example: "中国"
 *                     wechat_openid:
 *                       type: string
 *                       example: "openid123456"
 *                     wechat_session_key:
 *                       type: string
 *                       example: "session_key_value"
 *                     create_time:
 *                       type: string
 *                       format: date-time
 *                     update_time:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    res.success(user, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/user/update:
 *   post:
 *     summary: 更新用户信息
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *                 example: "wx_openid123456"
 *               avatar:
 *                 type: string
 *                 description: 头像URL
 *                 example: "/images/avatar.png"
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *                 example: "微信用户"
 *               gender:
 *                 type: string
 *                 description: 性别（male/female）
 *                 example: "male"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *                 example: "1990-01-01"
 *               city:
 *                 type: string
 *                 description: 城市
 *                 example: "北京"
 *               province:
 *                 type: string
 *                 description: 省份
 *                 example: "北京"
 *               country:
 *                 type: string
 *                 description: 国家
 *                 example: "中国"
 *     responses:
 *       200:
 *         description: 更新用户信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "更新成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
const updateUserInfo = async (req, res) => {
  try {
    const { userId } = req.body;
    const updateData = req.body;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    let user = await userService.getUserById(userId);

    if (!user) {
      console.log(`用户 ${userId} 不存在，自动创建用户`);
      await userService.createUser({
        id: userId,
        phone: updateData.phone || null,
        avatar: updateData.avatar || '/images/avatar.png',
        nickname: updateData.nickname || '用户',
        gender: updateData.gender || null,
        birthday: updateData.birthday || null,
        city: updateData.city || null,
        province: updateData.province || null,
        country: updateData.country || null,
      });

      user = await userService.getUserById(userId);
      console.log(`用户 ${userId} 创建成功`);
    }

    const updatedUser = await userService.updateUser(userId, updateData);

    res.success(updatedUser, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/user/avatar/upload:
 *   post:
 *     summary: 上传头像
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - avatar
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *                 example: "wx_openid123456"
 *               avatar:
 *                 type: string
 *                 description: 头像base64数据
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *     responses:
 *       200:
 *         description: 上传头像成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                 message:
 *                   type: string
 *                   example: "上传成功"
 *       400:
 *         description: 请求参数错误或头像格式不正确
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const uploadAvatar = async (req, res) => {
  try {
    const { userId, avatar } = req.body;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    if (!avatar) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    if (!avatar.startsWith('data:image/')) {
      return res.error('COMMON.VALIDATE_FAILED', 400, null, req);
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    const base64Length = avatar.length;
    const sizeInBytes = (base64Length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 2) {
      return res.error('COMMON.VALIDATE_FAILED', 400, null, req);
    }

    await userService.updateUser(userId, {
      avatar,
    });

    user.avatar = avatar;

    console.log(`用户 ${userId} 的头像已更新`);

    res.success({ avatar }, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    console.error('上传头像错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/user/phone/decrypt:
 *   post:
 *     summary: 解密微信手机号
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encryptedData
 *               - iv
 *             properties:
 *               encryptedData:
 *                 type: string
 *                 description: 加密数据
 *                 example: "encrypted_data_string"
 *               iv:
 *                 type: string
 *                 description: 加密算法的初始向量
 *                 example: "iv_string"
 *     responses:
 *       200:
 *         description: 解密成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     phoneNumber:
 *                       type: string
 *                       example: "13800138000"
 *                     purePhoneNumber:
 *                       type: string
 *                       example: "13800138000"
 *                     countryCode:
 *                       type: string
 *                       example: "86"
 *                 message:
 *                   type: string
 *                   example: "解密成功"
 *       400:
 *         description: 请求参数错误或会话密钥不存在
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
const decryptWechatPhone = async (req, res) => {
  try {
    const { encryptedData, iv } = req.body;
    const userId = req.user.id;

    if (!encryptedData || !iv) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.error('USER.USER_NOT_EXIST', 404, null, req);
    }

    if (!user.wechat_session_key) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    console.log(`[微信手机号] 用户 ${userId} 尝试解密，开发环境返回特殊错误码`);

    return res.error(
      'COMMON.BAD_REQUEST',
      400,
      new Error('开发环境暂不支持微信手机号解密，请使用验证码绑定手机号'),
      req
    );
  } catch (error) {
    console.error('获取微信手机号错误:', error);
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

module.exports = {
  phoneLogin,
  wechatLogin,
  getUserInfo,
  updateUserInfo,
  uploadAvatar,
  decryptWechatPhone,
};
