/**
 * 处理所有和用户相关接口
 */
const express = require('express')
const router = express.Router()
const userHandler = require('../router_handler/user')
// 获取用户信息
router.get('/userInfo', userHandler.userInfo)
// 用户登录
router.post('/login',userHandler.userLogin)
// 退出登录
router.get('/logout', userHandler.userLogout)
// 得到用户地址
router.get('/getUserAddress',userHandler.getUserAddress)
// 用户注册
router.post('/register',userHandler.userRegister)
module.exports = router