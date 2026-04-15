const { db, generateId, formatDate } = require('../config/mysql');
const { hashPassword, verifyPassword } = require('../utils/encryption');

/**
 * 修改密码
 */
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.error('缺少必要参数', 400);
    }

    // 查找用户
    const user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('用户不存在', 404);
    }

    // 验证原密码
    if (user.password) {
      const isPasswordValid = await verifyPassword(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.error('原密码错误', 400);
      }
    } else {
      return res.error('请先设置密码', 400);
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    await db.update('users', {
      password: hashedPassword,
      updated_at: formatDate()
    }, { id: userId });

    // 记录密码修改历史
    await db.insert('password_history', {
      id: generateId(),
      user_id: userId,
      changed_at: formatDate(),
      ip: req.ip || 'unknown'
    });

    res.success(null, '密码修改成功');
  } catch (error) {
    res.error('密码修改失败', 500, error);
  }
};

/**
 * 绑定/更换手机号
 */
exports.bindPhone = async (req, res) => {
  try {
    const { userId, phone, code } = req.body;

    if (!userId || !phone || !code) {
      return res.error('缺少必要参数', 400);
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.error('手机号格式不正确', 400);
    }

    // 简化验证：验证码只要是6位数字即可
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.error('验证码错误', 400);
    }

    // 查找用户
    const user = await db.findOne('users', { id: userId });

    if (!user) {
      return res.error('用户不存在', 404);
    }

    // 更新手机号
    await db.update('users', {
      phone: phone,
      updated_at: formatDate()
    }, { id: userId });

    res.success(null, '手机号绑定成功');
  } catch (error) {
    res.error('手机号绑定失败', 500, error);
  }
};

/**
 * 获取登录记录
 */
exports.getLoginLogs = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    // 获取该用户的登录记录
    const userLogs = await db.findMany('login_logs', { user_id: userId }, {
      orderBy: 'login_time',
      order: 'DESC',
      limit: 20
    });

    res.success({
      list: userLogs,
      total: userLogs.length
    }, '获取登录记录成功');
  } catch (error) {
    res.error('获取登录记录失败', 500, error);
  }
};

/**
 * 记录登录
 */
exports.recordLogin = async (userId, loginType = 'phone', userInfo = {}) => {
  try {
    const log = {
      id: generateId(),
      user_id: userId,
      login_type: loginType,
      login_time: formatDate(),
      ip: 'unknown',
      device: 'miniprogram',
      ...userInfo
    };

    await db.insert('login_logs', log);

    return log;
  } catch (error) {
    console.error('记录登录失败:', error);
    return null;
  }
};

/**
 * 注销账号
 */
exports.deleteAccount = async (req, res) => {
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

    // 删除用户数据
    await db.delete('users', { id: userId });
    await db.delete('members', { user_id: userId });
    await db.delete('carts', { user_id: userId });
    await db.delete('birthday_gifts', { user_id: userId });

    // 保留订单记录但标记为已注销
    await db.update('orders', {
      deleted: true,
      deleted_at: formatDate()
    }, { user_id: userId });

    res.success(null, '账号注销成功');
  } catch (error) {
    res.error('账号注销失败', 500, error);
  }
};
