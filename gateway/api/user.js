const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const passport = require('passport')
const key = require('../config/key.js')
const userSeneca = key.userSeneca

// @route  PUT /api/user
// @desc   用户注册
// @token  false
// @access public
router.put('/user', (req, done) => {
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

// @route  POST /api/user
// @desc   用户登陆
// @token  false
// @return token
// @access public
router.post('/user', (req, done) => {
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
                        success: true,
                        token: 'Bearer ' + token
                    })
                }
            })
        }
    })
})

// @route  GET /api/user/:id
// @desc   指定用户信息
// @token  true
// @return userdetail
// @access public
router.get('/user/:id', passport.authenticate('jwt', {session: false}), (req, done) => {
    userSeneca.act('target:server-user,module:user,if:detail', req.user,
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
// @desc   修改指定用户信息
// @token  true
// @return userdetail
// @access public
router.post('/user/:id', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    options.identity = req.user.identity;
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

// @route  POST /api/user/:id/password
// @desc   指定用户密码修改
// @token  true
// @access public
router.post('/user/:id/password', passport.authenticate('jwt', {session: false}), (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    options.identity = req.user.identity;
    options.userid = req.user.userid;
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