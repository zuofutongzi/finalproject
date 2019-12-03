var mysql = require('mysql');
var redis = require('redis')

var mysqlConnection = mysql.createConnection({
    host: '192.168.99.100',
    user: 'root',
    password: '123456',
    database: 'user'
});
mysqlConnection.connect(err => {
    if(err){
        console.log('[query] - :' + err);
        return ;
    }
    console.log('[connection connect] succeed!');
});

var redisClient = redis.createClient(6379, '192.168.99.100');
redisClient.on('error', err => {
    console.log('Error ' + err)
})

module.exports = {
    mysql: mysqlConnection,
    redis: redisClient
}