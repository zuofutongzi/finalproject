const seneca = require('seneca')()
const express = require('express')
const bodyParser = require("body-parser")
const app = express()

// 使用body-parser中间件
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));
app.use(bodyParser.json({limit: '20mb'}));

const course = require('./api/course')
const type = require('./api/type')
const myclass = require('./api/class')
const grade = require('./api/grade')

// course
seneca.add('target:server-course,module:course,if:list', course.list)
seneca.add('target:server-course,module:course,if:add', course.add)
seneca.add('target:server-course,module:course,if:delete', course.delete)
seneca.add('target:server-course,module:course,if:id2list', course.id2list)
seneca.add('target:server-course,module:course,if:slist', course.slist)
seneca.add('target:server-course,module:course,if:scheduleList', course.scheduleList)
seneca.add('target:server-course,module:course,if:scheduleAdd', course.scheduleAdd)
seneca.add('target:server-course,module:course,if:scheduleDelete', course.scheduleDelete)
app.use('/', course.router)

// type
seneca.add('target:server-course,module:type,if:list', type.list)

// class
seneca.add('target:server-course,module:class,if:list', myclass.list)
seneca.add('target:server-course,module:class,if:add', myclass.add)
seneca.add('target:server-course,module:class,if:edit', myclass.edit)
seneca.add('target:server-course,module:class,if:delete', myclass.delete)
seneca.add('target:server-course,module:class,if:id2detail', myclass.id2detail)
seneca.add('target:server-course,module:class,if:course', myclass.course)
seneca.add('target:server-course,module:class,if:tlist', myclass.tlist)
app.use('/', myclass.router)

// grade
seneca.add('target:server-course,module:grade,if:list', grade.list)
seneca.add('target:server-course,module:grade,if:edit', grade.edit)
seneca.add('target:server-course,module:grade,if:get-controll', grade.getControll)
seneca.add('target:server-course,module:grade,if:set-controll', grade.setControll)
seneca.add('target:server-course,module:grade,if:clist', grade.clist)
app.use('/', grade.router)

app.listen(8004)
seneca.listen(8003)