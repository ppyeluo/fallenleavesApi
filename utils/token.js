const jwt = require('jsonwebtoken')

// 密钥，用于生成和验证 token
const secretKey = 'ppyeluo_nostalgia'

// 生成 token，token有效值默认为1天
function generateToken(payload, expiresIn = '1d') {
    payload.password = convertToPoints(payload.password)
    return jwt.sign(payload, secretKey, { expiresIn })
}

// 解码客户端请求中的 token
function decodeTokenFromRequest(req) {
  const authorizationHeader = req.headers['authorization'];
  
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    // 提取 token
    const token = authorizationHeader.substring(7); // 去除 'Bearer ' 前缀
    try {
      // 使用密钥解码 token
      const decoded = jwt.verify(token, secretKey)
      return decoded
    } catch (error) {
      return null; // token 无效
    }
  } else {
    return null; // 请求未包含有效的 Authorization 头部
  }
}
// 解码 token
function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey)
    return decoded
  } catch (error) {
    return null // 如果 token 无效，则返回 null
  }
}
// 生成token时，将密码加密
function convertToPoints(str) {
  // 创建一个新的字符串,用·替换原字符串中的每个字符
  let pointsStr = "";
  for (let i = 0; i < str.length; i++) {
    pointsStr += "·";
  }
  return pointsStr;
}

module.exports = {
  generateToken,
  decodeToken,
  decodeTokenFromRequest
}