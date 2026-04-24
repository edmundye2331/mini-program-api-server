/**
 * MySQL数据库适配层
 * 处理后端代码与MySQL schema之间的命名和数据结构差异
 *
 * 主要功能：
 * 1. 字段名转换: camelCase ↔ snake_case
 * 2. 数据结构转换: 处理orders.items, carts等复杂结构
 * 3. 类型转换: 处理balance等字段类型差异
 * 4. 统一接口: 模拟原有的内存数据库访问方式
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('./mysql');

class DatabaseAdapter {
  /**
   * ========================================
   * 字段名转换工具方法
   * ========================================
   */

  /**
   * camelCase 转 snake_case
   * 例: orderNo -> order_no
   */
  camelToSnake(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * snake_case 转 camelCase
   * 例: order_no -> orderNo
   */
  snakeToCamel(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 将对象的键从 camelCase 转为 snake_case
   */
  toSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.toSnakeCase(item));
    }

    const result = {};
    for (const key in obj) {
      const snakeKey = this.camelToSnake(key);
      result[snakeKey] = obj[key];
    }
    return result;
  }

  /**
   * 将对象的键从 snake_case 转为 camelCase
   */
  toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.toCamelCase(item));
    }

    const result = {};
    for (const key in obj) {
      const camelKey = this.snakeToCamel(key);
      result[camelKey] = obj[key];
    }
    return result;
  }

  /**
   * ========================================
   * 用户操作 (users)
   * ========================================
   */

  /**
   * 获取用户信息
   */
  async getUser(userId) {
    const user = await db.findOne('users', { id: userId });
    return user ? this.toCamelCase(user) : null;
  }

  /**
   * 通过手机号获取用户
   */
  async getUserByPhone(phone) {
    const user = await db.findOne('users', { phone });
    return user ? this.toCamelCase(user) : null;
  }

  /**
   * 通过微信openid获取用户
   */
  async getUserByWechatOpenid(openid) {
    const user = await db.findOne('users', { wechat_openid: openid });
    return user ? this.toCamelCase(user) : null;
  }

  /**
   * 创建用户
   */
  async createUser(userData) {
    const dbUser = this.toSnakeCase(userData);
    await db.insert('users', dbUser);
    return userData;
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId, userData) {
    const dbUser = this.toSnakeCase(userData);
    await db.update('users', dbUser, { id: userId });
    return userData;
  }

  /**
   * ========================================
   * 会员操作 (members)
   * ========================================
   */

  /**
   * 获取会员信息
   */
  async getMember(userId) {
    const member = await db.findOne('members', { user_id: userId });

    if (!member) return null;

    // 转换为camelCase并处理balance类型
    const result = this.toCamelCase(member);

    // 将balance转为字符串（后端期望）
    if (result.balance !== undefined) {
      result.balance = String(parseFloat(result.balance).toFixed(2));
    }

    return result;
  }

  /**
   * 创建会员
   */
  async createMember(memberData) {
    const dbMember = this.toSnakeCase(memberData);

    // 确保balance是数值类型
    if (typeof dbMember.balance === 'string') {
      dbMember.balance = parseFloat(dbMember.balance);
    }

    await db.insert('members', dbMember);
    return memberData;
  }

  /**
   * 更新会员信息
   */
  async updateMember(userId, memberData) {
    const dbMember = this.toSnakeCase(memberData);

    // 处理balance类型
    if (
      dbMember.balance !== undefined &&
      typeof dbMember.balance === 'string'
    ) {
      dbMember.balance = parseFloat(dbMember.balance);
    }

    await db.update('members', dbMember, { user_id: userId });
    return memberData;
  }

  /**
   * ========================================
   * 订单操作 (orders + order_items)
   * ========================================
   */

  /**
   * 创建订单（包含订单明细）
   */
  async createOrder(orderData) {
    const orderId = orderData.id || uuidv4();

    // 1. 转换字段名
    const dbOrder = this.toSnakeCase({
      ...orderData,
      id: orderId,
    });

    // 2. 提取items
    const items = dbOrder.items || [];
    delete dbOrder.items;
    delete dbOrder.item_count;
    delete dbOrder.items_total;

    // 3. 使用事务创建订单和订单明细
    await db.transaction(async (connection) => {
      // 插入订单主表
      await connection.execute(
        `INSERT INTO orders (
          id, order_no, user_id, store_id, order_type,
          total_amount, discount_amount, actual_amount,
          status, status_text, payment_method, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dbOrder.id,
          dbOrder.order_no,
          dbOrder.user_id,
          dbOrder.store_id || null,
          dbOrder.order_type,
          dbOrder.total_amount,
          dbOrder.discount_amount || 0,
          dbOrder.actual_amount,
          dbOrder.status || 'pending',
          dbOrder.status_text || '待付款',
          dbOrder.payment_method || null,
          dbOrder.remark || '',
        ]
      );

      // 批量插入订单明细
      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_image,
            product_price, quantity, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.goods_id || item.product_id,
            item.name,
            item.image || null,
            item.price,
            item.quantity,
            item.price * item.quantity,
          ]
        );
      }
    });

    // 4. 返回完整的订单对象（包含items）
    return await this.getOrder(orderId);
  }

  /**
   * 获取订单详情（包含items）
   */
  async getOrder(orderId) {
    // 1. 查询订单主表
    const order = await db.findOne('orders', { id: orderId });

    if (!order) return null;

    // 2. 查询订单明细
    const items = await db.findMany('order_items', { order_id: orderId });

    // 3. 转换为camelCase并重构items数组
    const result = this.toCamelCase(order);

    // 将order_items转换为后端期望的格式
    result.items = items.map((item) => ({
      goodsId: item.product_id,
      name: item.product_name,
      image: item.product_image,
      price: parseFloat(item.product_price),
      quantity: item.quantity,
      subtotal: parseFloat(item.subtotal),
    }));

    return result;
  }

  /**
   * 获取用户的订单列表
   */
  async getOrdersByUser(userId, options = {}) {
    const { orderType, status, limit = 20, offset = 0 } = options;

    // 构建查询条件
    const where = { user_id: userId };
    if (orderType) where.order_type = orderType;
    if (status) where.status = status;

    // 查询订单列表
    const orders = await db.findMany('orders', where, {
      orderBy: 'created_at',
      order: 'DESC',
      limit,
      offset,
    });

    // 为每个订单添加items
    const result = [];
    for (const order of orders) {
      const fullOrder = await this.getOrder(order.id);
      result.push(fullOrder);
    }

    return result;
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(orderId, status, statusText) {
    await db.update(
      'orders',
      {
        status,
        status_text: statusText,
      },
      { id: orderId }
    );
  }

  /**
   * 更新订单支付状态
   */
  async updateOrderPayment(orderId, paymentMethod, paymentTime) {
    const updateData = {
      payment_method: paymentMethod,
      status: 'paid',
      status_text: '已支付',
    };

    if (paymentTime) {
      updateData.paid_at = paymentTime;
    }

    await db.update('orders', updateData, { id: orderId });
  }

  /**
   * ========================================
   * 商品操作 (goods + goods_categories)
   * ========================================
   */

  /**
   * 获取商品分类列表
   */
  async getGoodsCategories() {
    const categories = await db.findMany(
      'goods_categories',
      { is_active: true },
      {
        orderBy: 'sort',
        order: 'ASC',
      }
    );

    return this.toCamelCase(categories);
  }

  /**
   * 获取商品列表
   */
  async getGoodsList(options = {}) {
    const { categoryId, status = 'onsale', limit, offset } = options;

    // 构建查询条件
    const where = {};
    if (categoryId) where.category_id = categoryId;
    if (status) where.status = status;

    // 查询商品
    const queryOptions = {
      orderBy: 'sort',
      order: 'ASC',
    };

    if (limit) queryOptions.limit = limit;
    if (offset) queryOptions.offset = offset;

    const goods = await db.findMany('goods', where, queryOptions);

    return this.toCamelCase(goods);
  }

  /**
   * 获取商品详情
   */
  async getGoodsDetail(goodsId) {
    const goods = await db.findOne('goods', { id: goodsId });
    return goods ? this.toCamelCase(goods) : null;
  }

  /**
   * ========================================
   * 购物车操作 (carts)
   * ========================================
   */

  /**
   * 获取用户购物车
   */
  async getCart(userId) {
    const cart = await db.findOne('carts', { user_id: userId });

    if (!cart) {
      // 返回空购物车结构
      return {
        userId,
        items: [],
        createdAt: null,
        updatedAt: null,
      };
    }

    // 重构完整的购物车对象
    return {
      userId: cart.user_id,
      items: cart.items ? JSON.parse(cart.items) : [],
      createdAt: cart.created_at,
      updatedAt: cart.updated_at,
    };
  }

  /**
   * 保存购物车
   */
  async saveCart(userId, cartData) {
    const cartId = uuidv4();
    const itemsJson = JSON.stringify(cartData.items || []);

    const dbCart = {
      id: cartId,
      user_id: userId,
      items: itemsJson,
      created_at: cartData.createdAt,
      updated_at: cartData.updatedAt,
    };

    // 检查是否已存在
    const existing = await db.findOne('carts', { user_id: userId });

    if (existing) {
      // 更新
      await db.update(
        'carts',
        {
          items: itemsJson,
          updated_at: cartData.updatedAt,
        },
        { user_id: userId }
      );
    } else {
      // 插入
      await db.insert('carts', dbCart);
    }

    return cartData;
  }

  /**
   * 清空购物车
   */
  async clearCart(userId) {
    await db.update(
      'carts',
      { items: JSON.stringify([]) },
      { user_id: userId }
    );
  }

  /**
   * ========================================
   * 门店操作 (stores)
   * ========================================
   */

  /**
   * 获取所有门店
   */
  async getStores(activeOnly = true) {
    const where = activeOnly ? { is_active: true } : {};
    const stores = await db.findMany('stores', where, {
      orderBy: 'sort',
      order: 'ASC',
    });

    return this.toCamelCase(stores);
  }

  /**
   * 获取门店详情
   */
  async getStore(storeId) {
    const store = await db.findOne('stores', { id: storeId });
    return store ? this.toCamelCase(store) : null;
  }

  /**
   * ========================================
   * 积分商品操作 (points_goods)
   * ========================================
   */

  /**
   * 获取积分商品列表
   */
  async getPointsGoods(activeOnly = true) {
    const where = activeOnly ? { is_active: true } : {};
    const goods = await db.findMany('points_goods', where, {
      orderBy: 'sort',
      order: 'ASC',
    });

    return this.toCamelCase(goods);
  }

  /**
   * 获取积分商品详情
   */
  async getPointsGoodsDetail(goodsId) {
    const goods = await db.findOne('points_goods', { id: goodsId });
    return goods ? this.toCamelCase(goods) : null;
  }

  /**
   * 扣减积分商品库存
   */
  async reducePointsGoodsStock(goodsId, quantity = 1) {
    await db.transaction(async (connection) => {
      // 获取当前库存
      const [rows] = await connection.execute(
        'SELECT stock FROM points_goods WHERE id = ? FOR UPDATE',
        [goodsId]
      );

      if (rows.length === 0) {
        throw new Error('积分商品不存在');
      }

      const currentStock = rows[0].stock;
      if (currentStock < quantity) {
        throw new Error('库存不足');
      }

      // 更新库存
      await connection.execute(
        'UPDATE points_goods SET stock = stock - ? WHERE id = ?',
        [quantity, goodsId]
      );
    });
  }

  /**
   * ========================================
   * 积分记录操作 (points_records)
   * ========================================
   */

  /**
   * 创建积分记录
   */
  async createPointsRecord(recordData) {
    const dbRecord = this.toSnakeCase(recordData);
    await db.insert('points_records', dbRecord);
    return recordData;
  }

  /**
   * 获取用户的积分记录
   */
  async getPointsRecords(userId, limit = 50) {
    const records = await db.findMany(
      'points_records',
      { user_id: userId },
      {
        orderBy: 'created_at',
        order: 'DESC',
        limit,
      }
    );

    return this.toCamelCase(records);
  }

  /**
   * ========================================
   * 兑换记录操作 (exchange_records)
   * ========================================
   */

  /**
   * 创建兑换记录
   */
  async createExchangeRecord(recordData) {
    const dbRecord = this.toSnakeCase(recordData);
    await db.insert('exchange_records', dbRecord);
    return recordData;
  }

  /**
   * 获取用户的兑换记录
   */
  async getExchangeRecords(userId, limit = 50) {
    const records = await db.findMany(
      'exchange_records',
      { user_id: userId },
      {
        orderBy: 'created_at',
        order: 'DESC',
        limit,
      }
    );

    return this.toCamelCase(records);
  }

  /**
   * ========================================
   * 充值记录操作 (recharge_records)
   * ========================================
   */

  /**
   * 创建充值记录
   */
  async createRechargeRecord(recordData) {
    const dbRecord = this.toSnakeCase({
      ...recordData,
      id: recordData.id || uuidv4(),
    });
    await db.insert('recharge_records', dbRecord);
    return recordData;
  }

  /**
   * 获取用户的充值记录
   */
  async getRechargeRecords(userId, limit = 50) {
    const records = await db.findMany(
      'recharge_records',
      { user_id: userId },
      {
        orderBy: 'created_at',
        order: 'DESC',
        limit,
      }
    );

    return this.toCamelCase(records);
  }

  /**
   * ========================================
   * 余额记录操作 (balance_records)
   * ========================================
   */

  /**
   * 创建余额记录
   */
  async createBalanceRecord(recordData) {
    const dbRecord = this.toSnakeCase({
      ...recordData,
      id: recordData.id || uuidv4(),
    });
    await db.insert('balance_records', dbRecord);
    return recordData;
  }

  /**
   * 获取用户的余额记录
   */
  async getBalanceRecords(userId, limit = 50) {
    const records = await db.findMany(
      'balance_records',
      { user_id: userId },
      {
        orderBy: 'created_at',
        order: 'DESC',
        limit,
      }
    );

    return this.toCamelCase(records);
  }

  /**
   * ========================================
   * 优惠券操作 (coupons)
   * ========================================
   */

  /**
   * 获取用户的优惠券列表
   */
  async getUserCoupons(userId, status = null) {
    const where = { user_id: userId };
    if (status) where.status = status;

    const coupons = await db.findMany('coupons', where, {
      orderBy: 'created_at',
      order: 'DESC',
    });

    return this.toCamelCase(coupons);
  }

  /**
   * 创建优惠券
   */
  async createCoupon(couponData) {
    const dbCoupon = this.toSnakeCase(couponData);
    await db.insert('coupons', dbCoupon);
    return couponData;
  }

  /**
   * ========================================
   * 协议操作 (protocols)
   * ========================================
   */

  /**
   * 获取协议内容（简化访问方式，模拟后端的简单对象）
   */
  async getProtocol(type) {
    const protocol = await db.findOne(
      'protocols',
      {
        type,
        is_active: true,
      },
      [],
      ['created_at'],
      'DESC'
    );

    return protocol ? protocol.content : null;
  }

  /**
   * 获取所有协议（返回对象格式，模拟后端数据结构）
   */
  async getAllProtocols() {
    const types = ['recharge', 'privacy', 'service', 'member'];
    const result = {};

    for (const type of types) {
      const protocol = await db.findOne(
        'protocols',
        {
          type,
          is_active: true,
        },
        [],
        ['created_at'],
        'DESC'
      );

      if (protocol) {
        result[type] = protocol.content;
      }
    }

    return result;
  }

  /**
   * ========================================
   * 生日礼操作 (birthday_gifts)
   * ========================================
   */

  /**
   * 获取用户的生日礼
   */
  async getBirthdayGift(userId, year) {
    const gift = await db.findOne('birthday_gifts', {
      user_id: userId,
      year,
    });

    return gift ? this.toCamelCase(gift) : null;
  }

  /**
   * 创建生日礼
   */
  async createBirthdayGift(giftData) {
    const dbGift = this.toSnakeCase({
      ...giftData,
      id: giftData.id || uuidv4(),
    });
    await db.insert('birthday_gifts', dbGift);
    return giftData;
  }

  /**
   * 领取生日礼
   */
  async claimBirthdayGift(userId, year) {
    await db.update(
      'birthday_gifts',
      {
        is_claimed: true,
        claimed_at: new Date(),
      },
      {
        user_id: userId,
        year,
      }
    );
  }

  /**
   * ========================================
   * 登录日志操作 (login_logs)
   * ========================================
   */

  /**
   * 创建登录日志
   */
  async createLoginLog(logData) {
    const dbLog = this.toSnakeCase({
      ...logData,
      id: logData.id || uuidv4(),
    });
    await db.insert('login_logs', dbLog);
    return logData;
  }

  /**
   * ========================================
   * 通用查询方法
   * ========================================
   */

  /**
   * 通用查询方法（自动转换字段名）
   */
  async findMany(tableName, where = {}, options = {}) {
    const dbWhere = this.toSnakeCase(where);
    const results = await db.findMany(tableName, dbWhere, options);
    return this.toCamelCase(results);
  }

  /**
   * 通用查询单条方法
   */
  async findOne(tableName, where = {}, fields = ['*']) {
    const dbWhere = this.toSnakeCase(where);
    const result = await db.findOne(tableName, dbWhere, fields);
    return result ? this.toCamelCase(result) : null;
  }

  /**
   * 通用计数方法
   */
  async count(tableName, where = {}) {
    const dbWhere = this.toSnakeCase(where);
    return await db.count(tableName, dbWhere);
  }
}

// 创建单例实例
const adapter = new DatabaseAdapter();

module.exports = adapter;
