/**
 * 购物车服务层
 * 处理购物车相关业务逻辑
 */

const cartDao = require('../dao/cartDao');
const goodsDao = require('../dao/goodsDao');
const { generateId, formatDate } = require('../config/mysql');

/**
 * 获取用户购物车
 * @param {String} userId - 用户ID
 * @returns {Object} 购物车信息
 */
const getCart = async (userId) => {
  const cart = await cartDao.findByUserId(userId);

  if (!cart) {
    return {
      items: [],
      totalAmount: 0,
      updatedAt: null,
    };
  }

  // 解析购物车商品
  let items = [];
  if (cart.items) {
    try {
      // 检查cart.items的类型，只有字符串需要解析
      if (typeof cart.items === 'string') {
        // 检查字符串是否是有效的JSON格式
        if (
          cart.items.trim().startsWith('[') &&
          cart.items.trim().endsWith(']')
        ) {
          items = JSON.parse(cart.items) || [];
        } else if (cart.items === '[object Object]') {
          // 处理 "[object Object]" 这种无效JSON格式
          items = [];
        } else {
          items = [];
        }
      } else if (Array.isArray(cart.items)) {
        // 如果已经是数组，直接使用
        items = cart.items;
      } else {
        // 其他情况，初始化为空数组
        items = [];
      }
    } catch (error) {
      console.error('解析购物车商品失败:', error);
      items = [];
    }
  }

  // 计算总价
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return {
    items,
    totalAmount,
    updatedAt: cart.updated_at,
  };
};

/**
 * 添加商品到购物车
 * @param {String} userId - 用户ID
 * @param {String} goodsId - 商品ID
 * @param {Number} quantity - 商品数量
 * @param {Object} [goodsInfo] - 商品信息（可选）
 * @returns {Object} 更新后的购物车信息
 */
const addToCart = async (userId, goodsId, quantity, goodsInfo = null) => {
  // 获取商品信息
  if (!goodsInfo) {
    goodsInfo = await goodsDao.findById(goodsId);
    if (!goodsInfo) {
      throw new Error('商品不存在');
    }
  }

  // 检查库存
  if (goodsInfo.stock < quantity) {
    throw new Error('库存不足');
  }

  // 获取现有购物车
  const cart = await cartDao.findByUserId(userId);
  let items = [];

  if (cart) {
    try {
      // 检查cart.items的类型，只有字符串需要解析
      if (typeof cart.items === 'string') {
        // 检查字符串是否是有效的JSON格式
        if (
          cart.items.trim().startsWith('[') &&
          cart.items.trim().endsWith(']')
        ) {
          items = JSON.parse(cart.items) || [];
        } else if (cart.items === '[object Object]') {
          // 处理 "[object Object]" 这种无效JSON格式
          items = [];
        } else {
          items = [];
        }
      } else if (Array.isArray(cart.items)) {
        // 如果已经是数组，直接使用
        items = cart.items;
      } else {
        // 其他情况，初始化为空数组
        items = [];
      }
    } catch (error) {
      console.error('解析购物车商品失败:', error);
      items = [];
    }
  }

  // 检查商品是否已在购物车中
  const existingItemIndex = items.findIndex((item) => item.goodsId === goodsId);

  if (existingItemIndex !== -1) {
    // 更新数量
    items[existingItemIndex].quantity += quantity;
  } else {
    // 添加新商品
    items.push({
      goodsId,
      name: goodsInfo.name,
      price: goodsInfo.price,
      image: goodsInfo.image,
      quantity,
    });
  }

  // 更新购物车
  if (cart) {
    await cartDao.update(
      {
        items: JSON.stringify(items),
        updated_at: formatDate(),
      },
      { user_id: userId }
    );
  } else {
    await cartDao.insert({
      id: generateId(),
      user_id: userId,
      items: JSON.stringify(items),
      created_at: formatDate(),
      updated_at: formatDate(),
    });
  }

  // 计算总价
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return {
    items,
    totalAmount,
    updatedAt: formatDate(),
  };
};

