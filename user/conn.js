var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '192.168.99.100',
    user: 'root',
    password: '123456',
    database: 'user'
});

module.exports = {
    connection: connection
}