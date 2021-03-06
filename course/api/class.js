const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const fs = require('fs')
const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 开课列表
// 开课数量过于庞大，限制分页获取
// var options = {
//     schoolYear: String, 
//     schoolTerm: String,
//     page: int, 
//     size: int
// }
async function list(msg, done){
    var { schoolYear, schoolTerm, page, size } = msg;
    var options = ['idx:class:course:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, 'alpha'];

    var res = {
        count: 0,
        data: []
    }

    // 获取当前学期开设的课程
    var getCourse = async () => {
        return await new Promise((resolve) => {
            redis.sort(options, (err, keys) => {
                if(err){
                    logger.error('(class-list):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    res.count = keys.length;
                    options = options.concat(['limit', ((page-1)*size).toString(), size.toString()]);
                    redis.sort(options, (err, keys) => {
                        if(err){
                            logger.error('(class-list):' + err.message);
                            done(new Error('数据库访问失败，请稍后再试...'))
                        }
                        else{
                            resolve(keys)
                        }
                    })
                }
            })
        })
    }
    var courseList = await getCourse();

    Promise.all(courseList.map(item => {
        // 根据课程号获取开课号
        return new Promise((resolve) => {
            redis.sinter('idx:class:course:' + item, 'idx:class:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, (err, keys) => {
                if(err){
                    logger.error('(class-list):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    var classList = {};
                    // 根据开课号获取开课信息
                    Promise.all(keys.map(value => {
                        return new Promise((cresolve) => {
                            redis.mget('class:' + value, (err, res) => {
                                if(err){
                                    logger.error('(class-list):' + err.message);
                                    done(new Error('数据库访问失败，请稍后再试...'))
                                }
                                else{
                                    cresolve(JSON.parse(res[0]))
                                }
                            })
                        })
                    }))
                    .then(result => {
                        classList.class = result;
                        // 获取教师信息
                        var teacherid = [];
                        classList.class.forEach(citem => {
                            teacherid.push(citem.teacherid)
                        })
                        var option = {
                            identity: 'teacher',
                            userid: teacherid
                        }
                        userSeneca.act('target:server-user,module:user,if:id2name', option,
                        (err, res) => {
                            if(err){
                                done(new Error(err.data.payload.details.message))
                            }
                            else{
                                classList.class = classList.class.map(citem => {
                                    var index = res.findIndex(fitem => {
                                        return fitem.userid == citem.teacherid;
                                    })
                                    if(index != -1){
                                        citem.teacher = res[index];
                                    }
                                    return citem;
                                })
                                // 根据课程号获取课程信息
                                redis.mget('course:' + item, (err, res) => {
                                    if(err){
                                        logger.error('(class-list):' + err.message);
                                        done(new Error('数据库访问失败，请稍后再试...'))
                                    }
                                    else{
                                        classList.course = JSON.parse(res[0]);
                                        resolve(classList)
                                    }
                                })
                            }
                        })
                    })
                }
            })
        })
    }))
    .then(result => {
        result = result.filter(item => {
            return item.course != null;
        })
        res.data = result;
        done(null, res)
    })
}

// 开课添加
// var options = {
//     courseid: String, 
//     teacherid: String, 
//     schoolYear: String, 
//     schoolTerm: String, 
//     capacityLimit: Number, 
//     session: Array
// }
async function add(msg, done){
    var { courseid, teacherid, schoolYear, schoolTerm, capacityLimit, session } = msg;
    var { askerid } = msg;

    var getCourse = new Promise((resolve) => {
        redis.mget('course:' + courseid, (err, res) => {
            if(err){
                logger.error('(class-add):' + err.message);
                done(new Error('数据库访问失败，请稍后再试...'))
            }
            else if(res[0] != null){
                resolve(true)
            }
            else{
                resolve(false)
            }
        })
    })

    var getTeacher = new Promise((resolve) => {
        var options = {
            userid: teacherid,
            identity: 'teacher',
            askerid: askerid
        }
        userSeneca.act('target:server-user,module:user,if:detail', options,
        (err, res) => {
            if(err){
                logger.error('(class-add):server-user访问失败');
                done(new Error(err.data.payload.details.message))
            }
            else{
                resolve(true)
            }
        })
    })

    const mysql = await connectHandler();
    var psession = '';
    session.forEach(item => {
        psession += item + ';';
    })
    var insertSql = 'insert into class (courseid, teacherid, schoolYear, schoolTerm, session, capacityLimit) values(?,?,?,?,?,?)';
    var insert_params = [courseid, teacherid, schoolYear, schoolTerm, psession, capacityLimit];
    Promise.all([getCourse, getTeacher])
        .then(result => {
            var index = result.indexOf(false);
            switch(index){
                case 0:
                    done(new Error('没有相关课程，无法开课'))
                    break;
                case 1:
                    done(new Error('教师不存在，无法开课'))
                    break;
                default:
                    mysql.query(insertSql, insert_params, (err, result) => {
                        if(err){
                            logger.error('(class-add):' + err.message);
                            done(new Error('课程添加失败！'))
                        }
                        else{
                            logger.info('(class-add):课程添加成功');
                            done({msg: '课程添加成功'})
                        }
                    })
                    break;
            }
        })
    mysql.release();
}

// 开课编辑
// var options = {
//     classid: String,
//     courseDescription: String, 
//     courseObjectives: String, 
//     courseOutline: String, 
//     preknowledge: String, 
//     referenceMaterial: String
// }
async function edit(msg, done){
    var { classid, courseDescription, courseObjectives, courseOutline, preknowledge, referenceMaterial } = msg;
    var updateSql = 'update class set courseDescription = ?, courseObjectives = ?, courseOutline = ?, preknowledge = ?, referenceMaterial = ? where classid = ?';
    var update_params = [courseDescription, courseObjectives, courseOutline, preknowledge, referenceMaterial, classid];

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, res) => {
        if(err){
            logger.error('(class-edit):' + err.message);
            done(new Error('开课信息修改失败！'))
        }
        else{
            logger.info('(class-edit):' + classid + '开课信息修改成功');
            done(null, {msg: '开课信息修改成功！'})
        }
    })
    mysql.release();
}

