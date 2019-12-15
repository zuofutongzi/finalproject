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

// @route  GET /api/notify/:notifyid
// @desc   获取具体通知
// @token  true
// @access public
router.get('/notify/:notifyid', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = {
        notifyid: req.params.notifyid
    }
    userSeneca.act('target:server-user,module:notify,if:content', options,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message);
        }
        else{
            done.send(res.data)
        }
    })
})

// @route  POST /api/notify/appendix
// @desc   附件上传
// @token  false
// @access public
router.post('/notify/appendix', upload.single('file'), (req, done) => {
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