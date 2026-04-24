const express = require('express');

const router = express.Router();
const goodsController = require('../controllers/goodsController');
const { authMiddleware } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  addToCartSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
} = require('../middleware/validationMiddleware');

// 商品分类
router.get('/categories', goodsController.getCategories);

// 商品列表
router.get('/list', goodsController.getGoodsList);

// 商品详情
router.get('/detail/:id', goodsController.getGoodsDetail);

// 上传商品图片 - 需要认证
router.post(
  '/upload',
  authMiddleware,
  generalLimiter,
  goodsController.uploadImage
);

// 购物车 - 添加商品 - 需要认证
router.post(
  '/cart/add',
  authMiddleware,
  generalLimiter,
  validate(addToCartSchema),
  goodsController.addToCart
);

// 购物车 - 获取列表 - 需要认证
router.get(
  '/cart/list',
  authMiddleware,
  generalLimiter,
  goodsController.getCartList
);

// 购物车 - 更新商品数量 - 需要认证
router.put(
  '/cart/update',
  authMiddleware,
  generalLimiter,
  validate(updateCartItemSchema),
  goodsController.updateCartItem
);

// 购物车 - 删除商品 - 需要认证
router.delete(
  '/cart/delete',
  authMiddleware,
  generalLimiter,
  validate(deleteCartItemSchema),
  goodsController.deleteCartItem
);

// 购物车 - 清空 - 需要认证
router.post(
  '/cart/clear',
  authMiddleware,
  generalLimiter,
  goodsController.clearCart
);

module.exports = router;