// 开课删除
// var options = {
//     classid: Array
// }
async function mydelete(msg, done){
    var { classid } = msg;
    var cdeleteSql = 'delete from class where classid in (';
    var csdeleteSql = 'delete from classSelect where classid in (';

    classid.forEach(item => {
        cdeleteSql += '?,';
        csdeleteSql += '?,';
    })
    cdeleteSql = cdeleteSql.slice(0, cdeleteSql.length - 1);
    cdeleteSql += ')';
    csdeleteSql = csdeleteSql.slice(0, csdeleteSql.length - 1);
    csdeleteSql += ')';

    // 开课删除连同学生的选课一起删除
    const mysql = await connectHandler();
    mysql.beginTransaction(err => {
        if(err){
            logger.error('(class-delete):' + err.message);
            done(new Error('开课删除失败！'))
        }
        else{
            mysql.query(csdeleteSql, classid, (err, result) => {
                if(err){
                    //回滚事务
                    mysql.rollback(() => {
                        logger.error('(class-delete):' + err.message);
                        done(new Error('开课删除失败！'))
                    });
                }
                else{
                    mysql.query(cdeleteSql, classid, (err, result) => {
                        if(err){
                            //回滚事务
                            mysql.rollback(() => {
                                logger.error('(class-delete):' + err.message);
                                done(new Error('开课删除失败！'))
                            });
                        }
                        else{
                            //提交事务
                            mysql.commit(function(err) {
                                if(err){
                                    mysql.rollback(() => {
                                        logger.error('(class-delete):' + err.message);
                                        done(new Error('开课删除失败！'))
                                    });
                                }
                            });
                            logger.info('(class-delete):' + classid + '开课删除成功');
                            done(null, {msg: '开课删除成功'})
                        }
                    })
                }
            })
        }
    })
    mysql.release()

    // const mysql = await connectHandler();
    // mysql.query(deleteSql, classid, (err, result) => {
    //     if(err){
    //         logger.error('(class-delete):' + err.message);
    //         done(new Error('开课删除失败！'))
    //     }
    //     else{
    //         logger.info('(class-delete):' + classid + '开课删除成功');
    //         done(null, {msg: '开课删除成功'})
    //     }
    // })
    // mysql.release();
}

