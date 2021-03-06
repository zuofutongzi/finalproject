const express = require('express')
const router = express.Router()
const passport = require('passport')
const multer  = require('multer')
const request = require('request-promise-native')
const key = require('../../config/key.js')
const courseSeneca = key.courseSeneca
const upload = multer()

// @route  GET /api/grade
// @desc   成绩获取
// @token  true
// @return gradeList
// @access student
// @params {studentid: String, schoolYear: String/null, schoolTerm: String/null}
router.get('/grade', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'student'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:grade,if:list', req.query,
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

// @route  POST /api/grade/import
// @desc   成绩导入
// @token  true
// @return msg
// @access teacher
// @params {classid: String}
router.post('/grade/import', passport.authenticate('jwt', {session: false}), upload.single('file'), (req, done) => {
    if(req.user.identity != 'teacher'){
        done.status(500).send('没有权限！')
    }
    else{
        var file = req.file;
        var options = req.body;
        var uri = key.courseServerRequest + '/grade/import';
        request.post({
            url: uri,
            json: {file: file, options: options},
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