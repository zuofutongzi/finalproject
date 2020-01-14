const express = require('express')
const router = express.Router()
const passport = require('passport')
const multer  = require('multer')
const request = require('request-promise-native')
const key = require('../../config/key.js')
const courseSeneca = key.courseSeneca
const upload = multer()

// @route  POST /api/class
// @desc   添加开课
// @token  true
// @return msg
// @access manager
// @params {courseid: String, teacherid: String, schoolYear: String, schoolTerm: String, capacityLimit: Number, session: Array}
router.post('/class', passport.authenticate('jwt', {session: false}), (req, done) => {
    if(req.user.identity !== 'manager'){
        done.status(500).send("没有权限！")
    }
    else{
        req.body.askerid = req.user.userid;
        courseSeneca.act('target:server-course,module:class,if:add', req.body,
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

module.exports = router;