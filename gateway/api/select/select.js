const express = require('express')
const router = express.Router()
const passport = require('passport')
const key = require('../../config/key.js')
const selectSeneca = key.selectSeneca
const mqselectSeneca = key.mqselectSeneca

// @route  GET /api/select
// @desc   学生选课信息
// @token  true
// @return selectClassList
// @access student
// @params {studentid: String, schoolYear: String/null, schoolTerm: String/null}
router.get('/select', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'student'){
        done.status(500).send("没有权限！")
    }
    else{
        mqselectSeneca.act('target:server-select,module:select,if:list', req.body)
        done.send({msg: 'success'})
    }
})

// @route  POST /api/select
// @desc   学生选课
// @token  true
// @return msg
// @access student
// @params {stuclassid: String, studentid: String, classid: String, teacherid: String, courseid: String, schoolYear: String, schoolTerm: String}
router.post('/select', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'student'){
        done.status(500).send("没有权限！")
    }
    else{
        mqselectSeneca.act('target:server-select,module:select,if:select', req.body)
        done.send({msg: 'success'})
    }
})

module.exports = router;