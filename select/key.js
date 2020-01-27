var mysql = require('mysql')
var redis = require('redis')
const userSeneca = require('seneca')()

// 连接池
const pool = mysql.createPool({
    host: '192.168.99.100',
    port: '3307',
    user: 'root',
    password: '123456',
    database: 'course'
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

var redisClient = redis.createClient(6378, '192.168.99.100');
redisClient.on('error', err => {
    console.log('Error ' + err)
})

// 用户服务
const userServer = {
    port: '8001',
    pin: 'target:server-user',
    //host: '192.168.99.100' // docker启动
    host: '127.0.0.1'
}
userSeneca.client(userServer)

module.exports = {
    mysql: mysqlConnection,
    redis: redisClient,
    userSeneca: userSeneca,
    appendixDir: './附件/',
    saltRounds: 10
}