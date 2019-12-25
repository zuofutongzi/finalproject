const logger = require('../logger')
const key = require('../key')

const mysql = key.mysql
const redis = key.redis

function collegeList(msg, done){
    redis.sort('idx:college', 'get', 'college:*', (err, key) => {
        if(err){
            logger.error('(school-collegeList):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            var data = [];
            key.forEach(item => {
                data.push(JSON.parse(item))
            })
            done(null, data)
        }
    })
}

module.exports = {
    collegeList: collegeList
}