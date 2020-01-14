const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 添加开课
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
                            done({msg: '课程添加成功'})
                        }
                    })
                    break;
            }
        })
    mysql.release();
}

module.exports = {
    add: add
}