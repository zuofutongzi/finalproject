const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 学生选课信息
// var options = {
//     studentid: String,
//     schoolYear: String/null, // 学年学期要么都填，要么都不填
//     schoolTerm: String/null
// }
function list(msg, done){
    var { studentid } = msg;
    var { schoolYear, schoolTerm } = msg;

    var getClass = () => {
        return new Promise((resolve, reject) => {
            if(schoolYear){
                redis.sort('idx:class:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, 'alpha', (err, keys) => {
                    if(err){
                        reject('数据库访问失败，请稍后再试...')
                    }
                    else{
                        resolve(keys)
                    }
                })
            }
            else{
                resolve([])
            }
        })
    }
    // 获取学期开课号
    getClass().then(result => {
        // 获取学生选课，判断学生该学期的选课
        return new Promise((resolve, reject) => {
            redis.smembers('idx:classSelect:student:' + studentid, (err, keys) => {
                if(err){
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    keys = keys.map(item => {
                        return JSON.parse(item).classid
                    })
                    if(schoolYear){
                        var classid = [];
                        keys.forEach(item => {
                            if(result.indexOf(item) != -1){
                                classid.push(item);
                            }
                        })
                        resolve(classid)
                    }
                    else{
                        resolve(keys)
                    }
                }
            })
        })
    })
    .then(result => {
        return new Promise((resolve, reject) => {
            result = result.map(item => {
                return 'class:' + item;
            })
            if(result.length != 0){
                redis.mget(result, (err, keys) => {
                    if(err){
                        reject('数据库访问失败，请稍后再试...')
                    }
                    else{
                        keys = keys.map(item => {
                            return JSON.parse(item);
                        })
                        resolve(keys)
                    }
                })
            }
            else{
                resolve([])
            }
        })
    })
    .then(result => {
        done(null, result)
    })
    .catch(err => {
        logger.error('(select-list):' + err);
        done(new Error(err))
    })
}

