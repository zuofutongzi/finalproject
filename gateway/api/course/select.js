const express = require('express')
const router = express.Router()
const passport = require('passport')
const key = require('../../config/key.js')
const courseSeneca = key.courseSeneca

// @route  GET /api/select/controll
// @desc   选课情况获取
// @token  true
// @return msg
// @access public
router.get('/select/controll', passport.authenticate('jwt', {session: false}), (req, done) => {
    courseSeneca.act('target:server-course,module:select,if:controllDetail',
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  POST /api/select/controll
// @desc   选课控制设置
// @token  true
// @return msg
// @access manager
// @params {schoolYear: String, schoolTerm: String, selectStart: String, selectEnd: String, isCapacityLimit: int, isDrop: int}
router.post('/select/controll', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:select,if:controllSet', req.body,
        (err,res) => {
            if(err){
                done.status(500).send(err.data.payload.details.message)
            }
            else{
                done.send(res)
            }
        })
    }
})

module.exports = router;