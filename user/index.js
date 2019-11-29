const seneca = require('seneca')()
const SenecaWeb = require('seneca-web')
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const userModule = require('./api/user.js')
const identifyModule = require('./api/identify')

// 初始化用户模块
seneca.use(userModule.init)
seneca.use(identifyModule.init)

// 初始化seneca-web插件，并适配koa
seneca.use(SenecaWeb, {
    context: Router(),
    adapter: require('seneca-web-adapter-koa2'),
    routes: userModule.routes
})
seneca.use(SenecaWeb, {
    context: Router(),
    adapter: require('seneca-web-adapter-koa2'),
    routes: identifyModule.routes
})

seneca.ready(() => {
    app.use(seneca.export('web/context')().routes())
})

app.listen(8001)