const express = require('express')
const router = express.Router();
const passport = require('passport')
const key = require('../config/key.js')
const userSeneca = key.userSeneca

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

module.exports = router;