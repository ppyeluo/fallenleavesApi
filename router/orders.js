/**
 * 处理所有和订单相关接口
 */
const express = require('express')
const router = express.Router()
const ordersHandler = require('../router_handler/orders')

// 查询用户的所有订单
router.get('/allOrders', ordersHandler.getAllOrders)
// 删除订单
router.delete('/deleteOrder/:id', ordersHandler.deleteOrder)

module.exports = router