// 根据开课号获取开课信息
// var options = {
//     classid: String
// }
function id2detail(msg, done){
    var { classid, askerid } = msg;

    var getClass = () => {
        return new Promise((resolve, reject) => {
            if(classid){
                redis.mget('class:' + classid, (err, res) => {
                    if(err){
                        reject('数据库访问失败，请稍后再试...')
                    }
                    else{
                        res = JSON.parse(res);
                        resolve(res)
                    }
                })
            }
            else{
                reject('classid不能为空')
            }
        })
    }
    getClass().then(result => {
        return new Promise((resolve, reject) => {
            var options = {
                askerid: askerid,
                userid: result.teacherid,
                identity: 'teacher'
            }
            userSeneca.act('target:server-user,module:user,if:detail', options,
            (err, res) => {
                if(err){
                    reject('server-user访问失败')
                }
                else{
                    result.teacher = res;
                    resolve(result)
                }
            })
        })
    })
    .then(result => {
        return new Promise((resolve, reject) => {
            redis.mget('course:' + result.courseid, (err, res) => {
                if(err){
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    res = JSON.parse(res);
                    result.course = res;
                    resolve(result)
                }
            })
        })
    })
    .then(result => {
        done(null, result)
    })
    .catch(err => {
        logger.error('(class-id2detail):' + err);
        done(new Error(err))
    })
}

// 根据课程号获取开课列表
// var options = {
//     courseid: String,
//     schoolYear: String,
//     schoolTerm: String
// }
function course(msg, done){
    var { courseid, schoolYear, schoolTerm } = msg;

    var teacherDetail = [];
    var union = () => {
        return new Promise((resolve, reject) => {
            redis.sinter('idx:class:course:' + courseid, 'idx:class:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, (err, keys) => {
                if(err){
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    resolve(keys)
                }
            })
        })
    }
    // 获取当前学期该课程的开课编号
    union().then(result => {
        return new Promise((resolve, reject) => {
            result = result.map(item => {
                return 'class:' + item;
            })
            if(result.length == 0){
                reject('该课程没有开课')
            }
            redis.mget(result, (err, keys) => {
                if(err){
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    resolve(keys)
                }
            })
        })
    })
    .then(result => {
        return new Promise((resolve, reject) => {
            var teacherid = [];
            result = result.map(item => {
                item = JSON.parse(item);
                if(teacherid.indexOf(item.teacherid) == -1){
                    teacherid.push(item.teacherid);
                }
                return item;
            })
            options = {
                identity: 'teacher',
                userid: teacherid
            }
            userSeneca.act('target:server-user,module:user,if:id2name', options,
            (err, res) => {
                if(err){
                    reject('server-user访问失败')
                }
                else{
                    teacherDetail = res;
                    resolve(result)
                }
            })
        })
    })
    .then(result => {
        result = result.map(item => {
            var index = teacherDetail.findIndex(citem => {
                return item.teacherid == citem.userid;
            })
            item.teacher = teacherDetail[index];
            return item;
        })
        done(null, result)
    })
    .catch(err => {
        logger.error('(class-course):' + err);
        done(new Error(err))
    })
}

