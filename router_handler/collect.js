const db = require('../db/index')
const log = require('../log/log')   // 导入日志处理模块
const { sendResponse } = require('../utils/sendResponse')
const { decodeTokenFromRequest, decodeToken } = require('../utils/token')


// 得到我的收藏中的所有商品，流式传输
exports.getCollect = (req, res) => {
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id } = userInfo
    const sql = 'SELECT collect.*, commodity.name, commodity.flowerLanguage, commodity.picture FROM collect INNER JOIN commodity ON collect.commodityId = commodity.id WHERE collect.userId = ?'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        const query = connection.query(sql, [id])

        res.setHeader('Content-Type', 'application/json')   // 设置响应头，指定相应内容类型为JSON格式
        res.setHeader('Transfer-Encoding', 'chunked')   // 启用分块传输编码，确保响应以流的形式传输

        let responseData = [] // 用于存储查询结果数据
        query.on('error', err => {
            connection.release()
            return sendResponse(res, 500)
        })

        query.on('result', row => {
            responseData.push(row) // 将每一行数据存入 responseData 数组
            connection.pause()  // 暂停数据接收
            connection.resume() // 回复数据接收
        });

        query.on('end', () => {
            connection.release()
            const responseObject = {
                code: 200,
                message: 'ok',
                data: responseData // 将 responseData 数组作为数据返回
            }
            res.end(JSON.stringify(responseObject))
        })
    })
}
// 向我的收藏中添加商品
exports.addCollect = (req, res) => {
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id } = userInfo
    const { id: commodityId }  = req.body

    // 查看是否已经收藏过了
    const sql1 = 'SELECT * from collect WHERE userId = ? AND commodityId = ?'
    // 没收藏过加入收藏
    const sql2 = 'INSERT INTO collect (userId, commodityId) VALUES (?, ?)'

    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql1, [id, commodityId], (err, results) => {
            if(err){
                connection.release()
                return sendResponse(res, 500)
            }
            if(results.length > 0){
                connection.release()
                return sendResponse(res, 200, '商品已经收藏过了', {isSuccess: false})
            }else{
                connection.query(sql2, [id, commodityId],(err, results) => {
                    connection.release()
                    if(err){
                        return sendResponse(res, 500)
                    }
                    sendResponse(res, 200, 'ok',{isSuccess: true})
                })
            }
        })
    })
}
// 从我的收藏中删除商品
exports.removeCollect = (req, res) => {
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id } = userInfo
    const { id: commodityId }  = req.params
    
    // 查看商品是否存在于收藏中
    const sql1 = 'SELECT * FROM collect WHERE userId = ? AND commodityId = ?'
    // 存在才删除
    const sql2 = 'DELETE FROM collect WHERE userId = ? AND commodityId = ?'

    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql1, [id, commodityId], (err, results) => {
            if(err){
                connection.release()
                return sendResponse(res, 500)
            }
            if(results.length <= 0){
                connection.release()
                return sendResponse(res, 400, '商品还未收藏过不能取消收藏')
            }else{
                connection.query(sql2, [id, commodityId],(err, results) => {
                    connection.release()
                    if(err){
                        return sendResponse(res, 500)
                    }
                    sendResponse(res, 200, '删除成功')
                })
            }
        })
    })
}