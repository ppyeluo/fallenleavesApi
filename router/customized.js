const express = require('express')
const router = express.Router() // 创建路由对象
const customizedHandler = require('../router_handler/customized')  // 导入路由处理函数模块

// 得到所有花的分类名称和库存
router.get('/getCommodityCategroy', customizedHandler.getCommodityCategory)
// 得到热搜关键词和搜索次数
router.get('/getHotSearchKeywords', customizedHandler.getHotSearchKeywords)
// 得到热门销售数据
router.get('/getHotSaleCommodity', customizedHandler.getHotSaleCommodity)
module.exports = router