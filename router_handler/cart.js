const db = require('../db/index')
const log = require('../log/log')
const { sendResponse } = require('../utils/sendResponse')
const { decodeTokenFromRequest, decodeToken } = require('../utils/token')

// 得到用户购物车内的详细
exports.getCartDetailed = (req, res) => {
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id } = userInfo
    // 返回 用户id、商品id、图片、名称、花语、单价、数量
    const sql = 'SELECT cart.*, commodity.name, commodity.picture, commodity.flowerLanguage, commodity.price, commodity.bank FROM cart JOIN commodity ON cart.commodityId = commodity.id WHERE cart.userId = ?'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql, [id], (err, results) => {
            connection.release()
            if(err){
                return sendResponse(res, 500)
            }
            sendResponse(res, 200, 'ok', results)
        })
    })
}

// 用户向购物车内添加商品
exports.addCart = (req, res) => {
    const { id: commodityId, count } = req.body
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id: userId } = userInfo

    // 查看购物车中是否已有该商品
    const sql1 = 'SELECT count FROM cart WHERE userId = ? AND commodityId = ?'
    // 没有该商品直接加进去
    const sql2 = 'INSERT INTO cart (count, userId, commodityId) values (?, ?, ?)'
    // 有该商品更新商品数量
    const sql3 = 'UPDATE cart SET count = count + ? WHERE userId = ? AND commodityId = ?'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql1, [userId, commodityId], (err, results) => {
            if(err){
                connection.release()
                return sendResponse(res, 500)
            }
            const sql = results.length === 0 ? sql2 : sql3
            connection.query(sql, [count, userId, commodityId], (err, results) => {
                connection.release()
                if(err){
                    return sendResponse(res, 500)
                }
                sendResponse(res, 200, '加入购物车成功')
            })
        })
    })
}

// 更新购物车内的商品(增加或减少商品数量)
exports.updateCart = (req, res) => {
    const { phone, id, count} = req.body

    // 检查参数是否存在
    if(!phone || !id || !count || count <= 0){
        res.status(400).json({ error: '参数提供不完整' })
        return
    }
    // 检索出用户要更新的商品原数量
    const sql1 = 'SELECT count FROM cart WHERE phone = ? AND id = ?'
    // 更新记录
    const sql2 = 'UPDATE cart SET count = ? WHERE phone = ? AND id = ?'
    db.getConnection((err,connection) => {
        if(err){
            res.status(500).json({ error: '服务器内部错误1' })
            return
        }
        connection.query(sql1, [phone, id], (err, results) => {
            if(err){
                res.status(500).json({ error: '服务器内部错误2' })
                return
            }
            if(results.length === 0){
                res.status(404).json({ error: '购物车中不存在该商品' })
                return
            }
            const orginCount = results[0].count

            connection.query(sql2, [count, phone, id], (err, removeResults) => {
                connection.release()
                if(err){
                    res.status(500).json({ error: '服务器内部错误3' })
                    return
                }
                res.json({ success: true, message: '更新成功' })
            })
            log(`用户：${phone} 从购物车中更新编号为 ${id} 的商品数量从 ${orginCount} 变为 ${count} 件。`)
        })
    })
}

// 删除购物车内的商品
exports.removeCart = (req, res) => {
    const { id: commodityId, count } = req.body
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    const { id: userId } = userInfo
    
    // 查看该商品在购物车中的数量
    const sql1 = 'SELECT count FROM cart WHERE userId = ? AND commodityId = ?'
    // 要删除的数量小于存在数量
    const sql2 = 'UPDATE cart SET count = count - ? WHERE userId = ? AND commodityId = ?'
    // 要删除的数量大于存在数量
    const sql3 = 'DELETE FROM cart WHERE userId = ? AND commodityId = ?'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql1, [userId, commodityId], (err, results) => {
            if(err){
                connection.release()
                return sendResponse(res, 500)
            }else if(results.length === 0 || results[0].count < count){
                connection.release()
                return sendResponse(res, 400)
            }
            if(results[0].count > count){
                connection.query(sql2, [count, userId, commodityId], (err, results) => {
                    connection.release()
                    if(err){
                        return sendResponse(res, 500)
                    }
                    sendResponse(res, 200, '删除成功')
                })
            }else if(results[0].count == count){
                connection.query(sql3, [userId, commodityId], (err, addResults) => {
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

// 批量删除购物车内的商品
exports.batchRemoveCart = (req, res) => {
    let { 'numberList[]': numberList } = req.body
    if(!Array.isArray(numberList)){ // 当numberList只有一项时，不是数组，转成数组
        numberList = [numberList]
    }
    const userInfo = decodeTokenFromRequest(req)
    if (!userInfo) {
        sendResponse(res, 401)
    }
    if (numberList.length === 0) {
        return sendResponse(res, 400)
    }
    const { id: userId } = userInfo

    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release()
                return sendResponse(res, 500)
            }

            const placeholders = numberList.map(() => '?').join(',')
            const sql = `DELETE FROM cart WHERE userId = ? AND commodityId IN (${placeholders})`
            const values = [userId, ...numberList]

            connection.query(sql, values, (err) => {
                if (err) {
                    connection.rollback(() => {
                        connection.release()
                        return sendResponse(res, 500)
                    })
                } else {
                    connection.commit((err) => {
                        connection.release()
                        if (err) {
                            connection.rollback(() => {
                                return sendResponse(res, 500)
                            })
                        } else {
                            sendResponse(res, 200, '删除成功',{ deletedCount: numberList.length} )
                        }
                    })
                }
            })
        })
    })
}