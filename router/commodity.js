const express = require('express')
const router = express.Router() // 创建路由对象

const commodityHandler = require('../router_handler/commodity')  // 导入花路由处理函数模块

// 返回所有商品的类别(type),按该类数量多少排序
router.get('/getType', commodityHandler.getType)
// 根据花的编号获取花的详细信息
router.get('/commodity', commodityHandler.queryCommodityDetailed)
// 根据类别检索商品信息
router.post('/getCommodityByType', commodityHandler.getCommodityByType)
// 根据输入的关键字检索对应类型名称包含或者名称包含关键字的商品
router.get('/getIntentResult', commodityHandler.getIntentResult)
// 得到热门搜索数据
router.get('/getHotSearch', commodityHandler.getHotSearch)
// 得到最新上架的6件商品
router.get('/getNewLaunch', commodityHandler.getNewLaunch)
// 得到售出量最多的5件商品
router.get('/getHotBuy', commodityHandler.getHotBuy)
// 得到热门推荐的9条商品
router.get('/getHotRecommend/:page', commodityHandler.getHotRecommend)
// 得到搜索页搜索结果
router.post('/searchCommodity', commodityHandler.searchCommodity)
// 返回商品的所有评论
router.get('/getCommodityComments/:id', commodityHandler.getCommodityComments)
// 给商品的评论点赞
router.get('/likeComment/:id', commodityHandler.likeComment)

module.exports = router