/**
 * 更新购物车商品数量
 * @param {String} userId - 用户ID
 * @param {String} goodsId - 商品ID
 * @param {Number} quantity - 商品数量
 * @returns {Object} 更新后的购物车信息
 */
const updateCartItem = async (userId, goodsId, quantity) => {
  const cart = await cartDao.findByUserId(userId);

  if (!cart) {
    throw new Error('购物车不存在');
  }

  let items = [];
  try {
    // 检查cart.items的类型，只有字符串需要解析
    if (typeof cart.items === 'string') {
      // 检查字符串是否是有效的JSON格式
      if (
        cart.items.trim().startsWith('[') &&
        cart.items.trim().endsWith(']')
      ) {
        items = JSON.parse(cart.items) || [];
      } else if (cart.items === '[object Object]') {
        // 处理 "[object Object]" 这种无效JSON格式
        items = [];
      } else {
        items = [];
      }
    } else if (Array.isArray(cart.items)) {
      // 如果已经是数组，直接使用
      items = cart.items;
    } else {
      // 其他情况，初始化为空数组
      items = [];
    }
  } catch (error) {
    console.error('解析购物车商品失败:', error);
    items = [];
  }

  const itemIndex = items.findIndex((item) => item.goodsId === goodsId);

  if (itemIndex === -1) {
    throw new Error('商品不在购物车中');
  }

  // 如果数量为0，删除商品
  if (quantity === 0) {
    items = items.filter((i) => i.goodsId !== goodsId);
  } else {
    items[itemIndex].quantity = quantity;
  }

  await cartDao.update(
    {
      items: JSON.stringify(items),
      updated_at: formatDate(),
    },
    { user_id: userId }
  );

  // 计算总价
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return {
    items,
    totalAmount,
    updatedAt: formatDate(),
  };
};

/**
 * 删除购物车商品
 * @param {String} userId - 用户ID
 * @param {String} goodsId - 商品ID
 * @returns {Object} 更新后的购物车信息
 */
const deleteCartItem = async (userId, goodsId) => {
  const cart = await cartDao.findByUserId(userId);

  if (!cart) {
    throw new Error('购物车不存在');
  }

  let items = [];
  try {
    // 检查cart.items的类型，只有字符串需要解析
    if (typeof cart.items === 'string') {
      // 检查字符串是否是有效的JSON格式
      if (
        cart.items.trim().startsWith('[') &&
        cart.items.trim().endsWith(']')
      ) {
        items = JSON.parse(cart.items) || [];
      } else if (cart.items === '[object Object]') {
        // 处理 "[object Object]" 这种无效JSON格式
        items = [];
      } else {
        items = [];
      }
    } else if (Array.isArray(cart.items)) {
      // 如果已经是数组，直接使用
      items = cart.items;
    } else {
      // 其他情况，初始化为空数组
      items = [];
    }
  } catch (error) {
    console.error('解析购物车商品失败:', error);
    items = [];
  }

  items = items.filter((item) => item.goodsId !== goodsId);

  await cartDao.update(
    {
      items: JSON.stringify(items),
      updated_at: formatDate(),
    },
    { user_id: userId }
  );

  // 计算总价
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return {
    items,
    totalAmount,
    updatedAt: formatDate(),
  };
};

/**
 * 清空购物车
 * @param {String} userId - 用户ID
 * @returns {Object} 清空后的购物车信息
 */
const clearCart = async (userId) => {
  // 先检查购物车是否存在
  const cart = await cartDao.findByUserId(userId);

  if (cart) {
    // 购物车存在，直接更新
    await cartDao.update(
      {
        items: JSON.stringify([]),
        updated_at: formatDate(),
      },
      { user_id: userId }
    );
  } else {
    // 购物车不存在，创建新的空购物车
    await cartDao.insert({
      id: generateId(),
      user_id: userId,
      items: JSON.stringify([]),
      created_at: formatDate(),
      updated_at: formatDate(),
    });
  }

  return {
    items: [],
    totalAmount: 0,
    updatedAt: formatDate(),
  };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
