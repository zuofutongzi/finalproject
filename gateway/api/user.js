const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const passport = require('passport')
const key = require('../config/key.js')
const userSeneca = key.userSeneca

// @route  GET /api/user
// @desc   获取用户信息
// @token  true
// @return userdetail
// @access manager,teacher
router.get('/user', passport.authenticate('jwt', {session: false}), (req, done) => {
    var limits = ['manager', 'teacher'];
    if(limits.indexOf(req.user.identity) == -1){
        done.status(500).send("没有权限！")
    }
    else{
        // req.query请求对象的信息 req.user请求者的信息
        var options = req.query;
        userSeneca.act('target:server-user,module:user,if:list', options,
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
// @token  false
// @access public
router.post('/user', (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    userSeneca.act('target:server-user,module:user,if:register', options,
    (err, res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

// @route  GET /api/user/:id
// @desc   获取指定用户信息
// @token  true
// @return userdetail
// @access public
router.get('/user/:id', passport.authenticate('jwt', {session: false}), (req, done) => {
    // req.query请求对象的信息 req.user请求者的信息
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
// @return token
// @access public
router.post('/user/:id', (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
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
// @return userdetail
// @access public
router.put('/user/:id', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    options.askerid = req.user.userid;
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
// @access public
router.put('/user/:id/password', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
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