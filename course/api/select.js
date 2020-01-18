const express = require('express')
const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 选课情况获取
function controllDetail(msg, done){
    redis.mget('classControll:main', (err, res) => {
        if(err){
            logger.error('(select-controllDetail):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            res = JSON.parse(res)
            done(null, res)
        }
    })
}

// 选课控制设置
// var options = {
//     schoolYear: String, 
//     schoolTerm: String, 
//     selectStart: String, 
//     selectEnd: String, 
//     isCapacityLimit: int,
//     isDrop: int
// }
async function controllSet(msg, done){
    var { schoolYear, schoolTerm, selectStart, selectEnd, isCapacityLimit, isDrop } = msg;
    var updateSql = 'update classControll set schoolYear = ?, schoolTerm = ?, selectStart = ?, selectEnd = ?, isCapacityLimit = ?, isDrop = ?, isDrawLots = ?';
    var update_params = [ schoolYear, schoolTerm, selectStart, selectEnd, isCapacityLimit, isDrop, 0];

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, res) => {
        if(err){
            logger.error('(select-controllSet):' + err.message);
            done(new Error('课程设置失败！'))
        }
        else{
            done(null, {msg: '课程设置成功'})
        }
    })
    mysql.release();
}

module.exports = {
    controllDetail: controllDetail,
    controllSet: controllSet
}