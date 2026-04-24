const goodsService = require('../services/goodsService');
const userService = require('../services/userService');
const cartService = require('../services/cartService');

/**
 * @swagger
 * tags:
 *   name: 商品管理
 *   description: 商品相关API
 */

/**
 * @swagger
 * /api/v1/goods/categories:
 *   get:
 *     summary: 获取商品分类列表
 *     tags: [商品管理]
 *     responses:
 *       200:
 *         description: 商品分类列表获取成功
 *       500:
 *         description: 服务器内部错误
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await goodsService.getGoodsCategories();

    res.success(
      {
        list: categories,
        total: categories.length,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/goods/list:
 *   get:
 *     summary: 获取商品列表
 *     tags: [商品管理]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         type: integer
 *         description: 分类ID
 *       - in: query
 *         name: status
 *         type: string
 *         description: 商品状态（onsale/soldout），默认onsale
 *       - in: query
 *         name: limit
 *         type: integer
 *         description: 每页数量
 *       - in: query
 *         name: offset
 *         type: integer
 *         description: 偏移量
 *     responses:
 *       200:
 *         description: 商品列表获取成功
 *       500:
 *         description: 服务器内部错误
 */
/**
 * @swagger
 * /api/v1/goods/upload:
 *   post:
 *     summary: 上传商品图片
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 商品图片文件
 *     responses:
 *       200:
 *         description: 图片上传成功
 *       400:
 *         description: 文件格式错误或大小超限
 *       500:
 *         description: 服务器内部错误
 */
exports.uploadImage = (req, res) => {
  const uploadMiddleware = require('../middleware/uploadMiddleware');

  // 使用中间件处理文件上传
  uploadMiddleware.singleImageUpload(req, res, (err) => {
    if (err) {
      return res.error(err.message, 400);
    }

    // 检查文件是否上传成功
    if (!req.file) {
      return res.error('请选择要上传的图片文件', 400);
    }

    // 生成图片访问URL
    const imageUrl = `/images/${req.file.filename}`;

    res.success(
      {
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
      '图片上传成功',
      200,
      req
    );
  });
};

exports.getGoodsList = async (req, res) => {
  try {
    const { categoryId, status = 'onsale', limit, offset } = req.query;

    const options = {
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const goods = await goodsService.getGoodsList(options);

    res.success(
      {
        list: goods,
        total: goods.length,
      },
      'COMMON.SUCCESS',
      200,
      req
    );
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/goods/detail/{id}:
 *   get:
 *     summary: 获取商品详情
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 商品详情获取成功
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器内部错误
 */
exports.getGoodsDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const goods = await goodsService.getGoodsDetail(id);

    if (!goods) {
      return res.error('GOODS.GOODS_NOT_EXIST', 404, null, req);
    }

    res.success(goods, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/goods/cart/add:
 *   post:
 *     summary: 添加商品到购物车
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 required: true
 *                 description: 用户ID
 *               goodsId:
 *                 type: string
 *                 required: true
 *                 description: 商品ID
 *               quantity:
 *                 type: integer
 *                 required: true
 *                 description: 商品数量
 *     responses:
 *       200:
 *         description: 商品添加到购物车成功
 *       400:
 *         description: 请求参数错误或库存不足
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器内部错误
 */
exports.addToCart = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || !quantity) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    // 查找商品
    const goods = await goodsService.getGoodsDetail(goodsId);
    if (!goods) {
      return res.error('GOODS.GOODS_NOT_EXIST', 404, null, req);
    }

    // 检查库存
    if (goods.stock < quantity) {
      return res.error('GOODS.GOODS_STOCK_NOT_ENOUGH', 400, null, req);
    }

    const result = await cartService.addToCart(
      userId,
      goodsId,
      quantity,
      goods
    );

    res.success(result, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/goods/cart/list:
 *   get:
 *     summary: 获取购物车列表
 *     tags: [商品管理]
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
 *         description: 购物车列表获取成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.getCartList = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const result = await cartService.getCart(userId);

    res.success(result, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/goods/cart/update:
 *   post:
 *     summary: 更新购物车商品数量
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 required: true
 *                 description: 用户ID
 *               goodsId:
 *                 type: string
 *                 required: true
 *                 description: 商品ID
 *               quantity:
 *                 type: integer
 *                 required: true
 *                 description: 商品数量
 *     responses:
 *       200:
 *         description: 购物车商品数量更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;

    if (!userId || !goodsId || quantity === undefined) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const result = await cartService.updateCartItem(userId, goodsId, quantity);

    res.success(result, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/goods/cart/delete:
 *   post:
 *     summary: 删除购物车商品
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 required: true
 *                 description: 用户ID
 *               goodsId:
 *                 type: string
 *                 required: true
 *                 description: 商品ID
 *     responses:
 *       200:
 *         description: 购物车商品删除成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, goodsId } = req.body;

    if (!userId || !goodsId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const result = await cartService.deleteCartItem(userId, goodsId);

    res.success(result, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};

/**
 * @swagger
 * /api/v1/goods/cart/clear:
 *   post:
 *     summary: 清空购物车
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 required: true
 *                 description: 用户ID
 *     responses:
 *       200:
 *         description: 购物车清空成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.error('COMMON.BAD_REQUEST', 400, null, req);
    }

    const result = await cartService.clearCart(userId);

    res.success(result, 'COMMON.SUCCESS', 200, req);
  } catch (error) {
    res.error('COMMON.INTERNAL_ERROR', 500, error, req);
  }
};
