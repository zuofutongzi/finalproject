const seneca = require('seneca')()
const svgCaptcha = require('svg-captcha')

// 获取验证码
seneca.add('target:server-user,module:identify,if:code', (msg, done) => {
    var options = {
        width: msg.width,
        height: msg.height
    }
    var identifyCode = svgCaptcha.create(options);
    done(null, identifyCode);
})

seneca.listen(8001)