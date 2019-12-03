const userSeneca = require('seneca')()
const express = require('express')
const router = express.Router();
const logger = require('../logger')
const URI = require('../key.js')

userSeneca.client(URI.userServer)

// @route  PUT /api/user
// @desc   用户注册
// @access public
router.put('/user', (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    userSeneca.act('target:server-user,module:user,if:register', options,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message);
        }
        else{
            logger.info(res);
            done.send(res);
        }
    })
})

// @route  POST /api/user
// @desc   用户登陆
// @return token jwt passport
// @access public
router.post('/user', (req, done) => {
    var options = JSON.parse(JSON.stringify(req.body));
    options.currentCode = req.session.identifyCode;
    userSeneca.act('target:server-user,module:user,if:login', options,
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message);
        }
        else{
            done.send(res);
        }
    })
})

module.exports = router;