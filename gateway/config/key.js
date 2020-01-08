const userSeneca = require('seneca')()
const courseSeneca = require('seneca')()

const userServer = {
    port: '8001',
    pin: 'target:server-user',
    //host: '192.168.99.100' // docker启动
    host: '127.0.0.1'
}
//const userServerRequest = 'http://192.168.99.100:8002' // docker启动
const userServerRequest = 'http://127.0.0.1:8002'
userSeneca.client(userServer)

const courseServer = {
    port: '8003',
    pin: 'target:server-course',
    host: '127.0.0.1'
}
const courseServerRequest = 'http://127.0.0.1:8004'
courseSeneca.client(courseServer)

module.exports = {
    userServerRequest: userServerRequest,
    userSeneca: userSeneca,
    courseServerRequest: courseServerRequest,
    courseSeneca: courseSeneca,
    secretOrKey: 'secret'
}