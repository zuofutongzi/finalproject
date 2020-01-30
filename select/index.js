const seneca = require('seneca')()
const mqseneca = require('seneca')()
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
seneca.add('target:server-select,module:select,if:list', select.list)
mqseneca.add('target:server-select,module:select,if:select', select.select)
mqseneca.add('target:server-select,module:select,if:delete', select.mydelete)
seneca.add('target:server-select,module:select,if:selectLimit', select.selectLimit)
seneca.add('target:server-select,module:select,if:waiting', select.waiting)

// 不对外开放
// select
seneca.add('target:server-select,module:select,if:waitingSQueue', select.waitingSQueue)
seneca.add('target:server-select,module:select,if:waitingDQueue', select.waitingDQueue)

app.listen(8006)
seneca.listen(8005)
mqseneca.use('seneca-amqp-transport').listen({
    type: 'amqp',
    pin: 'target:server-select',
    url: 'amqp://guest:guest@192.168.99.100:5672'
})