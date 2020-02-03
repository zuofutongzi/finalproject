const express = require('express')
const session = require('express-session')
const bodyParser = require("body-parser")
const passport = require('passport')
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

// passport初始化
app.use(passport.initialize());

require('./config/passport')(passport);

// 引入接口
// user
const identify = require('./api/user/identify')
const user = require('./api/user/user')
const notify = require('./api/user/notify')
const school = require('./api/user/school')
// course
const course = require('./api/course/course')
const type = require('./api/course/type')
const myclass = require('./api/course/class')
const grade = require('./api/course/grade')
// select
const selectControll = require('./api/select/select-controll')
const select = require('./api/select/select')

// 使用api
// user
app.use('/api', identify)
app.use('/api', user)
app.use('/api', notify)
app.use('/api', school)
// course
app.use('/api', course)
app.use('/api', type)
app.use('/api', myclass)
app.use('/api', grade)
// select
app.use('/api', selectControll)
app.use('/api', select)

const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server running on port ${port}`);
})