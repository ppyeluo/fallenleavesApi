const mysql = require("mysql2") // 导入 mysql2 模块

const db_pool_config = {    // 数据库连接池配置信息
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'fallenleaves',
    connectionLimit: 10, // 最大连接数
}

const dbpool = mysql.createPool(db_pool_config)    // 创建数据库连接池
module.exports = dbpool