// 学生选课
// var options = {
//     stuclassid: String,
//     studentid: String,
//     classid: String,
//     teacherid: String,
//     courseid: String,
//     schoolYear: String,
//     schoolTerm: String
// }
function select(msg, done){
    var { stuclassid, studentid, classid, teacherid, courseid, schoolYear, schoolTerm } = msg;
    var type = '';

    var getMajor = () => {
        return new Promise((resolve, reject) => {
            userSeneca.act('target:server-user,module:user,if:class2major', {classid: stuclassid},
            (err, res) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    resolve(res)
                }
            })
        })
    }
    getMajor().then(result => {
        // 判断是否在选课计划内
        return new Promise((resolve, reject) => {
            redis.mget('courseSchedule:' + result.majorid + ':' + courseid, (err, res) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else if(res[0] == null){
                    type = '通识选修课程';
                    resolve('通识选修课程')
                }
                else{
                    res = JSON.parse(res)
                    type = res.type;
                    resolve(res.type)
                }
            })
        })
    })
    .then(result => {
        // 获取学生已选课程
        return new Promise((resolve, reject) => {
            redis.sort('idx:classSelect:student:' + studentid, 'alpha', (err, keys) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    keys = keys.map(item => {
                        return JSON.parse(item)
                    })
                    resolve(keys)
                }
            })
        })
    })
    .then(result => {
        // 获取该学期的选课
        return new Promise((resolve, reject) => {
            var classid = [];
            redis.sort('idx:class:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, 'alpha', (err, keys) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    result.forEach(item => {
                        if(keys.indexOf(item.classid) != -1){
                            classid.push('class:' + item.classid);
                        }
                    });
                    resolve(classid)
                }
            })
        })
    })
    .then(result => {
        // 获取该学期的上课时间
        return new Promise((resolve, reject) => {
            if(result.length != 0){
                redis.mget(result, (err, keys) => {
                    if(err){
                        reject(studentid + '选课' + classid + '失败')
                    }
                    else{
                        var session = [];
                        keys.forEach(item => {
                            var temp = JSON.parse(item).session.split(';');
                            temp.forEach(citem => {
                                if(citem !== ''){
                                    session.push(citem)
                                }
                            })
                        })
                        resolve(session)
                    }
                })
            }   
            else{
                resolve([])
            }
        })
    })
    .then(result => {
        // 获取所选课程的上课时间，比对是否时间冲突
        return new Promise((resolve, reject) => {
            redis.mget('class:' + classid, (err, res) => {
                if(err || res[0] == null){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    session = JSON.parse(res).session.split(';');
                    session.forEach(item => {
                        if(result.indexOf(item) != -1){
                            reject(studentid + '选课' + classid + '失败，时间冲突')
                        }
                    })
                    resolve('success')
                }
            })
        })
    })
    .then(result => {
        // 将选课从等候队列删除
        return new Promise((resolve, reject) => {
            var options = {
                studentid: studentid,
                classid: classid,
                courseid: courseid
            }
            redis.srem('select:waitingSQueue', JSON.stringify(options), (err, res) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败，停留在选课等候队列')
                }
                else{
                    resolve('success')
                }
            })
        })
    })
    .then(result => {
        // 插入数据库
        return new Promise(async (resolve, reject) => {
            var insertSql = 'insert into classSelect (studentid, classid, teacherid, type) values(?, ?, ?, ?)';
            var insert_params = [studentid, classid, teacherid, type];
            var updateSql = 'update class set capacityReal = capacityReal + 1 where classid = ?';
            var update_params = [classid];

            const mysql = await connectHandler();
            mysql.beginTransaction(err => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    mysql.query(insertSql, insert_params, (err, result) => {
                        if(err){
                            //回滚事务
                            mysql.rollback(() => {
                                reject(studentid + '选课' + classid + '失败')
                            });
                        }
                        else{
                            mysql.query(updateSql, update_params, (err, result) => {
                                if(err){
                                    //回滚事务
                                    mysql.rollback(() => {
                                        reject(studentid + '选课' + classid + '失败')
                                    });
                                }
                                else{
                                    //提交事务
                                    mysql.commit(function(err) {
                                        if(err){
                                            mysql.rollback(() => {
                                                reject(studentid + '选课' + classid + '失败')
                                            });
                                        }
                                    });
                                    resolve(studentid + '选课' + classid + '成功')
                                }
                            })
                        }
                    })
                }
            })
            mysql.release()
        })
    })
    .then(result => {
        logger.info('(select-select):' + result)
        done(null, {code: 200, msg: '选课成功'})
    })
    .catch(err => {
        logger.error('(select-select):' + err)
        done(null, {code: 500, msg: '选课失败'})
    })
}

// 学生退课
// var options = {
//     studentid: String,
//     classid: String,
//     courseid: String
// }
async function mydelete(msg, done){
    var { studentid, classid, courseid } = msg;

    var deleteSql = 'delete from classSelect where studentid = ? and classid = ?';
    var delete_params = [studentid, classid];

    var deleteWaiting = () => {
        return new Promise((resolve, reject) => {
            var options = {
                studentid: studentid,
                classid: classid,
                courseid: courseid
            }
            redis.srem('select:waitingDQueue', JSON.stringify(options), (err, res) => {
                if(err){
                    reject(studentid + '退课' + classid + '失败，停留在退课等候队列')
                }
                else{
                    resolve('success')
                }
            })
        })
    }
    deleteWaiting().then(result => {
        return new Promise(async (resolve, reject) => {
            const mysql = await connectHandler();
            mysql.beginTransaction(err => {
                if(err){
                    reject('(select-delete):' + studentid + '退课' + classid + '失败')
                }
                else{
                    mysql.query(deleteSql, delete_params, (err, result) => {
                        if(err){
                            //回滚事务
                            mysql.rollback(() => {
                                reject('(select-delete):' + studentid + '退课' + classid + '失败')
                            });
                        }
                        else{
                            var updateSql = 'update class set capacityReal = capacityReal - ' + result.affectedRows + ' where classid = ?';
                            var update_params = [classid];
                            mysql.query(updateSql, update_params, (err, result) => {
                                if(err){
                                    //回滚事务
                                    mysql.rollback(() => {
                                        reject('(select-delete):' + studentid + '退课' + classid + '失败')
                                    });
                                }
                                else{
                                    //提交事务
                                    mysql.commit(function(err) {
                                        if(err){
                                            mysql.rollback(() => {
                                                reject('(select-delete):' + studentid + '退课' + classid + '失败')
                                            });
                                        }
                                    });
                                    resolve('(select-delete):' + studentid + '退课' + classid + '成功')
                                }
                            })
                        }
                    })
                }
            })
            mysql.release()
        })
    })
    .then(result => {
        logger.info('(select-delete):' + result)
        done(null, {code: 200, msg: '退课成功'})
    })
    .catch(err => {
        logger.error('(select-delete):' + err)
        done(null, {code: 500, msg: '退课失败'})
    })
}

