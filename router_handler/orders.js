const db = require('../db/index')   // 导入数据库模块
const moment = require('moment')    // 时间处理库
const { sendResponse } = require('../utils/sendResponse') // 导入响应返回模块
const { decodeToken,decodeTokenFromRequest } = require('../utils/token')

// 得到用户订单
exports.getAllOrders = (req, res) => {
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id } = userInfo
    const sql = 'SELECT o.*, c.name, c.picture FROM orders o JOIN commodity c ON o.commodityId = c.id WHERE o.userId = ?'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql, [id], (err, results) => {
            connection.release()
            if(err){
                return sendResponse(res, 500)
            }
            // 遍历结果并格式化datetime列
            const formattedResults = results.map(row => {
                const formattedRow = { ...row } // 创建一个新对象，包含原始行的所有列
                formattedRow.generateDate = moment(row.generateDate).format('YYYY-MM-DD HH:mm:ss') // 格式化datetime列  
                return formattedRow
            })
            sendResponse(res, 200, 'ok', formattedResults)
        })
    })
}
// 删除订单
exports.deleteOrder = (req, res) => {
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id: userId } = userInfo
    const { id: orderId } = req.params // 获取订单号

    // 查看订单是否存在和是否属于用户
    const sql1 = 'SELECT * FROM orders WHERE id = ? AND userId = ?'
    // 构建 SQL 查询语句
    const sql2 = 'DELETE FROM orders WHERE id = ?'
    
    db.getConnection((err, connection) => {
        if (err) {
            return sendResponse(res, 500)
        }
        // 执行 SQL 查询
        connection.query(sql1, [orderId, userId], (err, results) => {
            if(err){
                connection.release()
                return sendResponse(res, 500)
            }else if(results.length === 0){
                connection.release()
                return sendResponse(res, 400)
            }

            connection.query(sql2, [orderId], (err, results) => {
                connection.release()
                if(err){
                    return sendResponse(res, 500)
                }
                sendResponse(res, 200, '删除成功')
            })
        })
    })
}
