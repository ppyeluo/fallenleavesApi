const db = require('../db/index')
const log = require('../log/log')   // 导入日志处理模块
const path = require('path')
const { sendResponse } = require('../utils/sendResponse') // 导入响应返回模块
const { generateToken, decodeTokenFromRequest } = require('../utils/token')
// 获取用户信息
exports.userInfo = (req, res) => {
  // 解码请求头中的token并根据它获取用户信息
  const userInfo = decodeTokenFromRequest(req)
  if (!userInfo) {
    // 如果请求头中没有 token，则返回 401 Unauthorized
    return sendResponse(res, 401)
  }
  sendResponse(res, 200, 'ok', userInfo)
}

// 用户登录
exports.userLogin = (req, res) => {
    const { phone, password } = req.body
    const sql = 'SELECT * FROM user WHERE phone = ? AND password = ?'

    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)   // 数据库连接错误
        }
        connection.query(sql, [phone, password], (err, results) => {
            connection.release()
            if(err) {
                return sendResponse(res, 400, 'Bad Request')
            }
            if(results.length > 0){
                // 生成jwt令牌
                const payload = results[0]
                const token = generateToken(payload)
                sendResponse(res, 200, 'ok', token)
                log(`账号：${phone}，登录成功`)
            }else{
                sendResponse(res, 200, '用户名或密码错误',null)
            }
        })
    })
}
// 退出登录
exports.userLogout = (req, res) => {
    if (decodeTokenFromRequest(req)) {
        sendResponse(res, 200, 'Logout successful')
    }else{
        sendResponse(res, 400, 'No token provided')
    }
}

// 得到用户地址信息
exports.getUserAddress = (req, res) => {
  const { id } = decodeTokenFromRequest(req)

    const sql = 'SELECT * FROM address WHERE user_id = ?'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql, [id], (err, results) => {
            connection.release()
            if(err){
                return sendResponse(res, 400, 'Bad Request')
            }
            sendResponse(res, 200, 'ok',results)
        })
    })
}
// 用户注册
exports.userRegister = async (req, res) => {
    const { phone, password} = req.body
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        // 检查手机号是否已经被注册
        connection.query('SELECT COUNT(*) AS count FROM user WHERE phone = ?', [phone], (err, results) => {
            if(err){
                return sendResponse(res, 400, 'Bad Request')
            }else if(results[0].count > 0) {
                return sendResponse(res, 409, '手机号已被注册')
            }
            // 生成随机用户名
            const username = `leaves-${Math.floor(Math.random() * 10000)}`
            const avatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
            const tag = '普通会员'
            // 将注册信息保存到数据库中
            connection.query('INSERT INTO user (username, phone, password, avatar, tag) VALUES (?, ?, ?, ?, ?)', [username, phone, password, avatar, tag], (err, results) => {
                if(err){
                    return sendResponse(res, 400, 'Bad Request')
                }
                connection.query('SELECT * FROM user WHERE phone = ?', [phone], (err, results) => {
                    if(err){
                        return sendResponse(res, 500, '未知错误')
                    }
                    const payload =  results[0]
                    const token = generateToken(payload)
                    sendResponse(res, 200, '注册成功',token)
                    log(`账号：${phone}，注册成功`)
                })
            })
            
        })
    })
}
exports.uploadAvatar = (req, res) => {
    if (!req.file) {
        return sendResponse(res, 400, '没有上传文件')
    }
    // 获取上传文件的相对路径
    const filePath = path.join('static/user', req.file.filename)
    
    // 返回上传文件的访问URL
    return sendResponse(res, 200, 'ok', { avatar: `http://47.116.49.82/${filePath}` })
}