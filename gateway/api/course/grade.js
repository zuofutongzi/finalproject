const express = require('express')
const router = express.Router()
const passport = require('passport')
const multer  = require('multer')
const request = require('request-promise-native')
const key = require('../../config/key.js')
const courseSeneca = key.courseSeneca
const upload = multer()

// @route  POST /api/grade
// @desc   成绩修改
// @token  true
// @return msg
// @access teacher
// @params {classid: String, studentid: String, grade: String}
router.post('/grade', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'teacher'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:grade,if:edit', req.body,
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

// @route  GET /api/grade/controll
// @desc   获取成绩控制
// @token  true
// @return msg
// @access public
router.get('/grade/controll', passport.authenticate('jwt', {session: false}), (req, done) => {
    courseSeneca.act('target:server-course,module:grade,if:get-controll',
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  POST /api/grade/controll
// @desc   设置成绩控制
// @token  true
// @return msg
// @access manager
// @params {schoolYear: String, schoolTerm: String, gradeStart: String, gradeEnd: String}
router.post('/grade/controll', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:grade,if:set-controll', req.body,
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

// @route  GET /api/grade/class
// @desc   以开课为单位获取学生成绩
// @token  true
// @return stuList
// @access teacher
// @params {classid: String}
router.get('/grade/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'teacher'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:grade,if:clist', req.query,
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