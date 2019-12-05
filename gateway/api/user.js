const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const passport = require('passport')
const logger = require('../logger')
const key = require('../config/key.js')
const userSeneca = key.userSeneca

// @token  true
router.get('/user', passport.authenticate('jwt', {session: false}), (req, done) => {
    done.send(req.user)
})

// @route  PUT /api/user
// @desc   用户注册
// @token  false
// @access public
router.put('/user', (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    userSeneca.act('target:server-user,module:user,if:register', options,
    (err,res) => {
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
// @return token jwt passport
// @access public
router.post('/user', (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    options.currentCode = req.session.identifyCode;
    userSeneca.act('target:server-user,module:user,if:login', options,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            // 设置token
            var rule = {
                userid: res.userid, 
                identity: res.identity, 
                name: res.name,
                sex: res.sex,
                IDcard: res.IDcard,
                birthday: res.birthday,
                college: res.college,
                major: res.major,
                phone: res.phone,
                email: res.email
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

module.exports = router;