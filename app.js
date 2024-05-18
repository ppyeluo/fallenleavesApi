const express = require('express')
const cors = require('cors')    // 导入 cors 中间件


const PORT = 3000   // 服务器启动端口号

const app = express()   //  创建 express 的服务器实例

app.use(cors())     // 配置 cors 跨域，必须在路由之前配置

app.use(express.urlencoded({ extended: false }))    // 配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件

const commodityRouter = require('./router/commodity')     // 导入并注册用户路由模块
const userRouter = require('./router/user')
const cartRouter = require('./router/cart')
const collectRouter = require('./router/collect')
const ordersRouter = require('./router/orders')
const customizedRouter = require('./router/customized')
app.use('/api', commodityRouter)
app.use('/api', userRouter)
app.use('/api', cartRouter)
app.use('/api', collectRouter)
app.use('/api', ordersRouter)
app.use('/api', customizedRouter)

//调用 app.listen 方法，指定端口号并启动web服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，${PORT}端口监听中……`)
})