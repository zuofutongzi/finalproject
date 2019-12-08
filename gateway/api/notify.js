const express = require('express')
const router = express.Router()
const passport = require('passport')
const request = require('request-promise-native')
const key = require('../config/key.js')
const userSeneca = key.userSeneca

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

// @route  GET /api/notify/:appendix
// @desc   获取附件
// @token  true
// @access public
router.get('/notify/:appendix', async (req, done) => {
    var appendix = req.params.appendix;
    var url = '192.168.99.100:8002/notify/a.docx'
    request.get({
        url: url,
        json: req.body,
        gzip:true,
        headers:{
            'Content-Type': 'application/octet-stream'
        },
    }).on('response', function(response) {
        this.pipe(response)
    });
})

// @route  POST /api/notify
// @desc   获取具体通知
// @token  true
// @access public
router.post('/notify', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
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

module.exports = router;