const seneca = require('seneca')()
const express = require('express')
const bodyParser = require("body-parser")
const app = express()

// 使用body-parser中间件
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));
app.use(bodyParser.json({limit: '20mb'}));

const course = require('./api/course')
const type = require('./api/type')

// course
seneca.add('target:server-course,module:course,if:list', course.list)
seneca.add('target:server-course,module:course,if:add', course.add)
seneca.add('target:server-course,module:course,if:delete', course.delete)
seneca.add('target:server-course,module:course,if:scheduleAdd', course.scheduleAdd)
app.use('/', course.router)

// type
seneca.add('target:server-course,module:type,if:list', type.list)

app.listen(8004)
seneca.listen(8003)
// docker启动
// app.listen(8002)
// seneca.listen(8001)