const REST_Routes = [
    {
        prefix: '/identify',
        pin: 'module:identify,if:*',
        map: {
            code: {
                GET: true,
                name: '',
                suffix: ''
            },
            login: {
                POST: true,
                name: '',
                suffix: ''
            },
            logout: {
                DELET: true,
                name: '',
                suffix: ''
            }
        }
    }
]

const identifyCodes = '0123456789'
const identifyCodeLength  = 4;

function randomNum(min,max){
    return Math.floor(Math.random()*(max-min)+min);
}

function identity(options){
    // 获取验证码
    this.add('module:identify,if:code',(msg,res) => {
        console.log(msg)
        var identifyCode = '';
        for(let i = 0; i < identifyCodeLength; i++){
            identifyCode += identifyCodes[randomNum(0, identifyCodes.length)];
        }
        res(null, {code: identifyCode});
    })
}

module.exports = {
    init: identity,
    routes: REST_Routes
}