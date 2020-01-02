const bcrypt = require('bcryptjs')
const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const logger = require('../logger')
const key = require('../key')

//const mysql = key.mysql
const connectHandler = key.mysql
const redis = key.redis

// 用户列表
// 分页获取参数格式
// var options = {
//     identity: String,
//     filter: {
//         isFirst: Boolean,
//         isPage: Boolean,
//         page: number/null,
//         size: number/null,
//         college: String/null
//     }
// }
// 当前筛选仅包含教师
function list(msg, done){
    var { identity } = msg;
    var filter = JSON.parse(msg.filter);
    var res = {count: 0, data: []};
    var options = [];
    var redisKey = 'idx:' + identity;
    if(filter.college){
        switch(identity){
            case 'teacher':
                redisKey += ':college:' + filter.college;
                break;
            case 'student':
                break;
        }
    }
    options = options.concat([redisKey, 'alpha', 'get', identity + ':*']);
    // 第一次访问接口获取列表总条数
    if(filter.isFirst){
        redis.sort(options, (err, keys) => {
            if(err){
                logger.error('(user-list):' + err.message);
                done(new Error('数据库访问失败，请稍后再试...'))
            }
            else{
                res.count = keys.length;
            }
        })
    }
    // 分页
    if(filter.isPage){
        options = options.concat(['limit', ((filter.page-1)*filter.size).toString(), filter.size.toString()]);
    }
    redis.sort(options, async (err, keys) => {
        if(err){
            logger.error('(user-list):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            done(new Error('当前没有用户！'))
        }
        else{
            var college = async (value) => {
                var name = await new Promise((resolve) => {
                    redis.mget('college:' + value.collegeid, (err, res) => {
                        if(err){
                            logger.error('(user-list):' + err.message);
                            done(new Error('数据库访问失败，请稍后再试...'))
                        }
                        else{
                            resolve(JSON.parse(res[0]).name)
                        }
                    })
                })
                return name;
            }
            for(var i = 0; i < keys.length; i++){
                var item = JSON.parse(keys[i]);
                // if(identity == 'teacher'){
                //     item.college = await college(item);
                // }
                switch(identity){
                    case 'teacher':
                        item.college = await college(item);
                        break;
                    case 'student':
                        break;
                }
                delete item.password;
                delete item.IDcard;
                delete item.birthday;
                res.data.push(item)
            }
            done(null, res)
        }
    })
}

// 用户注册(单条)
// var options = { 
//     userid: String, 
//     password: String, 
//     name: String, 
//     sex: String, 
//     nation: String, 
//     politicalStatus: String, 
//     IDcard: String, 
//     collegeid: String/null, 
//     eduBackground: String/null, 
//     professionalTitle: String/null, 
//     enrol: String,
//     identity: String
// }
async function register(msg, done){
    const mysql = await connectHandler();

    // 共有信息
    var { identity, userid, password, name, sex, nation, politicalStatus, IDcard, enrol } = msg;
    // 教师专有信息
    var { collegeid, eduBackground, professionalTitle } = msg;

    // 生日生成
    var year = IDcard.slice(6,10);
    var month = IDcard.slice(10,12);
    var day = IDcard.slice(12,14);
    var birthday = year + '-' + month + '-' + day;

    // 密码加密
    password = bcrypt.hashSync(password, key.saltRounds);

    // 账号规格
    var reg = new RegExp("^[a-zA-Z0-9]+$"); 
    if(!reg.test(userid)){
        done(new Error('账号格式错误！'))
    }

    // 判断账号是否已经存在
    var redisKey = identity + ':' + userid;
    redis.mget(redisKey, (err, res) => {
        if(err){
            logger.error('(user-register):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(res[0] != null){
            done(new Error('用户已存在！'))
        }
        else{
            // 用户创建
            var insert = '';
            var insert_params = [];

            switch(identity){
                case 'teacher':
                    collegeid = parseInt(collegeid);
                    insert = 'insert into teacher(userid,password,name,sex,nation,politicalStatus,IDcard,enrol,collegeid,eduBackground,professionalTitle,birthday) ';
                    insert += 'values(?,?,?,?,?,?,?,?,?,?,?,?)';
                    insert_params = [userid,password,name,sex,nation,politicalStatus,IDcard,enrol,collegeid,eduBackground,professionalTitle,birthday];
                    break;
                case 'student':
                    break;
                default:
                    done(new Error('添加对象身份类型错误！'))
                    break;
            }
            mysql.query(insert, insert_params, (err, res) => {
                if(err){
                    logger.error('(user-register):' + err.message);
                    done(new Error('用户添加失败！'))
                }
                else{
                    logger.info('(user-register):用户添加成功');
                    done(null, {msg: '用户添加成功！'})
                }
            })
        }
    })

    mysql.release();
}

// 用户删除
// var options = {
//     userid: Array,
//     identity: String
// }
async function mydelete(msg, done){
    const mysql = await connectHandler();

    var { userid, identity } = msg;
    var sql = 'delete from ' + identity + ' where userid in (';
    for(var i = 0; i < userid.length; i++){
        if(i == 0){
            sql += ' ?';
        }
        else{
            sql += ', ?';
        }
    }
    sql += ')';
    var sql_params = userid;
    mysql.query(sql, sql_params, (err, res) => {
        if(err){
            logger.error('(user-delete):' + err.message);
            done(new Error('用户删除失败！'))
        }
        else{
            logger.info('(user-delete):用户删除成功');
            done(null, {msg: '用户删除成功！'})
        }
    })

    mysql.release();
}

// 未找到使用seneca实现文件上传下载的方法，另增加express接口
// 用户导入
// var options = {
//     identity: String
// }
router.post('/user/import', async (msg, done) => {
    try{
        const mysql = await connectHandler();

        var file = msg.body.file;
        var identity = msg.body.options.identity;
        var rule = [];
        var arrLength = 0; //rule的长度
        var idcardIndex = 0; //身份证号对应下标 
        var useridIndex = 0; //账号对应下标
        var passwordIndex = 0; //密码对应下标
        var collegeClassIndex = 0; //教师对应分院，学生对应班级

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
        switch(identity){
            case 'teacher':
                idcardIndex = 6;
                useridIndex = 0;
                passwordIndex = 1;
                collegeClassIndex = 7;
                arrLength = 11;
                insert = 'insert ignore into teacher(userid, password, name, sex, nation, politicalStatus, IDcard, collegeid, eduBackground, professionalTitle, enrol, birthday) values ';
                rule = [ '教师账号', '密码', '姓名', '性别', '民族', '政治面貌', '身份证', '学院', '教育背景', '职称', '入职年份' ];
                break;
            case 'student':
                break;
            default:
                throw new Error('添加对象身份类型错误！')
        }
        // 确认表格头部是否正确
        for(var i = 0; i < arrLength; i++){
            if(navigation[i] != rule[i]){
                throw new Error('格式错误，请重新检查表头是否符合要求！')
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
        // 分院获取
        var getCollege = async () => {
            var college = await new Promise((resolve) => {
                redis.sort('idx:college', 'get', 'college:*', (err, key) => {
                    var college = {
                        collegeName: [],
                        collegeId: []
                    }
                    key.forEach((item, index) => {
                        college.collegeName[index] = JSON.parse(item).name;
                        college.collegeId[index] = JSON.parse(item).collegeid;
                    })
                    resolve(college);
                })
            })
            return college;
        }
        var { collegeName, collegeId } = await getCollege();
        // 判断分院是否正确
        var incollege = data.filter((value) => {
            return collegeName.indexOf(value[collegeClassIndex]) != -1
        })
        if(incollege.length != data.length){
            throw new Error("格式错误，请重新检查分院信息是否符合要求！")
        }
        // 用户获取
        var getUser = async () => {
            var user = await new Promise((resolve) => {
                redis.sort('idx:' + identity, 'alpha', (err, key) => {
                    resolve(key);
                })
            })
            return user;
        }
        var user = await getUser();
        data.forEach((item) => {
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
            // 判断用户是否已经存在
            if(user.indexOf(item[useridIndex]) != -1){
                throw new Error(item[useridIndex] + '用户已存在，请重新检查文件内容并修改！')
            }
            // 账号规格
            var reg = new RegExp("^[a-zA-Z0-9]+$"); 
            if(!reg.test(item[useridIndex])){
                throw new Error('格式错误，请重新检查文件内容是否符合要求！')
            }
            // 密码加密
            item[passwordIndex] = bcrypt.hashSync(item[passwordIndex].toString(), key.saltRounds);
            // 分院编号
            var index = collegeName.indexOf(item[collegeClassIndex]);
            item[collegeClassIndex] = collegeId[index];
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

        mysql.release();
    }
    catch(err){
        logger.error('(user-import):' + err.message);
        done.send({status: 500, msg: err.message})
    }
})

// 指定用户信息
// var options = {
//     userid: String,
//     identity: String,
//     askerid: String
// }
function detail(msg, done){
    var { userid, identity, askerid } = msg;
    var redisKey = identity + ':' + userid;
    redis.mget(redisKey, async (err, res) => {
        if(err){
            logger.error('(user-detail):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(res[0] == null){
            done(new Error('用户不存在！'))
        }
        else{
            var data = JSON.parse(res);
            // 教师信息：将分院号转换成分院名称
            if(identity == 'teacher'){
                var college = async (value) => {
                    var name = await new Promise((resolve) => {
                        redis.mget('college:' + value.collegeid, (err, res) => {
                            resolve(JSON.parse(res[0]).name);
                        })
                    })
                    return name;
                }
                var myclass = async (value) => {
                    var name = await new Promise((resolve) => {
                        redis.mget('class:' + value.classid, (err, res) => {
                            resolve(JSON.parse(res[0]).name);
                        })
                    })
                    return name;
                }
                data.college = await college(data);
                if(data.classTeacher == 'true'){
                    data.class = await myclass(data);
                }
            }
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
// var options = {
//     userid: String,
//     password: String,
//     identity: String,
//     identifyCode: String,
//     currentCode: String
// }
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
// var options = {
//     askerid: String,
//     userid: String,
//     identity: String,
//     phone: String,
//     email: String,
//     address: String,
//     qq: String,
//     eduBackground: String/null,
//     professionalTitle: String/null,
//     personalHonor: String/null,
//     teachingSituation: String/null,
//     scientificSituation: String/null
// }
async function change(msg, done){
    const mysql = await connectHandler();

    // 教师、学生共有信息
    var { askerid, askeridentity, userid, identity, phone, email, address, qq } = msg;
    // 教师独有信息
    var { eduBackground, professionalTitle, personalHonor, teachingSituation, scientificSituation } = msg;

    if(askeridentity != 'manager' && askerid != userid){
        logger.error('(user-change):禁止修改他人信息！');
        done(new Error('禁止修改他人信息！'))
    }

    var update = '';
    var update_params = [];
    switch(identity){
        case 'teacher':
            update = 'update teacher set phone = ?, email = ?, address = ?, qq = ?, eduBackground = ?, professionalTitle = ?, personalHonor = ?, teachingSituation = ?, scientificSituation = ? where userid = ?';
            update_params = [phone, email, address, qq, eduBackground, professionalTitle, personalHonor, teachingSituation, scientificSituation, userid];
            break;
        case 'student':
            update = 'update student set phone = ?, email = ?, address = ?, qq = ? where userid = ?';
            update_params = [phone, email, address, qq, userid];
            break;
        default:
            done(new Error('修改对象身份类型错误！'))
            break;
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

    mysql.release();
}

// 密码修改
// var options = {
//     askerid: String,
//     userid: String,
//     identity: String,
//     oldPassword: String,
//     newPassword: String
// }
async function password(msg, done){
    const mysql = await connectHandler();

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
                    bcrypt.genSalt(key.saltRounds, (err, salt) =>{
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

    mysql.release();
}

module.exports = {
    list: list,
    register: register,
    delete: mydelete,
    detail: detail,
    login: login,
    change: change,
    password: password,
    router: router
}