const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 成绩修改
// var options = {
//     classid: classid,
//     studentid: studentid,
//     grade: String
// }
async function edit(msg, done){
    var { classid, studentid, grade } = msg;
    var updateSql = 'update classSelect set grade = ? where classid = ? and studentid = ?';
    var update_params = [grade, classid, studentid];

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, result) => {
        if(err){
            logger.error('(course-edit):' + err.message);
            done(new Error('成绩录入失败！'))
        }
        else{
            logger.info('(course-edit):' + studentid + '学生' + classid + '课程成绩' + grade + '录入成功');
            done(null, {msg: '成绩录入成功'})
        }
    })
    mysql.release();
}

// 获取成绩控制
function getControll(msg, done){
    redis.mget('gradeControll:main', (err, res) => {
        if(err){
            logger.error('(course-getControll):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            done(null, JSON.parse(res))
        }
    })
}

// 设置成绩控制
// var options = {
//     schoolYear: String, 
//     schoolTerm: String, 
//     gradeStart: String, 
//     gradeEnd: String
// }
async function setControll(msg, done){
    var { schoolYear, schoolTerm, gradeStart, gradeEnd } = msg;
    var updateSql = 'update gradeControll set schoolYear = ?, schoolTerm = ?, gradeStart = ?, gradeEnd = ? where controllid = ?';
    var update_params = [schoolYear, schoolTerm, gradeStart, gradeEnd, 'main'];

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, result) => {
        if(err){
            logger.error('(course-setControll):' + err.message);
            done(new Error('成绩登记设置失败！'))
        }
        else{
            logger.info('(course-setControll):' + schoolYear + '-' + schoolTerm + '学年成绩登记设置成功');
            done(null, {msg: '成绩登记设置成功'})
        }
    })
    mysql.release();
}

// 以开课为单位获取学生成绩
// var options = {
//     classid: String
// }
function clist(msg, done){
    var { classid } = msg;

    var getClassSelect = () => {
        return new Promise((resolve, reject) => {
            redis.sort('idx:classSelect:class:' + classid, 'alpha', 'get', 'classSelect:*', (err, keys) => {
                if(err){
                    logger.error('(course-clist):' + err.message);
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    keys = keys.map(item => {
                        return JSON.parse(item)
                    })
                    resolve(keys)
                }
            })
        })
    }
    // 获取选课信息
    getClassSelect().then(result => {
        // 获取学生信息
        return new Promise((resolve, reject) => {
            var userid = [];
            result.forEach(item => {
                userid.push(item.studentid);
            })
            var options = {
                identity: 'student',
                userid: userid
            }
            userSeneca.act('target:server-user,module:user,if:id2name', options,
            (err, res) => {
                if(err){
                    logger.error('(course-scheduleImport):server-user访问失败');
                    reject('server-user访问失败')
                }
                else{
                    result = result.map(item => {
                        var index = res.findIndex(citem => {
                            return item.studentid == citem.userid;
                        })
                        if(index != -1){
                            item.name = res[index].name;
                        }
                        return item;
                    })
                    resolve(result)
                }
            })
        })
    })
    .then(result => {
        done(null, result)
    })
    .catch(err => {
        done(new Error(err))
    })
}

module.exports = {
    edit: edit,
    getControll: getControll,
    setControll: setControll,
    clist: clist,
    router: router
}