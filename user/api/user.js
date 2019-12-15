const bcrypt = require('bcryptjs')
const logger = require('../logger')
const key = require('../key')

const mysql = key.mysql
const redis = key.redis

// 用户注册(单条)
function register(msg, done){
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
                mysql.query(insert, insert_params, (err, res) => {
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
}

// 指定用户信息
function detail(msg, done){
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
}

// 用户登陆
function login(msg, done){
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
                        data.msg = '登陆成功！';
                        done(null, data);
                    }
                });
            }
        })
    }
}

// 修改指定用户信息
function change(msg, done){
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
}

// 密码修改
function password(msg, done){
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
}

module.exports = {
    register: register,
    detail: detail,
    login: login,
    change: change,
    password: password
}