const userSeneca = require('seneca')()

const userServer = {
    port: '8001',
    pin: 'target:server-user',
    //host: '192.168.99.100'
    host: '127.0.0.1'
}
//const userServerRequest = 'http://192.168.99.100:8002'
const userServerRequest = 'http://127.0.0.1:8002'
userSeneca.client(userServer)

module.exports = {
    userServerRequest: userServerRequest,
    userSeneca: userSeneca,
    secretOrKey: 'secret'
}