const seneca = require('seneca')()
const svgCaptcha = require('svg-captcha')
const bcrypt = require('bcryptjs')
const connection = require('./conn')
const logger = require('./logger')

const mysql = connection.mysql
const redis = connection.redis

// 用户注册(单条)
seneca.add('target:server-user,module:user,if:register', (msg, done) => {
    var { userid, password, identity } = msg;

    // 加密
    bcrypt.genSalt(10, (err, salt) =>{
        bcrypt.hash(password, salt, (err, hash) => {
            if(err){
                done(new Error('用户注册失败！'))
            }
            else{
                password = hash;

                var insert = 'insert into user(userid,password,identity) values(?,?,?)';
                var insert_params = [userid, password, identity];
                mysql.query(insert, insert_params, (err, user) => {
                    if(err){
                        logger.error(err.message);
                        done(new Error('用户注册失败！'))
                    }
                    else{
                        done(null, {msg: '用户注册成功！'})
                    }
                })
            }
        });
    });
})

// 用户登陆
seneca.add('target:server-user,module:user,if:login', (msg, done) => {
    var { userid, password, identity, identifyCode, currentCode } = msg;
    
    if(identifyCode !== currentCode){
        done(new Error('验证码错误！'));
    }

    var key = 'user:' + userid;
    redis.mget(key, (err, res) => {
        if(err){
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(res[0] == null){
            done(new Error('用户不存在！'))
        }
        else{
            var data = JSON.parse(res);
            bcrypt.compare(password, data.password, function(err, res) {
                if(err || !res || (identity !== data.identity)){
                    done(new Error('密码或身份错误！'))
                }
                done(null, {msg: 'success'})
            });
        }
    })
})

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