const express = require('express')
const router = express.Router()
const passport = require('passport')
const key = require('../../config/key.js')
const selectSeneca = key.selectSeneca
const mqselectSeneca = key.mqselectSeneca

// @route  POST /api/select
// @desc   学生选课
// @token  true
// @return msg
// @access student
// @params {studentid: String, classid: String, teacherid: String}
router.post('/select', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'student'){
        done.status(500).send("没有权限！")
    }
    else{
        selectSeneca.act('target:server-select,module:select,if:select', req.body,
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