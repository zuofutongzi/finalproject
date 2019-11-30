const express = require('express')
const session = require('express-session')
const bodyParser = require("body-parser")
const app = express()

// session
app.use(session({
    secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
    cookie: { maxAge: 20 * 60 * 1000 }, //cookie生存周期20*60秒
    resave: true,  //cookie之间的请求规则,假设每次登陆，就算会话存在也重新保存一次
    saveUninitialized: true //强制保存未初始化的会话到存储器
}))

// 使用body-parser中间件
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// 引入接口
const identify = require('./api/identify')

// 使用api
app.use('/api',identify)

const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server running on port ${port}`);
})