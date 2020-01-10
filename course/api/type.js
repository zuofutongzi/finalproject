const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis

// 课程类型
function list(msg, done){
    redis.sort('idx:type', 'alpha', (err, keys) => {
        if(err){
            logger.error('(type-list):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            done(null, keys)
        }
    })
}

module.exports = {
    list: list
}