// 学生抢课
// var options = {
//     stuclassid: String,
//     studentid: String,
//     classid: String,
//     courseid: String,
//     teacherid: String,
//     schoolYear: String,
//     schoolTerm: String
// }
function selectLimit(msg, done){
    var { stuclassid, studentid, classid, courseid, teacherid, schoolYear, schoolTerm } = msg;
    var type = '';

    var getMajor = () => {
        return new Promise((resolve, reject) => {
            userSeneca.act('target:server-user,module:user,if:class2major', {classid: stuclassid},
            (err, res) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    resolve(res)
                }
            })
        })
    }
    getMajor().then(result => {
        // 判断是否在选课计划内
        return new Promise((resolve, reject) => {
            redis.mget('courseSchedule:' + result.majorid + ':' + courseid, (err, res) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else if(res[0] == null){
                    type = '通识选修课程';
                    resolve('通识选修课程')
                }
                else{
                    res = JSON.parse(res)
                    type = res.type;
                    resolve(res.type)
                }
            })
        })
    })
    .then(result => {
        // 获取学生已选课程
        return new Promise((resolve, reject) => {
            redis.sort('idx:classSelect:student:' + studentid, 'alpha', (err, keys) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    keys = keys.map(item => {
                        return JSON.parse(item)
                    })
                    resolve(keys)
                }
            })
        })
    })
    .then(result => {
        // 获取该学期的选课
        return new Promise((resolve, reject) => {
            var classid = [];
            redis.sort('idx:class:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, 'alpha', (err, keys) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    result.forEach(item => {
                        if(keys.indexOf(item.classid) != -1){
                            classid.push('class:' + item.classid);
                        }
                    });
                    resolve(classid)
                }
            })
        })
    })
    .then(result => {
        // 获取该学期的上课时间
        return new Promise((resolve, reject) => {
            if(result.length != 0){
                redis.mget(result, (err, keys) => {
                    if(err){
                        reject(studentid + '选课' + classid + '失败')
                    }
                    else{
                        var session = [];
                        keys.forEach(item => {
                            var temp = JSON.parse(item).session.split(';');
                            temp.forEach(citem => {
                                if(citem !== ''){
                                    session.push(citem)
                                }
                            })
                        })
                        resolve(session)
                    }
                })
            }   
            else{
                resolve([])
            }
        })
    })
    .then(result => {
        // 获取所选课程的上课时间，比对是否时间冲突
        return new Promise((resolve, reject) => {
            redis.mget('class:' + classid, (err, res) => {
                if(err || res[0] == null){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    session = JSON.parse(res).session.split(';');
                    session.forEach(item => {
                        if(result.indexOf(item) != -1){
                            reject(studentid + '选课' + classid + '失败，时间冲突')
                        }
                    })
                    resolve('success')
                }
            })
        })
    })
    .then(result => {
        // 插入数据库
        return new Promise(async (resolve, reject) => {
            var insertSql = 'insert into classSelect (studentid, classid, teacherid, type) values(?, ?, ?, ?)';
            var insert_params = [studentid, classid, teacherid, type];
            var updateSql = 'update class set capacityReal = capacityReal + 1 where classid = ? and capacityReal < capacityLimit';
            var update_params = [classid];

            const mysql = await connectHandler();
            mysql.beginTransaction(err => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    mysql.query(insertSql, insert_params, (err, result) => {
                        if(err){
                            //回滚事务
                            mysql.rollback(() => {
                                reject(studentid + '选课' + classid + '失败')
                            });
                        }
                        else{
                            mysql.query(updateSql, update_params, (err, result) => {
                                if(err){
                                    //回滚事务
                                    mysql.rollback(() => {
                                        reject(studentid + '选课' + classid + '失败')
                                    });
                                }
                                else if(result.affectedRows == 0){
                                    //回滚事务
                                    mysql.rollback(() => {
                                        reject(studentid + '选课' + classid + '失败')
                                    });
                                }
                                else{
                                    //提交事务
                                    mysql.commit(function(err) {
                                        if(err){
                                            mysql.rollback(() => {
                                                reject(studentid + '选课' + classid + '失败')
                                            });
                                        }
                                    });
                                    resolve(studentid + '选课' + classid + '成功')
                                }
                            })
                        }
                    })
                }
            })
            mysql.release()
        })
    })
    .then(result => {
        logger.info('(select-selectLimit):' + result)
        done(null, {msg: '选课成功'})
    })
    .catch(err => {
        logger.error('(select-selectLimit):' + err)
        done(new Error('选课失败'))
    })
}

