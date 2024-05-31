/**
 * 处理所有和用户相关接口
 */
const express = require('express')
const router = express.Router()
const userHandler = require('../router_handler/user')
const multer = require('multer')
// 设置文件存储路径
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/var/www/fallenleaves/static/user/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})
// 配置multer中间件
const upload = multer({ storage })

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
// 上传头像
router.post('/uploadAvatar', upload.single('avatar'), userHandler.uploadAvatar)

module.exports = router