const DEFAULT_MESSAGES = {
    200: 'ok',
    400: "请求参数错误",
    401: "Unauthorized",
    403: "禁止访问",
    404: "资源不存在",
    500: "服务器内部错误",
    501: "功能未实现",
    502: "网关错误",
    503: "服务不可用",
    504: "网关超时"
}
function sendResponse(res, code, message = DEFAULT_MESSAGES[code], data = null) {
    res.status(code).json({ code, message, data });
}

module.exports = { sendResponse }