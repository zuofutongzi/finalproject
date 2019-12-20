const bcrypt = require('bcryptjs')
const logger = require('../logger')
const key = require('../key')

const mysql = key.mysql
const redis = key.redis

function list(msg, done){
    var { identity, filter } = msg;
    redis.keys(identity + ':*', (err, keys) => {
        if(err){
            logger.error('(user-list):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            if(identity == 'student'){
                done(new Error('当前没用学生！'))
            }
            else if(identity == 'teacher'){
                done(new Error('当前没用教师！'))
            }
            else{
                done(new Error('当前没有用户！'))
            }
        }
        else{
            var redisKey = keys;
            redis.mget(redisKey, (err, res) => {
                if(err){
                    logger.error('(user-list):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    var data = [];
                    res.forEach(item => {
                        data.push(JSON.parse(item))
                    })
                    if(filter != null){
                        // 过滤条件
                        console.log(1)
                    }
                    done(null, data)
                }
            })
        }
    })
}

// 用户注册(单条)
function register(msg, done){
    // var { userid, password, identity, name, sex, IDcard, birthday, college, major } = msg;
    var { identity,userid,password,name,sex,nation,politicalStatus,IDcard,birthday,college,enrol,classTeacher } = msg;

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
                // var insert = 'insert into ' + identity + '(userid, password)  values(?, ?)';
                // var insert_params = [userid, password];
                // 教师注册
                var insert = 'insert into ' + identity + '(userid,password,name,sex,nation,politicalStatus,IDcard,birthday,college,enrol,classTeacher) values(?,?,?,?,?,?,?,?,?,?,?)';
                var insert_params = [userid,password,name,sex,nation,politicalStatus,IDcard,birthday,college,enrol,classTeacher];
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
    var { userid, identity, askerid } = msg;
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
            // 请求自己信息，将密码去除返回
            // 请求他人信息，将隐私信息去除返回
            if(userid == askerid){
                delete data.password;
            }
            else{
                delete data.password;
                delete data.IDcard;
                delete data.birthday;
            }
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
    // 教师、学生共有信息
    var { askerid, userid, identity, phone, email, address, qq } = msg;
    // 教师独有信息
    var { personalHonor, teachingSituation, scientificSituation } = msg;

    if(askerid != userid){
        logger.error('(user-change):禁止修改他人信息！');
        done(new Error('禁止修改他人信息！'))
    }

    var update = '';
    var update_params = [];
    if(identity == 'student'){
        update = 'update ' + identity + ' set phone = ?, email = ?, address = ?, qq = ? where userid = ?';
        update_params = [phone, email, address, qq, userid];
    }
    else if(identity == 'teacher'){
        update = 'update ' + identity + ' set phone = ?, email = ?, address = ?, qq = ?, personalHonor = ?, teachingSituation = ?, scientificSituation = ? where userid = ?';
        update_params = [phone, email, address, qq, personalHonor, teachingSituation, scientificSituation, userid];
    }
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
    var { askerid, userid, identity, oldPassword, newPassword } = msg;

    if(askerid != userid){
        logger.error('(user-password):禁止修改他人密码！');
        done(new Error('禁止修改他人密码！'))
    }

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
    list: list,
    register: register,
    detail: detail,
    login: login,
    change: change,
    password: password
}