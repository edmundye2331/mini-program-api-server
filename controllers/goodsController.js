const { db, generateId, formatDate } = require('../config/mysql.js');

/**
 * 获取商品分类列表
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await db.findMany('goods_categories', {}, { orderBy: 'sort', order: 'ASC' });

    res.success({
      list: categories,
      total: categories.length
    }, '获取分类成功');
  } catch (error) {
    res.error('获取分类失败', 500, error);
  }
};

/**
 * 获取商品列表
 * 支持按分类筛选
 */
exports.getGoodsList = async (req, res) => {
  try {
    const { categoryId } = req.query;

    let where = {};

    // 如果指定了分类，进行筛选
    if (categoryId) {
      where.category_id = parseInt(categoryId);
    }

    // 只返回上架的商品
    where.status = 'onsale';

    // 查询数据库
    const goods = await db.findMany('goods', where, { orderBy: 'sort', order: 'ASC' });

    res.success({
      list: goods,
      total: goods.length
    }, '获取商品列表成功');
  } catch (error) {
    res.error('获取商品列表失败', 500, error);
  }
};

/**
 * 获取商品详情
 */
exports.getGoodsDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const goods = await db.findOne('goods', { id: parseInt(id) });

    if (!goods) {
      return res.error('商品不存在', 404);
    }

    res.success(goods, '获取商品详情成功');
  } catch (error) {
    res.error('获取商品详情失败', 500, error);
  }
};

/**
 * 添加商品到购物车
 */
exports.addToCart = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || !quantity) {
      return res.error('缺少必要参数', 400);
    }

    // 查找商品
    const goods = await db.findOne('goods', { id: parseInt(goodsId) });
    if (!goods) {
      return res.error('商品不存在', 404);
    }

    // 检查库存
    if (goods.stock < quantity) {
      return res.error('库存不足', 400);
    }

    // 获取用户购物车
    let userCart = await db.findOne('carts', { user_id: userId });

    if (!userCart) {
      // 创建新购物车
      const newCart = {
        id: generateId(),
        user_id: userId,
        items: [],
        created_at: formatDate(),
        updated_at: formatDate()
      };
      await db.insert('carts', newCart);
      userCart = newCart;
    }

    // 检查商品是否已在购物车中
    const existingItem = userCart.items.find(item => item.goodsId === parseInt(goodsId));

    if (existingItem) {
      // 更新数量
      existingItem.quantity += quantity;
    } else {
      // 添加新商品
      userCart.items.push({
        goodsId: parseInt(goodsId),
        name: goods.name,
        price: goods.price,
        image: goods.image,
        quantity
      });
    }

    userCart.updated_at = formatDate();

    // 更新购物车
    await db.update('carts', {
      items: userCart.items,
      updated_at: userCart.updated_at
    }, { user_id: userId });

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.success({
      cart: userCart,
      totalAmount
    }, '加入购物车成功');
  } catch (error) {
    res.error('加入购物车失败', 500, error);
  }
};

/**
 * 获取购物车列表
 */
exports.getCartList = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    const userCart = await db.findOne('carts', { user_id: userId });

    if (!userCart) {
      return res.success({
        items: [],
        totalAmount: 0
      }, '购物车为空');
    }

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.success({
      items: userCart.items,
      totalAmount,
      updatedAt: userCart.updated_at
    }, '获取购物车成功');
  } catch (error) {
    res.error('获取购物车失败', 500, error);
  }
};

/**
 * 更新购物车商品数量
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || quantity === undefined) {
      return res.error('缺少必要参数', 400);
    }

    const userCart = await db.findOne('carts', { user_id: userId });

    if (!userCart) {
      return res.error('购物车不存在', 404);
    }

    const item = userCart.items.find(item => item.goodsId === parseInt(goodsId));

    if (!item) {
      return res.error('商品不在购物车中', 404);
    }

    // 如果数量为0，删除商品
    if (quantity === 0) {
      userCart.items = userCart.items.filter(i => i.goodsId !== parseInt(goodsId));
    } else {
      item.quantity = quantity;
    }

    userCart.updated_at = formatDate();

    // 更新购物车
    await db.update('carts', {
      items: userCart.items,
      updated_at: userCart.updated_at
    }, { user_id: userId });

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.success({
      items: userCart.items,
      totalAmount
    }, '更新购物车成功');
  } catch (error) {
    res.error('更新购物车失败', 500, error);
  }
};

/**
 * 删除购物车商品
 */
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, goodsId } = req.body;

    if (!userId || !goodsId) {
      return res.error('缺少必要参数', 400);
    }

    const userCart = await db.findOne('carts', { user_id: userId });

    if (!userCart) {
      return res.error('购物车不存在', 404);
    }

    userCart.items = userCart.items.filter(item => item.goodsId !== parseInt(goodsId));
    userCart.updated_at = formatDate();

    // 更新购物车
    await db.update('carts', {
      items: userCart.items,
      updated_at: userCart.updated_at
    }, { user_id: userId });

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.success({
      items: userCart.items,
      totalAmount
    }, '删除商品成功');
  } catch (error) {
    res.error('删除商品失败', 500, error);
  }
};

/**
 * 清空购物车
 */
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.error('缺少用户ID', 400);
    }

    const userCart = await db.findOne('carts', { user_id: userId });

    if (!userCart) {
      return res.success({
        items: [],
        totalAmount: 0
      }, '购物车已为空');
    }

    userCart.items = [];
    userCart.updated_at = formatDate();

    // 更新购物车
    await db.update('carts', {
      items: userCart.items,
      updated_at: userCart.updated_at
    }, { user_id: userId });

    res.success({
      items: [],
      totalAmount: 0
    }, '清空购物车成功');
  } catch (error) {
    res.error('清空购物车失败', 500, error);
  }
};
