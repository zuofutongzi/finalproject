const express = require('express')
const router = express.Router()
const passport = require('passport')
const multer  = require('multer')
const request = require('request-promise-native')
const key = require('../../config/key.js')
const courseSeneca = key.courseSeneca
const upload = multer()

// @route  GET /api/course
// @desc   课程列表
// @token  true
// @return courseList
// @access public
// @params {filter: Object}
router.get('/course', passport.authenticate('jwt', {session: false}), (req, done) => {
    // req.query请求对象的信息 req.user是token解析结果
    courseSeneca.act('target:server-course,module:course,if:list', req.query,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  POST /api/course
// @desc   添加课程
// @token  true
// @return msg
// @access manager
// @params {collegeid:String, courseid: String, name: String, credit: Number, classHour: String}
router.post('/course', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:course,if:add', req.body,
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

// @route  DELETE /api/course
// @desc   删除课程
// @token  true
// @return msg
// @access manager
// @params {course: Array}
router.delete('/course', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:course,if:delete', req.body,
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

// @route  POST /api/course/import
// @desc   课程导入
// @token  true
// @return msg
// @access manager
router.post('/course/import', passport.authenticate('jwt', {session: false}), upload.single('file'), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        var file = req.file;
        var uri = key.courseServerRequest + '/course/import';
        request.post({
            url: uri,
            json: {file: file},
            gzip: true
        }).then((response) => {
            if(response.status == 500){
                done.status(500).send(response.msg)
            }
            else{
                done.send(response)
            }
        }).catch((err) => {
            done.status(500).send('文件上传失败！')
        })
    }
})

// @route  GET /api/course/schedule
// @desc   获取课程计划
// @token  true
// @return scheduleList
// @access public
// @params {major: String, isAll: Boolean, type: String/null}
router.get('/course/schedule', passport.authenticate('jwt', {session: false}), (req, done) => {
    courseSeneca.act('target:server-course,module:course,if:scheduleList', req.query,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
        })
})

// @route  POST /api/course/schedule
// @desc   添加课程计划
// @token  true
// @return msg
// @access manager
// @params {major: String, course: String, type: String}
router.post('/course/schedule', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:course,if:scheduleAdd', req.body,
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

// @route  DELETE /api/course/schedule
// @desc   删除课程计划
// @token  true
// @return msg
// @access manager
// @params {schedule: Array}
router.delete('/course/schedule', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:course,if:scheduleDelete', {schedule: JSON.stringify(req.body)},
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

// @route  POST /api/course/schedule/import
// @desc   课程计划导入
// @token  true
// @return msg
// @access manager
router.post('/course/schedule/import', passport.authenticate('jwt', {session: false}), upload.single('file'), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        var file = req.file;
        var uri = key.courseServerRequest + '/course/schedule/import';
        request.post({
            url: uri,
            json: {file: file},
            gzip: true
        }).then((response) => {
            if(response.status == 500){
                done.status(500).send(response.msg)
            }
            else{
                done.send(response)
            }
        }).catch((err) => {
            done.status(500).send('文件上传失败！')
        })
    }
})

module.exports = router;