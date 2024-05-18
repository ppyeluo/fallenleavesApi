const db = require('../db/index')
const { sendResponse } = require('../utils/sendResponse')

// 得到所有花的分类名称和库存
exports.getCommodityCategory = (req, res) => {
    const sql = `
        SELECT type.typeName, COUNT(commodity.id) AS count
        FROM commodity
        INNER JOIN type ON commodity.type = type.type
        GROUP BY commodity.type, type.typeName  
    `
    db.getConnection((err, connection) => {
        if (err) {
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if (err) {
                return sendResponse(res, 500)
            }
            return sendResponse(res, 200, 'ok', results)
        })
    })
}

// 得到热搜关键词和搜索次数
exports.getHotSearchKeywords = (req, res) => {
    const sql = `
        SELECT keyword, count
        FROM hot_search_keywords
        ORDER BY count DESC
        LIMIT 20
    `
    db.getConnection((err, connection) => {
        if (err) {
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if (err) {
                return sendResponse(res, 500)
            }
            return sendResponse(res, 200, 'ok', results)
        })
    })
}
// 得到热门销售数据
exports.getHotSaleCommodity = (req, res) => {
    const sql = `
        SELECT name, ROUND(sold * price / 10000, 2) AS dealTotal, sold
        FROM commodity
        ORDER BY dealTotal DESC
        LIMIT 10
    `   // 返回交易额单位为万元
    db.getConnection((err, connection) => {
        if (err) {
            return sendResponse(res, 500)
        }
        connection.query(sql, (err, results) => {
            connection.release()
            if (err) {
                return sendResponse(res, 500)
            }
            return sendResponse(res, 200, 'ok', results)
        })
    })
}