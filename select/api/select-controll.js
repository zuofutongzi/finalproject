const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 选课情况获取
function detail(msg, done){
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
async function set(msg, done){
    var { schoolYear, schoolTerm, selectStart, selectEnd, isCapacityLimit, isDrop } = msg;
    var updateSql = 'update classControll set schoolYear = ?, schoolTerm = ?, selectStart = ?, selectEnd = ?, isCapacityLimit = ?, isDrop = ?, isDrawLots = ?';
    var update_params = [ schoolYear, schoolTerm, selectStart, selectEnd, isCapacityLimit, isDrop, 0];

    // 清空等候队列
    redis.del('select:waitingDQueue', 'select:waitingSQueue')

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, res) => {
        if(err){
            logger.error('(select-controllSet):' + err.message);
            done(new Error('课程设置失败！'))
        }
        else{
            logger.info('(course-controllSet):课程设置成功');
            done(null, {msg: '课程设置成功'})
        }
    })
    mysql.release();
}

module.exports = {
    detail: detail,
    set: set
}