const express = require('express')
const router = express.Router()
const fs = require('fs')
const logger = require('../logger')
const key = require('../key')

const mysql = key.mysql
const redis = key.redis

// 获取通知列表
function list(msg, done){
    // sort 分页
    // redis.sort('idx:student', 'get', 'student:*', 'limit', '0', '2', (err, keys) => {
    //     console.log(keys)
    // })

    redis.sort('idx:notify', 'get', 'notify:*', (err, keys) => {
        if(err){
            logger.error('(notify-list):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            done(new Error('当前没用通知！'))
        }
        else{
            var data = [];
            keys.forEach(item => {
                data.push(JSON.parse(item))
            })
            done(null, data)
        }
    })
}

// 添加通知
function add(msg, done){
    var { title, content, appendix, top, important, time } = msg;
    var insert = 'insert into notify(title,content,appendix,top,important,time) values(?,?,?,?,?,?)';
    var insert_params = [title, content, appendix, top, important, time];
    mysql.query(insert, insert_params, (err, res) => {
        if(err){
            logger.error('(notify-add):' + err.message);
            done(new Error('通知添加失败！'))
        }
        else{
            logger.info('(notify-add):通知添加成功');
            done(null, {msg: '通知添加成功！'})
        }
    })
}

// 修改通知
function edit(msg, done){
    var { notifyid, title, content, appendix, top, important, time } = msg;
    var insert = 'update notify set title = ?, content = ?, appendix = ?, top = ?, important = ?, time = ? where notifyid = ?';
    var insert_params = [title, content, appendix, top, important, time, notifyid];
    mysql.query(insert, insert_params, (err, res) => {
        if(err){
            logger.error('(notify-edit):' + err.message);
            done(new Error('通知修改失败！'))
        }
        else{
            logger.info('(notify-edit):通知修改成功');
            done(null, {msg: '通知修改成功！'})
        }
    })
}

//删除通知
function mydelete(msg, done){
    var { notifyid } = msg;
    var sql = 'delete from notify where notifyid in (';
    for(var i = 0; i < notifyid.length; i++){
        if(i == 0){
            sql += ' ?';
        }
        else{
            sql += ', ?';
        }
    }
    sql += ')';
    var sql_params = notifyid;
    mysql.query(sql, sql_params, (err, res) => {
        if(err){
            logger.error('(notify-delete):' + err.message);
            done(new Error('通知删除失败！'))
        }
        else{
            logger.info('(notify-delete):通知删除成功');
            done(null, {msg: '通知删除成功！'})
        }
    })
}

// 未找到使用seneca实现文件上传下载的方法，另增加express接口
// 上传附件
router.post('/notify/appendix', (msg, done) => {
    try{
        var file = msg.body;
        // 数组转buffer
        var copy = Buffer.from(file.buffer.data)
        var ws = fs.createWriteStream(key.appendixDir + file.originalname);
        ws.write(copy);
        ws.end();
        logger.info('(notify-appendix):文件上传成功！');
        done.send({msg: "文件上传成功！"})
    }
    catch(err){
        logger.error('(notify-appendix):' + err.message);
        done.send(err)
    }
})

// 获取附件
router.get('/notify/appendix/:appendix', (msg, done) => {
    var appendix = msg.params.appendix;
    var appendixPath = key.appendixDir + appendix;

    fs.exists(appendixPath, (exists) => {
        if(exists){
            var size = fs.statSync(appendixPath).size;  
            var f = fs.createReadStream(appendixPath);
            // 附件若包含中文，需要字符转换才能放入header
            var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
        　　if(reg.test(appendix)){
                appendix = encodeURI(appendix,"GBK");
                appendix = appendix.toString('iso8859-1');
            }
            done.writeHead(200, {
                'Content-Type': 'application/force-download',    
                'Content-Disposition': 'attachment; filename=' + appendix,    
                'Content-Length': size  
            });
            f.pipe(done);
        }
        else{
            logger.error('(notify-appendix):文件不存在');
            done.send(new Error('文件不存在'))
        }
    });
})

module.exports = {
    list: list,
    add: add,
    edit: edit,
    delete: mydelete,
    router: router
}