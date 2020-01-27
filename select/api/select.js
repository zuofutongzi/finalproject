const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 学生选课
// var options = { 
//     studentid: String,
//     classid: String,
//     teacherid: String
// }
function select(msg, done){
    done(null, {a: 1})
}

module.exports = {
    select: select
}