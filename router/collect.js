const express = require('express')
const router  = express.Router()

const collectHandler = require('../router_handler/collect')

router.get('/collect', collectHandler.getCollect)   // 得到我的收藏中的所有商品
router.post('/addCollect', collectHandler.addCollect)   // 向我的收藏中添加商品
router.delete('/removeCollect/:id', collectHandler.removeCollect) // 从我的收藏中删除商品

module.exports = router