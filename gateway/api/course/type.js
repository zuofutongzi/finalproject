const express = require('express')
const router = express.Router()
const passport = require('passport')
const key = require('../../config/key.js')
const courseSeneca = key.courseSeneca

// @route  GET /api/type
// @desc   课程类型列表
// @token  true
// @return typeList
// @access public
router.get('/type', passport.authenticate('jwt', {session: false}), (req, done) => {
    courseSeneca.act('target:server-course,module:type,if:list',
    (err,res) => {
        if(err){
            done.status(500).send(err.data.payload.details.message)
        }
        else{
            done.send(res)
        }
    })
})

module.exports = router;