const seneca = require('seneca')()
const express = require('express')
const bodyParser = require("body-parser")
const app = express()

// 使用body-parser中间件
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));
app.use(bodyParser.json({limit: '20mb'}));

const select_controll = require('./api/select-controll')
const select = require('./api/select')

// controll
seneca.add('target:server-select,module:controll,if:detail', select_controll.detail)
seneca.add('target:server-select,module:controll,if:set', select_controll.set)
// select
seneca.add('target:server-select,module:select,if:select', select.select)

app.listen(8006)
seneca.listen(8005)