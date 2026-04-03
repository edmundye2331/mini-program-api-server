const { database, generateId, formatDate } = require('../config/database.js');

/**
 * 获取商品分类列表
 */
exports.getCategories = (req, res) => {
  try {
    const categories = database.goodsCategories.sort((a, b) => a.sort - b.sort);

    res.json({
      success: true,
      message: '获取分类成功',
      data: {
        list: categories,
        total: categories.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
};

/**
 * 获取商品列表
 * 支持按分类筛选
 */
exports.getGoodsList = (req, res) => {
  try {
    const { categoryId } = req.query;

    let goods = database.goods;

    // 如果指定了分类，进行筛选
    if (categoryId) {
      goods = goods.filter(item => item.categoryId === parseInt(categoryId));
    }

    // 只返回上架的商品
    goods = goods.filter(item => item.status === 'onsale');

    // 按排序字段排序
    goods = goods.sort((a, b) => a.sort - b.sort);

    res.json({
      success: true,
      message: '获取商品列表成功',
      data: {
        list: goods,
        total: goods.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取商品列表失败',
      error: error.message
    });
  }
};

/**
 * 获取商品详情
 */
exports.getGoodsDetail = (req, res) => {
  try {
    const { id } = req.params;

    const goods = database.goods.find(item => item.id === parseInt(id));

    if (!goods) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '获取商品详情成功',
      data: goods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message
    });
  }
};

/**
 * 添加商品到购物车
 */
exports.addToCart = (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || !quantity) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 查找商品
    const goods = database.goods.find(item => item.id === parseInt(goodsId));
    if (!goods) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 检查库存
    if (goods.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '库存不足'
      });
    }

    // 获取用户购物车
    let userCart = database.carts.get(userId);

    if (!userCart) {
      // 创建新购物车
      userCart = {
        userId,
        items: [],
        createdAt: formatDate(),
        updatedAt: formatDate()
      };
      database.carts.set(userId, userCart);
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

    userCart.updatedAt = formatDate();

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.json({
      success: true,
      message: '加入购物车成功',
      data: {
        cart: userCart,
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '加入购物车失败',
      error: error.message
    });
  }
};

/**
 * 获取购物车列表
 */
exports.getCartList = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const userCart = database.carts.get(userId);

    if (!userCart) {
      return res.json({
        success: true,
        message: '购物车为空',
        data: {
          items: [],
          totalAmount: 0
        }
      });
    }

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.json({
      success: true,
      message: '获取购物车成功',
      data: {
        items: userCart.items,
        totalAmount,
        updatedAt: userCart.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取购物车失败',
      error: error.message
    });
  }
};

/**
 * 更新购物车商品数量
 */
exports.updateCartItem = (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const userCart = database.carts.get(userId);

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: '购物车不存在'
      });
    }

    const item = userCart.items.find(item => item.goodsId === parseInt(goodsId));

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '商品不在购物车中'
      });
    }

    // 如果数量为0，删除商品
    if (quantity === 0) {
      userCart.items = userCart.items.filter(i => i.goodsId !== parseInt(goodsId));
    } else {
      item.quantity = quantity;
    }

    userCart.updatedAt = formatDate();

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.json({
      success: true,
      message: '更新购物车成功',
      data: {
        items: userCart.items,
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新购物车失败',
      error: error.message
    });
  }
};

/**
 * 删除购物车商品
 */
exports.deleteCartItem = (req, res) => {
  try {
    const { userId, goodsId } = req.body;

    if (!userId || !goodsId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const userCart = database.carts.get(userId);

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: '购物车不存在'
      });
    }

    userCart.items = userCart.items.filter(item => item.goodsId !== parseInt(goodsId));
    userCart.updatedAt = formatDate();

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.json({
      success: true,
      message: '删除商品成功',
      data: {
        items: userCart.items,
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除商品失败',
      error: error.message
    });
  }
};

/**
 * 清空购物车
 */
exports.clearCart = (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    const userCart = database.carts.get(userId);

    if (!userCart) {
      return res.json({
        success: true,
        message: '购物车已为空',
        data: {
          items: [],
          totalAmount: 0
        }
      });
    }

    userCart.items = [];
    userCart.updatedAt = formatDate();

    res.json({
      success: true,
      message: '清空购物车成功',
      data: {
        items: [],
        totalAmount: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '清空购物车失败',
      error: error.message
    });
  }
};
