/**
 * 在这里定义和花相关的路由处理函数，供/router/commodity.js模块进行调用
 */
const moment = require('moment')    // 时间处理库
const db = require('../db/index')   // 导入数据库模块
const log = require('../log/log')   // 导入日志处理模块
const { sendResponse } = require('../utils/sendResponse') // 导入响应返回模块
const { generateToken, decodeToken } = require('../utils/token')

// 返回所有商品的类别(type),按该类数量多少排序
exports.getType = (req, res) => {
    const sql = 'SELECT t.type, t.typeName, COUNT(c.type) AS typeCount FROM type t LEFT JOIN commodity c ON t.type = c.type GROUP BY t.type, t.typeName'

    db.getConnection((err, connection) => {
        if(err) {
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if(err) {
                return sendResponse(res, 500)
            }
            return sendResponse(res, 200, 'ok', results)
        })
    })
}
// 根据编号获取花的详细信息
exports.queryCommodityDetailed = (req, res) => {
    const { id } = req.query
    const sql = 'SELECT commodity.*, GROUP_CONCAT(commoditypicture.imgUrl) AS imgUrls FROM commodity LEFT JOIN commoditypicture ON commodity.id = commoditypicture.id WHERE commodity.id = ? GROUP BY commodity.id'
    db.getConnection((err, connection) => {
        if(err) {
            return sendResponse(res, 500)
        }
        connection.query(sql, [id], (err, results) => {
            connection.release()
            if(err) {
                return sendResponse(res,500)
            }
            const imgUrls = results[0].imgUrls.split(',')
            return sendResponse(res,200,'ok', { ...results[0], imgUrls })
        })
    })
}
// 根据类别检索商品信息， 分页
exports.getCommodityByType = (req, res) => {
    const { type, page = 1, pageSize } = req.body

    if(!type || isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1){
        return sendResponse(res, 400, '请输入有效的查询参数')
    }
    
    // 查询符合特定类型的所有商品数量
    const sql_count = 'SELECT COUNT(*) AS total FROM commodity WHERE type = ?';
    db.getConnection((err, connection) => {
        if(err) {
            return sendResponse(res,500,'服务器内部错误')
        }
        connection.query(sql_count, [type], (err, results) => {
            if(err) {
                connection.release()
                return sendResponse(res,500,'服务器内部错误')
            }

            const totalCommodity = results[0].total; // 总商品数量
            const totalPages = Math.ceil(totalCommodity / pageSize); // 总页数
            const offset = (page - 1) * pageSize    // 计算偏移量
            
            // 查询指定页的商品数据
            const sql = 'SELECT * FROM commodity WHERE type = ? LIMIT ?, ?'
            connection.query(sql, [type, offset, parseInt(pageSize)], (err, commodityList) => {
                connection.release()
                if(err) {
                    return sendResponse(res,500,'服务器内部错误')
                }

                getTypeName(type, (err, typeName) => {
                    if(err){
                        return sendResponse(res,500,'服务器内部错误')
                    }
                    // 构造返回数据
                    const responseData = {
                        typeName,
                        totalPages,
                        page,
                        commodityList,
                    }
                    return sendResponse(res,200,'ok',responseData)
                })
            }) 
        })
    })
}
// 根据输入的关键字检索对应类型名称包含或者名称包含或者花语包含关键字的商品
exports.getIntentResult = (req, res) => {
    const { intent } = req.query
    if(!intent){
        return sendResponse(res, 400)
    }

    const queryParam = `%${intent}%`
    // 搜索花的类型中包含指定关键字的
    const searchTypeSql = 'SELECT * FROM type c WHERE c.typeName LIKE ? OR c.type LIKE ? LIMIT 4'
    // 搜索花的名称中包含指定关键字的
    const searchNameSql = 'SELECT * FROM commodity WHERE name LIKE ? LIMIT 4'
    // 搜索中包含指花语定关键字的
    const searchFlowerLanguageSql = 'SELECT * FROM commodity WHERE flowerLanguage LIKE ? LIMIT 4'

    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(searchTypeSql, [queryParam, queryParam], (err, type) => {
            
            if(err){
                connection.release()
                return sendResponse(res, 500)
            }
            connection.query(searchNameSql, [queryParam], (err, commodityName) => {
                if(err){
                    connection.release()
                    return sendResponse(res, 500)
                }
                
                connection.query(searchFlowerLanguageSql, [queryParam], (err, flowerLanguage) => {
                    connection.release()
                    if(err){
                        return sendResponse(res, 500)
                    }
                    sendResponse(res,200,'ok', { type, commodityName, flowerLanguage })
                })
            })
        })
    })
}

// 得到搜索框热门搜索数据
exports.getHotSearch = (req, res) => {
    const sql = 'SELECT * FROM commodity ORDER BY sold DESC LIMIT 10'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if(err){
                return sendResponse(res, 500)
            }
            sendResponse(res, 200, 'ok', results)
        })
    })
}

// 得到最新上架的6件商品
exports.getNewLaunch = (req, res) => {
    const { type } = req.query
    const sql = type ? `SELECT * FROM commodity WHERE type = '${type}' ORDER BY listing_time DESC LIMIT 6` :'SELECT * FROM commodity ORDER BY listing_time DESC LIMIT 6'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if(err){
                return sendResponse(res, 500)
            }
            // 遍历结果并格式化datetime列
            const formattedResults = results.map(row => {
                const formattedRow = { ...row } // 创建一个新对象，包含原始行的所有列
                formattedRow.listing_time = moment(row.listing_time).format('YYYY-MM-DD HH:mm:ss') // 格式化datetime列  
                return formattedRow
            })
            sendResponse(res,200,'ok', formattedResults)
        })
    })
}

