const express = require('express')
const router = express.Router();
const request = require('request-promise-native')
const URI = require('../key.js')

// @route  GET /api/server-user/user
// @desc   返回的请求的json数据
// @access public
// 测试
router.get('/user/:id',async (req,res) => {
    const id = req.params.id;
    const uri = `http://192.168.99.100:8001/user/${id}`;
    const user = await request(uri);
    res.send(user);
})

// @route  GET /api/server-user/identify
// @desc   返回的请求的json数据
// @access public
router.get('/identify', async (req,res) => {
    const uri = URI.userURI + '/identify';
    const data = await request(uri);
    res.send(data);
})

module.exports = router;