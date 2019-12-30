const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const passport = require('passport')
const request = require('request-promise-native')
const multer  = require('multer')
const key = require('../config/key.js')
const userSeneca = key.userSeneca
const upload = multer()

// @route  GET /api/user
// @desc   获取用户信息
// @token  true
// @return userList
// @access manager,teacher
// @params {identity: String, filter: Object}
router.get('/user', passport.authenticate('jwt', {session: false}), (req, done) => {
    var limits = ['manager', 'teacher'];
    if(limits.indexOf(req.user.identity) == -1){
        done.status(500).send("没有权限！")
    }
    else{
        // req.query请求对象的信息 req.user是token解析结果
        userSeneca.act('target:server-user,module:user,if:list', req.query,
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

// @route  POST /api/user
// @desc   用户注册
// @token  true
// @return msg
// @access manager
// @params { userid: String, password: String, name: String, sex: String, nation: String, 
//           politicalStatus: String, IDcard: String, collegeid: String/null, eduBackground: String/null, 
//           professionalTitle: String/null, enrol: String, identity: String }
router.post('/user', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        userSeneca.act('target:server-user,module:user,if:register', req.body,
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

// @route  DELETE /api/user
// @desc   用户删除
// @token  true
// @return msg
// @access manager
// @params { userid: Array, identity: String }
router.delete('/user', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        userSeneca.act('target:server-user,module:user,if:delete', req.body,
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

// @route  POST /api/user/import
// @desc   用户导入
// @token  true
// @return msg
// @access manager
// @params {identity: String}
router.post('/user/import', passport.authenticate('jwt', {session: false}), upload.single('file'), (req, done) => {
    if(req.user.identity != 'manager'){
        done.status(500).send('没有权限！')
    }
    else{
        var file = req.file;
        var options = req.body;
        var uri = key.userServerRequest + '/user/import';
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

// @route  GET /api/user/:id
// @desc   获取指定用户信息
// @token  true
// @return userDetail
// @access public
// @params {userid: String, identity: String}
router.get('/user/:id', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = req.query;
    options.askerid = req.user.userid;
    userSeneca.act('target:server-user,module:user,if:detail', options,
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  POST /api/user/:id
// @desc   用户登陆
// @token  false
// @return token,msg
// @access public
// @params {userid: String, password: String, identity: String, identifyCode: String}
router.post('/user/:id', (req, done) => {
    var options = req.body;
    // 将存在session中的验证码结果和参数一起传给微服务
    options.currentCode = req.session.identifyCode;
    userSeneca.act('target:server-user,module:user,if:login', options,
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            // 设置token
            var rule = {
                userid: res.userid, 
                identity: options.identity, 
                name: res.name
            }
            jwt.sign(rule, key.secretOrKey, {expiresIn: 3600}, (err, token) => {
                if(err){
                    done.status(500).send(new Error('登陆失败！'))
                }
                else{
                    done.send({
                        msg: res.msg,
                        success: true,
                        token: 'Bearer ' + token
                    })
                }
            })
        }
    })
})

// @route  PUT /api/user/:id
// @desc   修改指定用户信息
// @token  true
// @return msg
// @access public
// @params {
//     userid: String, identity: String, 
//     phone: String, email: String, address: String, qq: String,
//     eduBackground: String/null, professionalTitle: String/null,
//     personalHonor: String/null, teachingSituation: String/null, scientificSituation: String/null}
router.put('/user/:id', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = req.body;
    options.askerid = req.user.userid;
    options.askeridentity = req.user.identity;
    userSeneca.act('target:server-user,module:user,if:change', options,
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  PUT /api/user/:id/password
// @desc   指定用户密码修改
// @token  true
// @return msg
// @access public
// @params {userid: String, identity: String, oldPassword: String, newPassword: String}
router.put('/user/:id/password', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = req.body;
    options.askerid = req.user.userid;
    userSeneca.act('target:server-user,module:user,if:password', options,
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

module.exports = router;