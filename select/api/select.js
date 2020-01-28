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

    done(null, {a: 1})
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

            const mysql = await connectHandler();
            mysql.query(insertSql, insert_params, (err, res) => {
                if(err){
                    reject(studentid + '选课' + classid + '失败')
                }
                else{
                    resolve('success')
                }
            })
            mysql.release()
        })
    })
    .then(result => {
        done(null, {code: 200, msg: '选课成功'})
    })
    .catch(err => {
        logger.error('(select-select):' + err)
        done(null, {code: 500, msg: '选课失败'})
    })
}

module.exports = {
    list: list,
    select: select
}