const fs = require('fs')
const path = require('path')

const logFilePath = path.join(__dirname, 'logs.log')

function log(message) {
    const currentTime = getCurrentTime();
    const logMessage = `${currentTime} - ${message}`

    fs.appendFile(logFilePath, logMessage + '\n', (err) => {
        if (err) {
            console.error('文件写入错误:', err)
        }
    })
}

module.exports = log

// 得到实时时间
function getCurrentTime(){
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}