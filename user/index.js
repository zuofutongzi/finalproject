const seneca = require('seneca')()
const express = require('express')
const bodyParser = require("body-parser")
const app = express()

// 使用body-parser中间件
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));
app.use(bodyParser.json({limit: '20mb'}));

const user = require('./api/user')
const identify = require('./api/identify')
const notify = require('./api/notify')
const school = require('./api/school')

// user
seneca.add('target:server-user,module:user,if:list', user.list)
seneca.add('target:server-user,module:user,if:register', user.register)
seneca.add('target:server-user,module:user,if:delete', user.delete)
seneca.add('target:server-user,module:user,if:detail', user.detail)
seneca.add('target:server-user,module:user,if:login', user.login)
seneca.add('target:server-user,module:user,if:change', user.change)
seneca.add('target:server-user,module:user,if:password', user.password)
app.use('/', user.router)

// identify
seneca.add('target:server-user,module:identify,if:code', identify.code)

// notify
seneca.add('target:server-user,module:notify,if:list', notify.list)
seneca.add('target:server-user,module:notify,if:add', notify.add)
seneca.add('target:server-user,module:notify,if:edit', notify.edit)
seneca.add('target:server-user,module:notify,if:delete', notify.delete)
app.use('/', notify.router)

// school
seneca.add('target:server-user,module:school,if:collegeList', school.collegeList)
seneca.add('target:server-user,module:school,if:majorList', school.majorList)
seneca.add('target:server-user,module:school,if:classList', school.classList)
seneca.add('target:server-user,module:school,if:classAdd', school.classAdd)
app.use('/', school.router)

app.listen(8002)
seneca.listen(8001)