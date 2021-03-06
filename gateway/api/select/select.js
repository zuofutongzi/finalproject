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
        selectSeneca.act('target:server-select,module:select,if:list', req.query, 
        (err, res) => {
            if(err){
                done.status(500).send(err.data.payload.details.message)
            }
            else{
                done.send(res)
            }
        })
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
        selectSeneca.act('target:server-select,module:select,if:waitingSQueue', req.body,
        (err, res) => {
            if(err){
                done.status(500).send(err.data.payload.details.message)
            }
            else{
                mqselectSeneca.act('target:server-select,module:select,if:select', req.body)
                done.send(res)
            }
        })
    }
})

// @route  DELETE /api/select
// @desc   学生退课
// @token  true
// @return msg
// @access student
// @params {studentid: String, classid: String, courseid: String}
router.delete('/select', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'student'){
        done.status(500).send("没有权限！")
    }
    else{
        selectSeneca.act('target:server-select,module:select,if:waitingDQueue', req.body,
        (err, res) => {
            if(err){
                done.status(500).send(err.data.payload.details.message)
            }
            else{
                mqselectSeneca.act('target:server-select,module:select,if:delete', req.body)
                done.send(res)
            }
        })
    }
})

// @route  POST /api/select/limit
// @desc   学生抢课
// @token  true
// @return msg
// @access student
// @params {stuclassid: String, studentid: String, classid: String, courseid: String, teacherid: String, schoolYear: String, schoolTerm: String}
router.post('/select/limit', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'student'){
        done.status(500).send("没有权限！")
    }
    else{
        selectSeneca.act('target:server-select,module:select,if:selectLimit', req.body,
        (err, res) => {
            if(err){
                done.status(500).send(err.data.payload.details.message)
            }
            else{
                done.send(res)
            }
        })
    }
})

// @route  GET /api/select/waiting
// @desc   学生等待队列
// @token  true
// @return selectClassList
// @access student
// @params {studentid: String}
router.get('/select/waiting', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'student'){
        done.status(500).send("没有权限！")
    }
    else{
        selectSeneca.act('target:server-select,module:select,if:waiting', req.query, 
        (err, res) => {
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