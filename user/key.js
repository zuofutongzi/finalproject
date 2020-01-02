var mysql = require('mysql')
var redis = require('redis')
const logger = require('./logger')

// var mysqlConnection = mysql.createConnection({
//     host: '192.168.99.100',
//     user: 'root',
//     password: '123456',
//     database: 'user'
// });
// mysqlConnection.connect(err => {
//     if(err){
//         console.log('[query] - :' + err);
//         return ;
//     }
//     console.log('[connection connect] succeed!');
// });

// 连接池
const pool = mysql.createPool({
    host: '192.168.99.100',
    user: 'root',
    password: '123456',
    database: 'user'
})
// 返回一个Promise链接
const mysqlConnection = () => new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if(err) {
            console.error('链接错误：' + err.stack + '\n' + '链接ID：' + connection.threadId)
            reject(err)
        } else {
            resolve(connection)
        }
    })
})

var redisClient = redis.createClient(6379, '192.168.99.100');
redisClient.on('error', err => {
    console.log('Error ' + err)
})

module.exports = {
    mysql: mysqlConnection,
    redis: redisClient,
    appendixDir: './附件/',
    saltRounds: 10
}