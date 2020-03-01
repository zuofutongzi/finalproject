const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 成绩获取
// var options = {
//     studentid: String,
//     schoolYear: String/null,
//     schoolTerm: String/null
// }
function list(msg, done){
    var { studentid, schoolYear, schoolTerm } = msg;

    var getClassSelect = () => {
        return new Promise((resolve, reject) => {
            redis.smembers('idx:classSelect:student:' + studentid, (err, keys) => {
                if(err){
                    logger.error('(grade-list):' + err.message);
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    resolve(keys)
                }
            })
        })
    }

    // 获取学生的选课
    getClassSelect().then(result => {
        var classid = result.map(item => {
            item = JSON.parse(item);
            return 'class:' + item.classid
        })
        var stuClassid = result.map(item => {
            item = JSON.parse(item);
            return 'classSelect:' + item.stuClassid;
        })
        var getClass = new Promise((resolve, reject) => {
            if(classid.length == 0){
                resolve([])
            }
            else{
                redis.mget(classid, (err, keys) => {
                    if(err){
                        logger.error('(grade-list):' + err.message);
                        reject('数据库访问失败，请稍后再试...')
                    }
                    else{
                        keys = keys.map(item => {
                            return JSON.parse(item)
                        })
                        resolve(keys)
                    }
                })
            }
        })
        var getStuClass = new Promise((resolve, reject) => {
            if(stuClassid.length == 0){
                resolve([])
            }
            else{
                redis.mget(stuClassid, (err, keys) => {
                    if(err){
                        logger.error('(grade-list):' + err.message);
                        reject('数据库访问失败，请稍后再试...')
                    }
                    else{
                        keys = keys.map(item => {
                            return JSON.parse(item)
                        })
                        resolve(keys)
                    }
                })
            }
        })
        return new Promise((resolve, reject) => {
            Promise.all([getClass, getStuClass])
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        })
    })
    .then(result => {
        // class和classselect数据合并
        var myclass = result[0];
        var stuClass = result[1];
        stuClass = stuClass.map(item => {
            var index = myclass.findIndex(citem => {
                return item.classid == citem.classid;
            })
            if(index != -1){
                item.schoolYear = myclass[index].schoolYear;
                item.schoolTerm = myclass[index].schoolTerm;
                item.courseid = myclass[index].courseid;
            }
            return item;
        })
        return stuClass
    })
    .then(result => {
        return new Promise((resolve, reject) => {
            // 筛选
            if(schoolYear){
                result = result.filter(item => {
                    return item.schoolYear == schoolYear && item.schoolTerm == schoolTerm;
                })
            }
            // 同一门课修多次，则取成绩高的
            var newArr = [];
            result.forEach(item => {
                var index = newArr.findIndex(citem => {
                    return item.courseid == citem.courseid;
                })
                if(index == -1){
                    newArr.push(item);
                }
                else if(newArr[index].grade == '' || parseFloat(newArr[index].grade) < parseFloat(item.grade)){
                    newArr.splice(index, 1, item);
                }
            })
            var courseid = [];
            newArr.forEach(item => {
                courseid.push('course:' + item.courseid);
            })
            if(courseid.length == 0){
                resolve(newArr)
            }
            else{
                redis.mget(courseid, (err, keys) => {
                    if(err){
                        logger.error('(grade-list):' + err.message);
                        reject('数据库访问失败，请稍后再试...')
                    }
                    else{
                        keys = keys.map(item => {
                            return JSON.parse(item)
                        })
                        newArr = newArr.map(item => {
                            var index = keys.findIndex(citem => {
                                return item.courseid == citem.courseid;
                            })
                            if(index != -1){
                                for(let k in keys[index]){
                                    item[k] = keys[index][k];
                                }
                            }
                            return item;
                        })
                        resolve(newArr)
                    }
                })
            }
        })
    })
    .then(result => {
        done(null, result)
    })
    .catch(err => {
        done(new Error(err))
    })
}

// 成绩修改
// var options = {
//     classid: String,
//     studentid: String,
//     grade: String
// }
async function edit(msg, done){
    var { classid, studentid, grade } = msg;
    var updateSql = 'update classSelect set grade = ? where classid = ? and studentid = ?';
    var update_params = [grade, classid, studentid];

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, result) => {
        if(err){
            logger.error('(grade-edit):' + err.message);
            done(new Error('成绩录入失败！'))
        }
        else{
            logger.info('(grade-edit):' + studentid + '学生' + classid + '课程成绩' + grade + '录入成功');
            done(null, {msg: '成绩录入成功'})
        }
    })
    mysql.release();
}

