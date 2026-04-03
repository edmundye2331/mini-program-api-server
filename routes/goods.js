const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goodsController');

// 商品分类
router.get('/categories', goodsController.getCategories);

// 商品列表
router.get('/list', goodsController.getGoodsList);

// 商品详情
router.get('/detail/:id', goodsController.getGoodsDetail);

// 购物车 - 添加商品
router.post('/cart/add', goodsController.addToCart);

// 购物车 - 获取列表
router.get('/cart/list', goodsController.getCartList);

// 购物车 - 更新商品数量
router.put('/cart/update', goodsController.updateCartItem);

// 购物车 - 删除商品
router.delete('/cart/delete', goodsController.deleteCartItem);

// 购物车 - 清空
router.post('/cart/clear', goodsController.clearCart);

module.exports = router;
