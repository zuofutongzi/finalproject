const userSeneca = require('seneca')()
const courseSeneca = require('seneca')()
const selectSeneca = require('seneca')()

// user服务
const userServer = {
    port: '8001',
    pin: 'target:server-user',
    //host: '192.168.99.100' // docker启动
    host: '127.0.0.1'
}
//const userServerRequest = 'http://192.168.99.100:8002' // docker启动
const userServerRequest = 'http://127.0.0.1:8002'
userSeneca.client(userServer)

// course服务
const courseServer = {
    port: '8003',
    pin: 'target:server-course',
    //host: '192.168.99.100' // docker启动
    host: '127.0.0.1'
}
//const courseServerRequest = 'http://192.168.99.100:8004' // docker启动
const courseServerRequest = 'http://127.0.0.1:8004'
courseSeneca.client(courseServer)

// select服务
const selectServer = {
    port: '8005',
    pin: 'target:server-select',
    //host: '192.168.99.100' // docker启动
    host: '127.0.0.1'
}
//const selectServerRequest = 'http://192.168.99.100:8006' // docker启动
const selectServerRequest = 'http://127.0.0.1:8006'
selectSeneca.client(selectServer)

module.exports = {
    userServerRequest: userServerRequest,
    userSeneca: userSeneca,
    courseServerRequest: courseServerRequest,
    courseSeneca: courseSeneca,
    selectServerRequest: selectServerRequest,
    selectSeneca: selectSeneca,
    secretOrKey: 'secret'
}