const express = require('express')
const router = express.Router()
const passport = require('passport')
const multer  = require('multer')
const request = require('request-promise-native')
const key = require('../../config/key.js')
const courseSeneca = key.courseSeneca
const upload = multer()

// @route  GET /api/class
// @desc   开课列表
// @token  true
// @return classList
// @access manager
// @params {schoolYear: String, schoolTerm: String, page: int, size: int}
router.get('/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:class,if:list', req.query,
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

// @route  POST /api/class
// @desc   开课添加
// @token  true
// @return msg
// @access manager
// @params {courseid: String, teacherid: String, schoolYear: String, schoolTerm: String, capacityLimit: Number, session: Array}
router.post('/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        req.body.askerid = req.user.userid;
        courseSeneca.act('target:server-course,module:class,if:add', req.body,
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

// @route  DELETE /api/class
// @desc   开课删除
// @token  true
// @return msg
// @access manager
// @params {classid: Array}
router.delete('/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        courseSeneca.act('target:server-course,module:class,if:delete', req.body,
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

// @route  POST /api/class/import
// @desc   开课导入
// @token  true
// @return msg
// @access manager
router.post('/class/import', passport.authenticate('jwt', {session: false}), upload.single('file'), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        var file = req.file;
        var uri = key.courseServerRequest + '/class/import';
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