// 获取学生等待队列
// var options = {
//     studentid: String
// }
function waiting(msg, done){
    var { studentid } = msg;
    var courseid = [];
    var classid = [];

    var getSQueue = new Promise((resolve, reject) => {
        redis.smembers('select:waitingSQueue', (err, keys) => {
            if(err){
                reject('数据库访问失败，请稍后再试...')
            }
            else{
                keys = keys.map(item => {
                    item = JSON.parse(item);
                    item.courseName = '';
                    return item;
                })
                keys = keys.filter(item => {
                    return item.studentid == studentid;
                })
                keys.forEach(item => {
                    if(courseid.indexOf('course:' + item.courseid) == -1){
                        courseid.push('course:' + item.courseid);
                    }
                    if(classid.indexOf('class:' + item.classid) == -1){
                        classid.push('class:' + item.classid);
                    }
                })
                resolve(keys)
            }
        })
    })
    var getDQueue = new Promise((resolve, reject) => {
        redis.smembers('select:waitingDQueue', (err, keys) => {
            if(err){
                reject('数据库访问失败，请稍后再试...')
            }
            else{
                keys = keys.map(item => {
                    item = JSON.parse(item);
                    item.courseName = '';
                    return item;
                })
                keys = keys.filter(item => {
                    return item.studentid == studentid;
                })
                keys.forEach(item => {
                    if(courseid.indexOf('course:' + item.courseid) == -1){
                        courseid.push('course:' + item.courseid);
                    }
                    if(classid.indexOf('class:' + item.classid) == -1){
                        classid.push('class:' + item.classid);
                    }
                })
                resolve(keys)
            }
        })
    })
    Promise.all([getSQueue, getDQueue])
        .then(result => {
            return new Promise((resolve, reject) => {
                var waiting = {
                    select: result[0],
                    delete: result[1]
                }
                if(courseid.length != 0){
                    redis.mget(courseid, (err, keys) => {
                        if(err){
                            reject('数据库访问失败，请稍后再试...')
                        }
                        else{
                            keys = keys.map(item => {
                                return JSON.parse(item)
                            })
                            waiting.select = waiting.select.map(item => {
                                var index = keys.findIndex(citem => {
                                    return item.courseid == citem.courseid;
                                })
                                if(index != -1){
                                    item.courseName = keys[index].name;
                                }
                                else{
                                    item.courseName = '';
                                }
                                return item
                            })
                            waiting.select = waiting.select.filter(item => {
                                return item.courseName != '';
                            })
                            waiting.delete = waiting.delete.map(item => {
                                var index = keys.findIndex(citem => {
                                    return item.courseid == citem.courseid;
                                })
                                if(index != -1){
                                    item.courseName = keys[index].name;
                                }
                                else{
                                    item.courseName = '';
                                }
                                return item
                            })
                            waiting.delete = waiting.delete.filter(item => {
                                return item.courseName != '';
                            })
                            resolve(waiting)
                        }
                    })
                }
                else{
                    resolve({select: [], delete: []})
                }
            })
        })
        .then(result => {
            return new Promise((resolve, reject) => {
                if(classid.length != 0){
                    redis.mget(classid, (err, keys) => {
                        if(err){
                            reject('数据库访问失败，请稍后再试...')
                        }
                        else{
                            keys = keys.map(item => {
                                return JSON.parse(item)
                            })
                            result.select = result.select.map(item => {
                                var index = keys.findIndex(citem => {
                                    return item.classid == citem.classid;
                                })
                                if(index != -1){
                                    item.session = keys[index].session;
                                }
                                else{
                                    item.session = '';
                                }
                                return item
                            })
                            result.select = result.select.filter(item => {
                                return item.session != '';
                            })
                            result.delete = result.delete.map(item => {
                                var index = keys.findIndex(citem => {
                                    return item.courseid == citem.courseid;
                                })
                                if(index != -1){
                                    item.session = keys[index].session;
                                }
                                else{
                                    item.session = '';
                                }
                                return item
                            })
                            result.delete = result.delete.filter(item => {
                                return item.session != '';
                            })
                            resolve(result)
                        }
                    })
                }
                else{
                    resolve({select: [], delete: []})
                }
            })
        })
        .then(result => {
            done(null, result)
        })
        .catch(err => {
            logger.error('(select-waiting):' + err)
            done(err)
        })
}

