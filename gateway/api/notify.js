const express = require('express')
const router = express.Router()
const passport = require('passport')
const key = require('../config/key.js')
const userSeneca = key.userSeneca

// @route  GET /api/notify
// @desc   获取通知列表
// @token  true
// @access public
router.get('/notify', passport.authenticate('jwt', {session: false}), (req, done) => {
    userSeneca.act('target:server-user,module:notify,if:list',
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message);
        }
        else{
            done.send(res)
        }
    })
})

// @route  POST /api/notify
// @desc   获取具体通知
// @token  true
// @access public
router.post('/notify', (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    userSeneca.act('target:server-user,module:notify,if:detail', options,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message);
        }
        else{
            done.send(res.data)
        }
    })
})

module.exports = router;