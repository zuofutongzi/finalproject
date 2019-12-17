const express = require('express')
const router = express.Router()
const key = require('../config/key.js')
const userSeneca = key.userSeneca

// @route  GET /api/identify
// @desc   获取验证码
// @token  false
// @access public
router.get('/identify', (req, done) => {
    userSeneca.act('target:server-user,module:identify,if:code', req.query,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message);
        }
        else{
            req.session.identifyCode = res.text;
            done.send(res.data)
        }
    })
})

module.exports = router;