// 不对外开放

// 放入选课等待队列
// var options = {
//     studentid: String,
//     classid: String,
//     courseid: String
// }
function waitingSQueue(msg, done){
    var { studentid, classid, courseid } = msg;
    var options = {
        studentid: studentid,
        classid: classid,
        courseid: courseid
    }

    redis.sadd('select:waitingSQueue', JSON.stringify(options), (err, res) => {
        if(err){
            logger.error('(select-waitingSQueue):' + studentid + '选课' + classid + '排队失败')
            done(new Error('排队失败'))
        }
        else{
            logger.info('(select-waitingSQueue):' + studentid + '选课' + classid + '排队成功')
            done(null, {msg: '进入选课队列，请勿重复选课'})
        }
    })
}

// 放入退课等待队列
// var options = {
//     studentid: String,
//     classid: String,
//     courseid: String
// }
function waitingDQueue(msg, done){
    var { studentid, classid, courseid } = msg;
    var options = {
        studentid: studentid,
        classid: classid,
        courseid: courseid
    }

    redis.sadd('select:waitingDQueue', JSON.stringify(options), (err, res) => {
        if(err){
            logger.error('(select-waitingDQueue):' + studentid + '退课' + classid + '排队失败')
            done(new Error('排队失败'))
        }
        else{
            logger.info('(select-waitingDQueue):' + studentid + '退课' + classid + '排队成功')
            done(null, {msg: '进入退课队列，请勿重复退课'})
        }
    })
}

module.exports = {
    list: list,
    select: select,
    mydelete: mydelete,
    selectLimit: selectLimit,
    waiting: waiting,

    waitingSQueue: waitingSQueue,
    waitingDQueue: waitingDQueue
}