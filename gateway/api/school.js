const express = require('express')
const router = express.Router();
const passport = require('passport')
const multer  = require('multer')
const request = require('request-promise-native')
const key = require('../config/key.js')
const userSeneca = key.userSeneca
const upload = multer()

// @route  GET /api/school/college
// @desc   获取分院列表
// @token  true
// @return collegeList
// @access public
router.get('/school/college', passport.authenticate('jwt', {session: false}), (req, done) => {
    userSeneca.act('target:server-user,module:school,if:collegeList',
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  GET /api/school/major
// @desc   获取专业列表
// @token  true
// @return majorList
// @access public
router.get('/school/major', passport.authenticate('jwt', {session: false}), (req, done) => {
    userSeneca.act('target:server-user,module:school,if:majorList',
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  GET /api/school/class
// @desc   获取班级列表
// @token  true
// @return classList
// @access public
// @params {filter: Object}
router.get('/school/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    userSeneca.act('target:server-user,module:school,if:classList', req.query,
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  POST /api/school/class
// @desc   班级添加
// @token  true
// @return msg
// @access manager
// @params {classid: String, name: String, teacherid: String, majorid: String, enrol: String}
router.post('/school/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        userSeneca.act('target:server-user,module:school,if:classAdd', req.body,
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

// @route  Delete /api/school/class
// @desc   班级删除
// @token  true
// @return msg
// @access manager
// @params {myclass: Array}
router.delete('/school/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        userSeneca.act('target:server-user,module:school,if:classDelete', req.body,
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

// @route  POST /api/school/class/import
// @desc   用户导入
// @token  true
// @return msg
// @access manager
// @params {identity: String}
router.post('/school/class/import', passport.authenticate('jwt', {session: false}), upload.single('file'), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        var file = req.file;
        var uri = key.userServerRequest + '/school/class/import';
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