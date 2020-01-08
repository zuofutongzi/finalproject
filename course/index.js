const seneca = require('seneca')()
const express = require('express')
const bodyParser = require("body-parser")
const app = express()

// 使用body-parser中间件
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));
app.use(bodyParser.json({limit: '20mb'}));

const course = require('./api/course')

// course
seneca.add('target:server-course,module:course,if:list', course.list)
seneca.add('target:server-course,module:course,if:add', course.add)
app.use('/', course.router)

app.listen(8004)
seneca.listen(8003)
// docker启动
// app.listen(8002)
// seneca.listen(8001)