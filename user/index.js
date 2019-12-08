const seneca = require('seneca')()
const express = require('express')
const bodyParser = require("body-parser")
const svgCaptcha = require('svg-captcha')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const marked = require('marked')
const key = require('./key')
const logger = require('./logger')

const mysql = key.mysql
const redis = key.redis

const app = express()
// 使用body-parser中间件
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// user
// 用户注册(单条)
seneca.add('target:server-user,module:user,if:register', (msg, done) => {
    var { userid, password, identity, name, sex, IDcard, birthday, college, major } = msg;

    // 密码加密
    bcrypt.genSalt(10, (err, salt) =>{
        bcrypt.hash(password, salt, (err, hash) => {
            if(err){
                done(new Error('用户注册失败！'))
            }
            else{
                password = hash;

                var insert = 'insert into user(userid,password,identity,name,sex,IDcard,birthday,college,major) values(?,?,?,?,?,?,?,?,?)';
                var insert_params = [userid, password, identity, name, sex, IDcard, birthday, college, major];
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
    else{
        var redisKey = 'user:' + userid;
        redis.mget(redisKey, (err, res) => {
            if(err){
                done(new Error('数据库访问失败，请稍后再试...'))
            }
            else if(res[0] == null){
                done(new Error('用户不存在！'))
            }
            else{
                var data = JSON.parse(res);
                // 密码解密
                bcrypt.compare(password, data.password, function(err, res) {
                    if(err || !res || (identity !== data.identity)){
                        done(new Error('密码或身份错误！'))
                    }
                    else{
                        done(null, data);
                    }
                });
            }
        })
    }
})

// 用户信息
seneca.add('target:server-user,module:user,if:detail', (msg, done) => {
    var { userid } = msg;
    var redisKey = 'user:' + userid;
    redis.mget(redisKey, (err, res) => {
        if(err){
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(res[0] == null){
            done(new Error('用户不存在！'))
        }
        else{
            var data = JSON.parse(res);
            delete data.password;
            done(null, data)
        }
    })
})

// identify
// 获取验证码
seneca.add('target:server-user,module:identify,if:code', (msg, done) => {
    var options = {
        width: msg.width,
        height: msg.height
    }
    var identifyCode = svgCaptcha.create(options);
    done(null, identifyCode);
})

// notify
// 获取通知列表
seneca.add('target:server-user,module:notify,if:list', (msg, done) => {
    redis.keys('notify:*', (err, keys) => {
        if(err){
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            done(new Error('当前没用通知！'))
        }
        else{
            var redisKey = keys;
            redis.mget(redisKey, (err, res) => {
                if(err){
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    var data = [];
                    res.forEach(item => {
                        data.push(JSON.parse(item))
                    })
                    data.sort((a, b) => {
                        if(a.top === b.top){
                            var atime = new Date(a.time);
                            var btime = new Date(b.time);
                            if(atime === btime){
                                if(a.notifyid > b.notifyid)
                                    return -1
                                else
                                    return 1
                            }
                            else{
                                if(atime > btime)
                                    return -1
                                else
                                    return 1
                            }
                        }
                        else{
                            if(a.top > b.top)
                                return -1
                            else
                                return 1
                        }
                    })
                    done(null, data)
                }
            })
        }
    })
})

// 获取附件
app.get('/notify/:appendix', (msg, done) => {
    var appendix = msg.params.appendix;
    var appendixPath = key.appendixDir + appendix;

    var size = fs.statSync(appendixPath).size;  
    var f = fs.createReadStream(appendixPath);  
    done.writeHead(200, {    
        'Content-Type': 'application/force-download',    
        'Content-Disposition': 'attachment; filename=' + appendix,    
        'Content-Length': size  
    });  
    f.pipe(done);
})

// 获取具体通知
seneca.add('target:server-user,module:notify,if:content', (msg, done) => {
    var { content } = msg;
    var contentPath = key.notifyDir + content;

    fs.readFile(contentPath, (err, data) => {
        if(err){
            done(new Error('文件不存在！'))
        }
        else{
            var str = marked(data.toString());
            done(null, {data: str})
        } 
    });
})

app.listen(8002)
seneca.listen(8001)