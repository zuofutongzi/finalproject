const express = require('express')
const app = express()

// 引入接口
const user = require('./api/user')

// 使用api
app.use('/api/server-user',user)

const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server running on port ${port}`);
})