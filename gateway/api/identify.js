const express = require('express')
const router = express.Router()
const key = require('../config/key.js')
const userSeneca = key.userSeneca

// @route  GET /api/identify
// @desc   获取验证码
// @token  false
// @return html
// @access public
// @params {width: Number, height: Number}
router.get('/identify', (req, done) => {
    userSeneca.act('target:server-user,module:identify,if:code', req.query,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message);
        }
        else{
            // 验证码结果存在session中
            req.session.identifyCode = res.text;
            done.send(res.data)
        }
    })
})

module.exports = router;