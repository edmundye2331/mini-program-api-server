const { database, generateId, formatDate } = require('../config/database.js');

/**
 * 修改密码
 */
exports.changePassword = (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
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

    // 简化验证：假设用户有password字段（实际应该有加密）
    // 这里为了演示，不做密码加密
    if (user.password && user.password !== oldPassword) {
      return res.status(400).json({
        success: false,
        message: '原密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    user.updatedAt = formatDate();

    // 记录密码修改历史
    database.passwordHistory.push({
      id: generateId(),
      userId,
      changedAt: formatDate(),
      ip: req.ip || 'unknown'
    });

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '密码修改失败',
      error: error.message
    });
  }
};

/**
 * 绑定/更换手机号
 */
exports.bindPhone = (req, res) => {
  try {
    const { userId, phone, code } = req.body;

    if (!userId || !phone || !code) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 简化验证：验证码只要是6位数字即可
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: '验证码错误'
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

    // 更新手机号
    user.phone = phone;
    user.updatedAt = formatDate();

    res.json({
      success: true,
      message: '手机号绑定成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '手机号绑定失败',
      error: error.message
    });
  }
};

/**
 * 获取登录记录
 */
exports.getLoginLogs = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 获取该用户的登录记录
    const userLogs = database.loginLogs.filter(log => log.userId === userId);

    // 按时间倒序排列，最多返回20条
    const logs = userLogs
      .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))
      .slice(0, 20);

    res.json({
      success: true,
      message: '获取登录记录成功',
      data: {
        list: logs,
        total: logs.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取登录记录失败',
      error: error.message
    });
  }
};

/**
 * 记录登录
 */
exports.recordLogin = (userId, loginType = 'phone', userInfo = {}) => {
  try {
    const log = {
      id: generateId(),
      userId,
      loginType,
      loginTime: formatDate(),
      ip: 'unknown',
      device: 'miniprogram',
      ...userInfo
    };

    database.loginLogs.push(log);

    return log;
  } catch (error) {
    console.error('记录登录失败:', error);
    return null;
  }
};

/**
 * 注销账号
 */
exports.deleteAccount = (req, res) => {
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

    // 删除用户数据
    database.users.delete(userId);
    database.members.delete(userId);
    database.carts.delete(userId);
    database.birthdayGifts.delete(userId);

    // 保留订单记录但标记为已注销
    database.orders.forEach(order => {
      if (order.userId === userId) {
        order.deleted = true;
        order.deletedAt = formatDate();
      }
    });

    res.json({
      success: true,
      message: '账号注销成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '账号注销失败',
      error: error.message
    });
  }
};
