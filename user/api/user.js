const bcrypt = require('bcryptjs')
const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const logger = require('../logger')
const key = require('../key')

const mysql = key.mysql
const redis = key.redis

// 用户列表
function list(msg, done){
    // var options = {
    //     identity: 'teacher',
    //     filter: {
    //         isPage: true,
    //         page: 1,
    //         size: 20
    //     }
    // }

    var { identity } = msg;
    var options = ['idx:' + identity, 'get', identity + ':*'];
    var filter = JSON.parse(msg.filter);
    if(filter.isPage){
        options = options.concat(['limit', ((filter.page-1)*10).toString(), filter.size.toString()]);
    }
    redis.sort(options, (err, keys) => {
        if(err){
            logger.error('(notify-list):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            done(new Error('当前没用用户！'))
        }
        else{
            var data = [];
            keys.forEach(item => {
                var item = JSON.parse(item);
                if(identity == 'teacher'){
                    delete item.password;
                    delete item.IDcard;
                    delete item.birthday;

                }
                data.push(item)
            })
            done(null, data)
        }
    })
}

// 用户注册(单条)
function register(msg, done){
    // 学生
    // var { userid, password, identity, name, sex, IDcard, birthday, college, major } = msg;
    // 教师
    // var { identity,userid,password,name,sex,nation,politicalStatus,IDcard,birthday,college,enrol,classTeacher } = msg;
    // 管理员
    var { identity, userid, password } = msg;

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

// 未找到使用seneca实现文件上传下载的方法，另增加express接口
// 用户导入
router.post('/user/import', (msg, done) => {
    try{
        var file = msg.body.file;
        var identity = msg.body.options.identity;
        var rule = [];
        var arrLength = 0; //rule的长度
        var idcardIndex = 0; //身份证号对应下标 
        var passwordIndex = 0; //密码对应下标

        var insert = '';
        var insert_params = [];

        // 数组转buffer
        var copy = Buffer.from(file.buffer.data)
        // 解析文件
        var obj = xlsx.parse(copy);
        // 数据需要在第一个表中
        if(obj[0].data.length == 0){
            throw new Error('格式错误，请重新检查文件内容是否符合要求！')
        }
        var data = obj[0].data;
        var navigation = data[0];
        // 教师导入
        if(identity == 'teacher'){
            idcardIndex = 6;
            passwordIndex = 1;
            arrLength = 11;
            insert = 'insert ignore into teacher(userid, password, name, sex, nation, politicalStatus, IDcard, college, eduBackground, professionalTitle, enrol, birthday) values ';
            rule = [ '教师账号', '密码', '姓名', '性别', '民族', '政治面貌', '身份证', '学院', '教育背景', '职称', '入职年份' ];
        }
        else{
            throw new Error('添加对象身份类型错误！')
        }
        // 确认表格头部是否正确
        for(var i = 0; i < arrLength; i++){
            if(navigation[i] != rule[i]){
                throw new Error('格式错误，请重新检查文件内容是否符合要求！')
            }
        }

        data = data.slice(1,data.length);
        // 过滤空的数据
        data = data.filter((value) => {    
            return !(
                value === undefined ||
                value === null ||
                (typeof value === 'object' && Object.keys(value).length === 0) ||
                (typeof value === 'string' && value.trim().length === 0)
            )
        })
        data.forEach(item => {
            // 数据不能有空项
            item = item.filter((value) => {    
                return !(
                    value === undefined ||
                    value === null ||
                    (typeof value === 'object' && Object.keys(value).length === 0) ||
                    (typeof value === 'string' && value.trim().length === 0)
                )
            })
            if(item.length != arrLength || typeof(item[idcardIndex]) != 'string'){
                throw new Error('格式错误，请重新检查文件内容是否符合要求！')
            }
            // 密码加密
            item[passwordIndex] = bcrypt.hashSync(item[passwordIndex].toString(), 10);
            // 生日生成
            var year = item[idcardIndex].slice(6,10);
            var month = item[idcardIndex].slice(10,12);
            var day = item[idcardIndex].slice(12,14);
            item.push(year + '-' + month + '-' + day);
            // 生日字段后期加入，所以插入的字段比arrLength多1
            var str = '(';
            for(var i = 0; i < arrLength + 1; i++){
                if(i == 0){
                    str += '?';
                }
                else{
                    str += ',?';
                }
            }
            str += '),'
            insert += str;
            insert_params = insert_params.concat(item);
        })

        insert = insert.slice(0, insert.length - 1)
        mysql.query(insert, insert_params, (err, res) => {
            if(err){
                logger.error('(user-import):' + err.message);
                throw new Error('用户导入失败！');
            }
            else{
                logger.info('(user-import):用户导入成功');
                done.send({msg: '用户导入成功！'})
            }
        })
    }
    catch(err){
        logger.error('(user-import):' + err.message);
        done.send({status: 500, msg: err.message})
    }
})

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
    password: password,
    router: router
}