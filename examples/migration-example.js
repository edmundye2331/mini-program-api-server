/**
 * 商品Controller迁移示例
 * 展示如何从内存数据库迁移到MySQL（使用适配器）
 *
 * 文件位置: controllers/goodsController.js
 */

// ============================================
// 原有代码（使用内存数据库）
// ============================================
/*
const { database } = require('../config/database');

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

exports.addToCart = (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    // 获取商品信息
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
          totalAmount: 0,
          count: 0
        }
      });
    }

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 计算总数量
    const count = userCart.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    res.json({
      success: true,
      message: '获取购物车成功',
      data: {
        items: userCart.items,
        totalAmount,
        count
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
*/

// ============================================
// 迁移后的代码（使用MySQL适配器）
// ============================================

const adapter = require('../utils/databaseAdapter');

/**
 * 获取商品分类列表
 */
exports.getCategories = async (req, res) => {
  try {
    // 使用适配器获取分类列表
    const categories = await adapter.getGoodsCategories();

    res.json({
      success: true,
      message: '获取分类成功',
      data: {
        list: categories,
        total: categories.length
      }
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
};

/**
 * 获取商品列表
 */
exports.getGoodsList = async (req, res) => {
  try {
    const { categoryId } = req.query;

    // 使用适配器获取商品列表
    // 注意：适配器会自动处理字段名转换和筛选
    const goods = await adapter.getGoodsList({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      status: 'onsale'
    });

    res.json({
      success: true,
      message: '获取商品列表成功',
      data: {
        list: goods,
        total: goods.length
      }
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
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
exports.getGoodsDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 使用适配器获取商品详情
    const goods = await adapter.getGoodsDetail(parseInt(id));

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
    console.error('获取商品详情错误:', error);
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
exports.addToCart = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || !quantity) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 获取商品信息
    const goods = await adapter.getGoodsDetail(parseInt(goodsId));

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
    let userCart = await adapter.getCart(userId);

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

    userCart.updatedAt = new Date();

    // 保存购物车
    await adapter.saveCart(userId, userCart);

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
    console.error('加入购物车错误:', error);
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
exports.getCartList = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 使用适配器获取购物车
    const userCart = await adapter.getCart(userId);

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 计算总数量
    const count = userCart.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    res.json({
      success: true,
      message: '获取购物车成功',
      data: {
        items: userCart.items,
        totalAmount,
        count
      }
    });
  } catch (error) {
    console.error('获取购物车错误:', error);
    res.status(500).json({
      success: false,
      message: '获取购物车失败',
      error: error.message
    });
  }
};

/**
 * 从购物车删除商品
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, goodsId } = req.body;

    if (!userId || !goodsId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 获取购物车
    const userCart = await adapter.getCart(userId);

    // 过滤掉要删除的商品
    userCart.items = userCart.items.filter(item => item.goodsId !== parseInt(goodsId));

    userCart.updatedAt = new Date();

    // 保存购物车
    await adapter.saveCart(userId, userCart);

    res.json({
      success: true,
      message: '删除成功',
      data: userCart
    });
  } catch (error) {
    console.error('删除购物车商品错误:', error);
    res.status(500).json({
      success: false,
      message: '删除失败',
      error: error.message
    });
  }
};

/**
 * 更新购物车商品数量
 */
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 获取购物车
    const userCart = await adapter.getCart(userId);

    // 找到要更新的商品
    const item = userCart.items.find(item => item.goodsId === parseInt(goodsId));

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '商品不在购物车中'
      });
    }

    // 检查库存
    const goods = await adapter.getGoodsDetail(parseInt(goodsId));
    if (goods.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '库存不足'
      });
    }

    // 更新数量
    item.quantity = quantity;
    userCart.updatedAt = new Date();

    // 保存购物车
    await adapter.saveCart(userId, userCart);

    // 计算总价
    const totalAmount = userCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.json({
      success: true,
      message: '更新成功',
      data: {
        cart: userCart,
        totalAmount
      }
    });
  } catch (error) {
    console.error('更新购物车错误:', error);
    res.status(500).json({
      success: false,
      message: '更新失败',
      error: error.message
    });
  }
};

/**
 * 清空购物车
 */
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 使用适配器清空购物车
    await adapter.clearCart(userId);

    res.json({
      success: true,
      message: '清空购物车成功'
    });
  } catch (error) {
    console.error('清空购物车错误:', error);
    res.status(500).json({
      success: false,
      message: '清空失败',
      error: error.message
    });
  }
};

// ============================================
// 迁移要点总结
// ============================================

/*
1. 将 `const { database } = require('../config/database')` 改为 `const adapter = require('../utils/databaseAdapter')`

2. 将所有同步函数改为异步函数 (添加 async 关键字)
   - exports.getGoodsList = (req, res) => { ... }
   + exports.getGoodsList = async (req, res) => { ... }

3. 所有数据库操作前添加 await 关键字
   - const goods = database.goods
   + const goods = await adapter.getGoodsList()

4. 适配器会自动处理：
   - 字段名转换 (camelCase ↔ snake_case)
   - 数据排序
   - 状态筛选
   - 购物车完整对象构建

5. 错误处理保持不变，使用 try-catch

6. 返回给前端的字段名保持 camelCase 格式（适配器自动转换）

7. 新增功能（如清空购物车、更新数量）更容易实现
*/

// ============================================
// 迁移检查清单
// ============================================

/*
迁移前检查：
□ 确保已配置 .env 文件中的 MySQL 连接信息
□ 确保已导入 complete-schema.sql
□ 确保已安装依赖 npm install mysql2

迁移步骤：
□ 1. 引入适配器替代原有的 database
□ 2. 将所有函数改为 async
□ 3. 所有数据库操作添加 await
□ 4. 移除手动过滤、排序代码（适配器自动处理）
□ 5. 测试所有API端点
□ 6. 验证返回数据格式正确

迁移后验证：
□ 所有API正常返回数据
□ 字段名都是 camelCase 格式
□ 购物车、订单等复杂结构正确
□ 错误处理正常工作
*/
