const express = require('express')
const router = express.Router()
const cartHandler = require('../router_handler/cart')

router.get('/cart', cartHandler.getCartDetailed) // 得到购物车内详细信息
router.post('/addCart', cartHandler.addCart) // 向购物车内添加商品
// router.put('/updateCart', cartHandler.updateCart) // 更新购物车内的商品(增加或减少商品数量)
router.delete('/removeCart', cartHandler.removeCart)  // 删除购物车内的商品
router.delete('/batchRemoveCart', cartHandler.batchRemoveCart)    // 批量删除购物车内的商品

module.exports = router