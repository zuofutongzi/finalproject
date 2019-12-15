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

// user
seneca.add('target:server-user,module:user,if:register', user.register)
seneca.add('target:server-user,module:user,if:detail', user.detail)
seneca.add('target:server-user,module:user,if:login', user.login)
seneca.add('target:server-user,module:user,if:change', user.change)
seneca.add('target:server-user,module:user,if:password', user.password)

// identify
seneca.add('target:server-user,module:identify,if:code', identify.code)

// notify
seneca.add('target:server-user,module:notify,if:list', notify.list)
seneca.add('target:server-user,module:notify,if:add', notify.add)
seneca.add('target:server-user,module:notify,if:content', notify.content)
app.use('/', notify.router)

app.listen(8002)
seneca.listen(8001)