// 得到售出量最多的5件商品
exports.getHotBuy = (req, res) => {
    const sql = 'SELECT * FROM commodity ORDER BY sold DESC LIMIT 5'
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if(err){
                return sendResponse(res, 500)
            }
            sendResponse(res, 200, 'ok', results)
        })
    })
}

// 得到热门推荐的9条商品
exports.getHotRecommend = (req, res) => {
    const { page } = req.params

    // 计算起始位置
    const start = (page - 1) * 12;
    const sql = `SELECT * FROM commodity ORDER BY bank DESC LIMIT ${start}, 12`
    db.getConnection((err, connection) => {
        if(err){
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if(err){
                return sendResponse(res, 500)
            }
            sendResponse(res, 200, 'ok', results)
        })
    })
}

// 得到搜索页数据（带分页）
exports.searchCommodity = (req, res) => {
    const { intent = '', type = '' } = req.query
    // 默认第一页， 每页12条数据，按id排序，升序
    let { page = 1, pageSize = 12, sortField = 'id', sortOrder = 'asc' } = req.body
    // 构建 SQL 查询语句， 
    // 查询符合要求的总数量
    const countSql = `
        SELECT COUNT(*) as total
        FROM commodity c
        JOIN type t ON c.type = t.type
        WHERE (c.name LIKE ? OR c.flowerLanguage LIKE ? OR c.desc LIKE ? OR t.typeName LIKE ?) AND (c.type = ? OR ? = '')
    `
    const dataSql = `
        SELECT c.*
        FROM commodity c
        JOIN type t ON c.type = t.type
        WHERE (c.name LIKE ? OR c.flowerLanguage LIKE ? OR c.desc LIKE ? OR t.typeName LIKE ?) AND (c.type = ? OR ? = '')
        ORDER BY ${sortField} ${sortOrder.toUpperCase()}
        LIMIT ?, ?
    `

    const offset = (page - 1) * pageSize
    pageSize = parseInt(pageSize);
    db.getConnection((err, connection) => {
        if (err) {
            return sendResponse(res, 500)
        }
        // 然后在 commodity 表中查询总记录数
        connection.query(countSql, [`%${intent}%`, `%${intent}%`, `%${intent}%`, `%${intent}%`, type, type], (err, countResult) => {
            if (err) {
                connection.release()
                return sendResponse(res, 500)
            }

            const total = countResult[0].total
            // 最后在 commodity 表中根据 typeName 进行分页查询
            connection.query(dataSql, [`%${intent}%`, `%${intent}%`, `%${intent}%`, `%${intent}%`, type, type, offset, pageSize], (err, results) => {
                connection.release()
                if (err) {
                    return sendResponse(res, 500)
                }

                // 计算总页数
                const totalPages = Math.ceil(total / pageSize)

                // 返回结果
                sendResponse(res, 200, 'ok', {intent, type, page, pageSize, totalPages, total, sortField, sortOrder:sortOrder.toUpperCase(), data:results })
            })
        })
    })
}

// 返回商品的所有评论
exports.getCommodityComments = (req, res) => {
    const commodityId = req.params.id
    const sql = `
      SELECT 
        co.id,
        c.name AS commodityName,
        u.username,
        u.avatar,
        u.tag,
        co.content, 
        co.commentTime, 
        co.rating, 
        co.ipAddress, 
        co.likesCount, 
        co.repliesCount, 
        co.commentStatus
      FROM comments co
      INNER JOIN commodity c ON co.commodityId = c.id
      INNER JOIN user u ON co.userId = u.id
      WHERE co.commodityId = ?
    `
  
    db.getConnection((err, connection) => {
      if (err) {
        return sendResponse(res, 500)
      }
  
      connection.query(sql, [commodityId], (err, results) => {
        connection.release()
        if (err) {
          return sendResponse(res, 500)
        }
        sendResponse(res, 200, 'ok', results)
      })
    })
}
// 给商品的评论点赞
exports.likeComment = (req, res) => {
    const commentId = req.params.id;

    const getLikeCountSql = `
        SELECT likesCount 
        FROM comments 
        WHERE id = ?
    `

    const updateLikeCountSql = `
        UPDATE comments 
        SET likesCount = likesCount + 1 
        WHERE id = ?
    `

    db.getConnection((err, connection) => {
        if (err) {
            return sendResponse(res, 500)
        }

        connection.query(getLikeCountSql, [commentId], (err, results) => {
            if (err) {
                connection.release()
                return sendResponse(res, 500)
            }

            if (results.length === 0) {
                connection.release()
                return sendResponse(res, 404, 'Comment not found')
            }

            const currentLikesCount = results[0].likesCount

            connection.query(updateLikeCountSql, [commentId], (err) => {
                connection.release()
                if (err) {
                    return sendResponse(res, 500)
                }
                
                sendResponse(res, 200, 'ok')
            })
        })
    })
}

// 查询类别名称的函数
function getTypeName(type, callback) {
    const sql = 'SELECT typeName FROM type WHERE type = ?'

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err, null)
        }
        connection.query(sql, [type], (err, results) => {
            connection.release()
            if (err) {
                return callback(err, null)
            }
            const name = results[0] ? results[0].name : null // 提取类别名称
            callback(null, name)
        })
    })
}
