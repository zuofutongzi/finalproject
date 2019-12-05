const userSeneca = require('seneca')()

const userServer = {
    port: '8001',
    pin: 'target:server-user',
    //host: '192.168.99.100'
    host: '127.0.0.1'
}
userSeneca.client(userServer)

module.exports = {
    userSeneca: userSeneca,
    secretOrKey: 'secret'
}