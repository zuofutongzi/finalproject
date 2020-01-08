const express = require('express')
const router = express.Router()
const passport = require('passport')
const request = require('request-promise-native')
const multer  = require('multer')
const key = require('../config/key.js')
const userSeneca = key.userSeneca
const upload = multer()

// @route  GET /api/notify
// @desc   获取通知列表
// @token  true
// @return notifyList
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
// @desc   添加通知
// @token  true
// @return msg
// @access manager
// @params {title: String, content: String, appendix: String, top: bool, important: bool, time: String}
router.post('/notify', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        userSeneca.act('target:server-user,module:notify,if:add', req.body,
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

// @route  PUT /api/notify
// @desc   修改通告
// @token  true
// @return msg
// @access manager
// @params {notifyid: int, title: String, content: String, appendix: String, top: bool, important: bool, time: String}
router.put('/notify', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        userSeneca.act('target:server-user,module:notify,if:edit', req.body,
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

// @route  DELETE /api/notify
// @desc   删除通告
// @token  true
// @return msg
// @access manager
// @params {notifyid: Array}
router.delete('/notify', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        var options = {notifyid: req.body};
        userSeneca.act('target:server-user,module:notify,if:delete', options,
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

// @route  POST /api/notify/appendix
// @desc   附件上传
// @token  true
// @return msg
// @access public
router.post('/notify/appendix', passport.authenticate('jwt', {session: false}), upload.single('file'), (req, done) => {
    var file = req.file;
    var uri = key.userServerRequest + '/notify/appendix';
    request.post({
        url: uri,
        json: file,
        gzip:true
    }).then((response) => {
        done.send(response)
    }).catch((err) => {
        done.status(500).send('文件上传失败！')
    })
})

// @route  GET /api/notify/appendix/:appendix
// @desc   获取附件
// @token  false
// @return msg
// @access public
router.get('/notify/appendix/:appendix', async (req, done) => {
    var appendix = req.params.appendix;
    var uri = key.userServerRequest + '/notify/appendix/' + appendix;
    // url中文转换处理
    uri = encodeURI(uri);
    request.get({
        url: uri,
        json: req.body,
        gzip:true,
        headers:{
            'Content-Type': 'application/octet-stream'
        },
    }).on('response', function(response){
        this.pipe(done)
    })
})

module.exports = router;