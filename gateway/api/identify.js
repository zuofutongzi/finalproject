const userSeneca = require('seneca')()
const express = require('express')
const router = express.Router();
const URI = require('../key.js')

userSeneca.client(URI.userServer)

// @route  POST /api/identify
// @desc   获取验证码
// @access public
router.post('/identify',(req,done) => {
    userSeneca.act('target:server-user,module:identify,if:code', req.body,
    (err,res) => {
        if(err){
            done.send({msg: "验证码获取失败！"})
        }
        else{
            req.session.identifyCode = res.text;
            done.send(res.data)
        }
    })
})

module.exports = router;