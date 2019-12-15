const svgCaptcha = require('svg-captcha')
const logger = require('../logger')

// 获取验证码
function code(msg, done){
    var options = {
        width: msg.width,
        height: msg.height
    }
    var identifyCode = svgCaptcha.create(options);
    done(null, identifyCode);
}

module.exports = {
    code: code
}