// 获取成绩控制
function getControll(msg, done){
    redis.mget('gradeControll:main', (err, res) => {
        if(err){
            logger.error('(grade-getControll):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            done(null, JSON.parse(res))
        }
    })
}

// 设置成绩控制
// var options = {
//     schoolYear: String, 
//     schoolTerm: String, 
//     gradeStart: String, 
//     gradeEnd: String
// }
async function setControll(msg, done){
    var { schoolYear, schoolTerm, gradeStart, gradeEnd } = msg;
    var updateSql = 'update gradeControll set schoolYear = ?, schoolTerm = ?, gradeStart = ?, gradeEnd = ? where controllid = ?';
    var update_params = [schoolYear, schoolTerm, gradeStart, gradeEnd, 'main'];

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, result) => {
        if(err){
            logger.error('(grade-setControll):' + err.message);
            done(new Error('成绩登记设置失败！'))
        }
        else{
            logger.info('(grade-setControll):' + schoolYear + '-' + schoolTerm + '学年成绩登记设置成功');
            done(null, {msg: '成绩登记设置成功'})
        }
    })
    mysql.release();
}

// 以开课为单位获取学生成绩
// var options = {
//     classid: String
// }
function clist(msg, done){
    var { classid } = msg;

    var getClassSelect = () => {
        return new Promise((resolve, reject) => {
            redis.sort('idx:classSelect:class:' + classid, 'alpha', 'get', 'classSelect:*', (err, keys) => {
                if(err){
                    logger.error('(grade-clist):' + err.message);
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    keys = keys.map(item => {
                        return JSON.parse(item)
                    })
                    resolve(keys)
                }
            })
        })
    }
    // 获取选课信息
    getClassSelect().then(result => {
        // 获取学生信息
        return new Promise((resolve, reject) => {
            var userid = [];
            result.forEach(item => {
                userid.push(item.studentid);
            })
            var options = {
                identity: 'student',
                userid: userid
            }
            userSeneca.act('target:server-user,module:user,if:id2name', options,
            (err, res) => {
                if(err){
                    logger.error('(grade-clist):server-user访问失败');
                    reject('server-user访问失败')
                }
                else{
                    result = result.map(item => {
                        var index = res.findIndex(citem => {
                            return item.studentid == citem.userid;
                        })
                        if(index != -1){
                            item.name = res[index].name;
                        }
                        return item;
                    })
                    resolve(result)
                }
            })
        })
    })
    .then(result => {
        done(null, result)
    })
    .catch(err => {
        done(new Error(err))
    })
}

// 成绩导入
// var options = {
//     classid: String
// }
router.post('/grade/import', async (msg, done) => {
    try{
        var file = msg.body.file;
        var { classid } = msg.body.options;
        
        var stuIndex = 0; // 学号下标
        var gradeIndex = 1; // 成绩下标
        
        // 数组转buffer
        var copy = Buffer.from(file.buffer.data)
        // 解析文件
        var obj = xlsx.parse(copy);
        // 数据需要在第一个表中
        if(obj[0].data.length == 0){
            throw new Error('格式错误，请重新检查文件内容是否符合要求！')
        }

        var data = obj[0].data;
        var navigation = data[0];
        var rule = ['学号', '成绩'];
        // 确认表格头部是否正确
        for(var i = 0; i < rule.length; i++){
            if(navigation[i] != rule[i]){
                throw new Error('格式错误，请重新检查表头是否符合要求！')
            }
        }

        data = data.slice(1,data.length);
        // 过滤空的数据
        data = data.filter((value) => {    
            return !(
                value === undefined ||
                value === null ||
                (typeof value === 'object' && Object.keys(value).length === 0) ||
                (typeof value === 'string' && value.trim().length === 0)
            )
        })

        if(data.length == 0){
            throw new Error('文件内容为空，请重新检查文件内容')
        }

        var updateSql = 'update classSelect set grade = case studentid '
        data.forEach(item => {
            var reg = /^\d+(\.\d)?$/;
            if(!reg.test(item[gradeIndex])){
                throw new Error(item[stuIndex] + '学生的成绩不为整数或一位小数，请重新检查文件内容')
            }
            updateSql += ' when ' + item[stuIndex] + ' then ' + item[gradeIndex];
        })
        updateSql += ' end where classid = ' + classid;

        const mysql = await connectHandler();
        mysql.query(updateSql, (err, result) => {
            if(err){
                logger.error('(grade-import):' + err.message);
                done.send({status: 500, msg: '成绩导入失败！'})
            }
            else{
                logger.info('(grade-import):' + classid + '成绩导入成功');
                done.send({msg: '成绩导入成功'})
            }
        })
        mysql.release();
    }
    catch(err){
        logger.error('(grade-import):' + err.message);
        done.send({status: 500, msg: err.message})
    }
})

module.exports = {
    list: list,
    edit: edit,
    getControll: getControll,
    setControll: setControll,
    clist: clist,
    router: router
}