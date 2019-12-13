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
                logger.error('(user-register):' + err.message);
                done(new Error('用户注册失败！'))
            }
            else{
                password = hash;

                // 学生注册
                // var insert = 'insert into ' + identity + '(userid,password,name,sex,IDcard,birthday,college,major) values(?,?,?,?,?,?,?,?)';
                // var insert_params = [userid, password, name, sex, IDcard, birthday, college, major];
                // 管理员注册
                var insert = 'insert into ' + identity + '(userid, password)  values(?, ?)';
                var insert_params = [userid, password];
                mysql.query(insert, insert_params, (err, user) => {
                    if(err){
                        logger.error('(user-register):' + err.message);
                        done(new Error('用户注册失败！'))
                    }
                    else{
                        logger.info('(user-register):注册成功');
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
        var redisKey = identity + ':' + userid;
        redis.mget(redisKey, (err, res) => {
            if(err){
                logger.error('(user-login):' + err.message);
                done(new Error('数据库访问失败，请稍后再试...'))
            }
            else if(res[0] == null){
                done(new Error('用户不存在！'))
            }
            else{
                var data = JSON.parse(res);
                // 密码解密
                bcrypt.compare(password, data.password, function(err, res) {
                    if(err || !res){
                        done(new Error('密码错误！'))
                    }
                    else{
                        done(null, data);
                    }
                });
            }
        })
    }
})

// 指定用户信息
seneca.add('target:server-user,module:user,if:detail', (msg, done) => {
    var { userid, identity } = msg;
    var redisKey = identity + ':' + userid;
    redis.mget(redisKey, (err, res) => {
        if(err){
            logger.error('(user-detail):' + err.message);
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

// 修改指定用户信息
seneca.add('target:server-user,module:user,if:change', (msg, done) => {
    var { userid, identity, phone, email, address, qq } = msg;
    var update = 'update ' + identity + ' set phone = ?, email = ?, address = ?, qq = ? where userid = ?';
    var update_params = [phone, email, address, qq, userid];

    mysql.query(update, update_params, (err, user) => {
        if(err){
            logger.error('(user-change):' + err.message);
            done(new Error('用户信息修改失败！'))
        }
        else{
            logger.info('(user-change):用户信息修改成功');
            done(null, {msg: '用户信息修改成功！'})
        }
    })
})

// 密码修改
seneca.add('target:server-user,module:user,if:password', (msg, done) => {
    var { userid, identity, oldPassword, newPassword } = msg;
    var redisKey = identity + ':' + userid;
    redis.mget(redisKey, (err, res) => {
        if(err){
            logger.error('(user-password):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(res[0] == null){
            done(new Error('用户不存在！'))
        }
        else{
            var data = JSON.parse(res);
            // 密码解密
            bcrypt.compare(oldPassword, data.password, function(err, res) {
                if(err || !res){
                    done(new Error('原密码错误！'))
                }
                else{
                    bcrypt.genSalt(10, (err, salt) =>{
                        bcrypt.hash(newPassword, salt, (err, hash) => {
                            if(err){
                                logger.error('(user-password):' + err.message);
                                done(new Error('密码修改失败！'))
                            }
                            else{
                                newPassword = hash;
                
                                // 原密码正确，将新密码写入mysql数据库
                                var update = 'update ' + identity + ' set password = ? where userid = ?';
                                var update_params = [newPassword, userid];
                                mysql.query(update, update_params, (err, user) => {
                                    if(err){
                                        logger.error('(user-password):' + err.message);
                                        done(new Error('密码修改失败！'))
                                    }
                                    else{
                                        logger.info('(user-password):密码修改成功');
                                        done(null, {msg: '密码修改成功！'})
                                    }
                                })
                            }
                        });
                    });
                }
            });
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
            logger.error('(notify-list):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            done(new Error('当前没用通知！'))
        }
        else{
            var redisKey = keys;
            redis.mget(redisKey, (err, res) => {
                if(err){
                    logger.error('(notify-list):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    var data = [];
                    res.forEach(item => {
                        data.push(JSON.parse(item))
                    })
                    done(null, data)
                }
            })
        }
    })
})

// 获取具体通知
seneca.add('target:server-user,module:notify,if:content', (msg, done) => {
    var { notifyid } = msg;
    var redisKey = 'notify:' + notifyid;
    redis.mget(redisKey, (err, res) => {
        if(err){
            logger.error('(notify-content):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            var data = JSON.parse(res);
            var contentPath = key.notifyDir + data.content;

            fs.readFile(contentPath, (err, data) => {
                if(err){
                    logger.error('(notify-content):' + err.message);
                    done(new Error('文件不存在！'))
                }
                else{
                    var str = marked(data.toString());
                    done(null, {data: str})
                } 
            });
        }
    })
})

// 获取附件
app.get('/notify/:appendix', (msg, done) => {
    var appendix = msg.params.appendix;
    var appendixPath = key.appendixDir + appendix;

    var size = fs.statSync(appendixPath).size;  
    var f = fs.createReadStream(appendixPath);
    // 附件若包含中文，需要字符转换才能放入header
    var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
　　if(reg.test(appendix)){
        appendix = encodeURI(appendix,"GBK");
        appendix = appendix.toString('iso8859-1');
    }
    done.writeHead(200, {
        'Content-Type': 'application/force-download',    
        'Content-Disposition': 'attachment; filename=' + appendix,    
        'Content-Length': size  
    });  
    f.pipe(done);
})

app.listen(8002)
seneca.listen(8001)