// 开课导入
router.post('/class/import', async (msg, done) => {
    try{
        var courseIndex = 0;
        var teacherIndex = 1;
        var schoolYearIndex = 2;
        var schoolTermIndex = 3;
        var sessionIndex = 5;

        var file = msg.body.file;
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
        var rule = ['课程号', '教师编号', '学年', '学期', '容量', '上课时间'];
        // 确认表格头部是否正确
        for(var i = 0; i < rule.length; i++){
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

        // 课程获取
        var getCourse = new Promise((resolve, reject) => {
            redis.sort('idx:course', 'alpha', (err, keys) => {
                if(err){
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    resolve(keys)
                }
            })
        })

        // 教师获取
        var getTeacher = new Promise((resolve, reject) => {
            var options = { identity: 'teacher' }
            userSeneca.act('target:server-user,module:user,if:idList', options,
            (err,res) => {
                if(err){
                    reject('server-user访问失败')
                }
                else{
                    resolve(res)
                }
            })
        })

        var getExistSession =  (item) => {
            return new Promise((resolve, reject) => {
                // 判断该教师该学期该时间是否已经有排课
                redis.sinter('idx:class:teacher:' + item.data[teacherIndex], 'idx:class:schoolYear:' + item.data[schoolYearIndex] + ':schoolTerm:' + item.data[schoolTermIndex], (err, keys) => {
                    if(err){
                        logger.error('(class-import):' + err.message);
                        reject('数据库访问失败，请稍后再试...')
                    }
                    else if(keys.length != 0){
                        var options = [];
                        keys.forEach(sitem => {
                            options.push('class:' + sitem);
                        })
                        redis.mget(options, (err, res) => {
                            if(err){
                                logger.error('(class-import):' + err.message);
                                reject('数据库访问失败，请稍后再试...')
                            }
                            else{
                                var existsession = [];
                                res.forEach(mitem => {
                                    mitem = JSON.parse(mitem);
                                    existsession = existsession.concat(mitem.session.split(';'));
                                })
                                existsession = existsession.filter(mitem => {
                                    return mitem.length != 0;
                                })

                                item.session.forEach(citem => {
                                    if(existsession.indexOf(citem) != -1){
                                        reject(item.data[teacherIndex] + '教师在' + citem + '已经排课，请重新检查文件内容是否符合要求！')
                                    }
                                })

                                resolve(true)
                            }
                        })
                    }
                    else{
                        resolve(true)
                    }
                })
            })
        }

        var insertSql = 'insert into class(courseid, teacherid, schoolYear, schoolTerm, capacityLimit, session) values';
        var insert_params = [];
        Promise.all([getCourse, getTeacher])
            .then(result => {
                return new Promise((resolve, reject) => {
                    var courseList = result[0];
                    var teacherList = result[1];

                    var weekday = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
                    var teacherSession = [];
                    data.forEach(async item => {
                        // 数据不能有空项
                        item = item.filter((value) => {    
                            return !(
                                value === undefined ||
                                value === null ||
                                (typeof value === 'object' && Object.keys(value).length === 0) ||
                                (typeof value === 'string' && value.trim().length === 0)
                            )
                        })
                        if(item.length != rule.length){
                            reject('格式错误，请重新检查文件内容是否符合要求！')
                        }

                        // 判断课程是否存在
                        if(courseList.indexOf(item[courseIndex].toString()) == -1){
                            reject('课程号' + item[courseIndex] + '不存在，请重新检查文件内容是否符合要求！')
                        }

                        // 判断教师是否存在
                        if(teacherList.indexOf(item[teacherIndex].toString()) == -1){
                            reject('教师' + item[teacherIndex] + '不存在，请重新检查文件内容是否符合要求！')
                        }

                        // 判断上课时间是否符合规范
                        var sessions = item[sessionIndex].split(';').filter(item => {
                            return item.length != 0;
                        })
                        // 最长的上课时间格式为Thur-12，7个字符
                        for(let i in sessions){
                            if(sessions[i].length > 8){
                                reject('上课时间格式错误，请重新检查文件内容是否符合要求！')
                            }
                            else if(sessions[i].length != 0){
                                var stemp = sessions[i].split('-');
                                var day = stemp[0];
                                if(sessions[i].indexOf('-') == -1 || weekday.indexOf(day) == -1){
                                    reject('上课时间格式错误，请重新检查文件内容是否符合要求！')
                                }
                            }
                        }
                        teacherSession.push({
                            data: item,
                            session: sessions
                        })

                        insertSql += ' (?,?,?,?,?,?),';
                        insert_params = insert_params.concat(item);
                    })
                    insertSql = insertSql.slice(0, insertSql.length - 1);
                    resolve(teacherSession)
                })
            })
            .then(result => {
                Promise.all(result.map(item => {
                    return new Promise(async (resolve, reject) => {
                        getExistSession(item)
                        .then(result => {
                            resolve(result)
                        })
                        .catch(err => {
                            reject(err)
                        })
                    })
                }))
                .then(async result => {
                    const mysql = await connectHandler();
                    mysql.query(insertSql, insert_params, (err, result) => {
                        if(err){
                            logger.error('(class-import):' + err.message);
                            done.send({status: 500, msg: '开课导入失败！'})
                        }
                        else{
                            logger.info('(class-import):开课导入成功');
                            done.send({msg: '开课导入成功'})
                        }
                    })
                    mysql.release();
                })
                .catch(err => {
                    logger.error('(class-import):' + err);
                    done.send({status: 500, msg: err})
                })
            })
            .catch(err => {
                logger.error('(class-import):' + err);
                done.send({status: 500, msg: err})
            })
    }
    catch(err){
        logger.error('(class-import):' + err.message);
        done.send({status: 500, msg: err.message})
    }
})

// 教师开课列表
// var options = {
//     teacherid: String, 
//     schoolYear: String, 
//     schoolTerm: String, 
//     filter: {
//         isPage: Boolean, 
//         page: int/null, 
//         size: int/null
//     }
// }
async function tlist(msg, done){
    var { teacherid, schoolYear, schoolTerm } = msg;
    var filter = JSON.parse(msg.filter);
    var { askerid } = msg;
    var res = {
        count: 0,
        data: []
    }

    var getClass = async () => {
        return await new Promise((resolve) => {
            redis.sinter('idx:class:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, 'idx:class:teacher:' + teacherid, (err, keys) => {
                if(err){
                    logger.error('(class-tlist):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    res.count = keys.length;
                    resolve(keys)
                }
            })
        })
    }
    var classList = await getClass();

    // 分页
    if(filter.isPage){
        classList = classList.slice((filter.page-1)*filter.size, filter.page*filter.size);
    }

    // 获取教师信息
    var getTeacher = (teacherid) => {
        return new Promise((resolve, reject) => {
            var options = {
                askerid: askerid,
                userid: teacherid,
                identity: 'teacher'
            }
            userSeneca.act('target:server-user,module:user,if:detail', options,
            (err, res) => {
                if(err){
                    reject('server-user访问失败')
                }
                else{
                    resolve(res)
                }
            })
        })
    }
    var teacher = await getTeacher(teacherid).catch(err => {
        logger.error('(class-tlist):' + err);
        done(new Error(err))
    });
    
    // 获取课程信息
    var getCourse = (courseid) => {
        return new Promise((resolve, reject) => {
            redis.mget('course:' + courseid, (err, res) => {
                if(err){
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    resolve(JSON.parse(res))
                }
            })
        })
    }

    var classid = [];
    classList.forEach(item => {
        classid.push('class:' + item);
    })
    if(classid.length != 0){
        redis.mget(classid, (err, keys) => {
            if(err){
                logger.error('(class-tlist):' + err.message);
                done(new Error('数据库访问失败，请稍后再试...'))
            }
            else{
                Promise.all(keys.map(item => {
                    return new Promise(async (resolve, reject) => {
                        item = JSON.parse(item);
                        item.teacher = teacher;
                        item.course = await getCourse(item.courseid).catch(err => {
                            reject(err)
                        });
                        resolve(item)
                    })
                }))
                .then(result => {
                    res.data = result;
                    done(null, res)
                })
                .catch(err => {
                    logger.error('(class-tlist):' + err);
                    done(new Error(err))
                })
            }
        })
    }
    else{
        done(null, [])
    }
}

// 上传图片
// var options = {
//     classid: String
// }
router.post('/class/img', async (msg, done) => {
    try{
        var file = msg.body.file;
        var { classid } = msg.body.options;
        // 数组转buffer
        var copy = Buffer.from(file.buffer.data)
        var tail = '.' + file.originalname.split('.')[1];
        var filename = (new Date()).getTime();
        var ws = fs.createWriteStream(key.appendixDir + filename + tail);
        ws.write(copy);
        ws.end();
        
        // 修改数据库
        const mysql = await connectHandler();
        var updateSql = 'update class set img = ? where classid = ?';
        var update_params = [filename + tail, classid];
        mysql.query(updateSql, update_params, (err, result) => {
            if(err){
                logger.error('(class-img):' + err.message);
                done.send({status: 500, msg: '图片上传失败！'})
            }
            else{
                logger.info('(class-img):图片上传成功！');
                done.send({msg: "图片上传成功！"})
            }
        })
        mysql.release();
    }
    catch(err){
        logger.error('(class-img):' + err.message);
        done.send({status: 500, msg: err.message})
    }
})

// 获取开课图片
router.get('/class/img/:img', (msg, done) => {
    var imgPath = key.appendixDir + msg.params.img;
    fs.exists(imgPath, (exists) => {
        if(!exists){
            imgPath = key.appendixDir + 'default.jpg';
        }
        fs.readFile(imgPath, (err, imgbuffer) => {
            var type = msg.params.img.split('.');
            type = type[type.length - 1];
            done.type(type);
            done.send(imgbuffer);
        })
    });
})

module.exports = {
    list: list,
    add: add,
    edit: edit,
    delete: mydelete,
    id2detail: id2detail,
    course: course,
    tlist: tlist,
    router: router
}