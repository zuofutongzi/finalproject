const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 课程列表
// var options = {
//     filter: {
//         isFirst: Boolean,
//         isPage: Boolean,
//         page: int/null,
//         size: int/null,
//         college: String/null
//     }
// }
async function list(msg, done){
    var filter = JSON.parse(msg.filter);
    var res = {count: 0, data: []};
    var options = ['idx:course', 'alpha', 'get', 'course:*'];

    // 分院过滤
    if(filter.college){
        options = ['idx:course:college:' + filter.college, 'alpha', 'get', 'course:*'];
    }
    // 第一次访问接口获取列表总条数
    if(filter.isFirst){
        redis.sort(options, (err, keys) => {
            if(err){
                logger.error('(course-list):' + err.message);
                done(new Error('数据库访问失败，请稍后再试...'))
            }
            else{
                res.count = keys.length;
            }
        })
    }
    // 分页
    if(filter.isPage){
        options = options.concat(['limit', ((filter.page-1)*filter.size).toString(), filter.size.toString()]);
    }

    // 获取分院列表
    var getCollegeList = async () => {
        return await new Promise((resolve) => {
            userSeneca.act('target:server-user,module:school,if:collegeList',
            (err, res) => {
                if(err){
                    done.send({status: 500, msg: err.message})
                }
                else{
                    var collegeName = [];
                    var collegeId = [];
                    res.forEach((item, index) => {
                        collegeName[index] = item.name;
                        collegeId[index] = item.collegeid;
                    })
                    resolve({
                        collegeName: collegeName,
                        collegeId: collegeId
                    })
                }
            })
        })
    }
    var { collegeName, collegeId } = await getCollegeList();

    redis.sort(options, (err, keys) => {
        if(err){
            logger.error('(course-list):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            done(new Error('当前没有课程！'))
        }
        else{
            keys.forEach(item => {
                item = JSON.parse(item);
                item.college = collegeName[collegeId.indexOf(item.collegeid)];
                res.data.push(item)
            })
            done(null, res);
        }
    })
}

// 课程添加
// var options = {
//     collegeid: String,
//     courseid: String,
//     name: String,
//     credit: Number,
//     classHour: String
// }
function add(msg, done){
    var { collegeid, courseid, name, credit, classHour } = msg;

    redis.mget('course:' + courseid, async (err, res) => {
        if(err){
            logger.error('(course-add):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(res[0] != null){
            done(new Error('课程号已存在！'))
        }
        else{
            const mysql = await connectHandler();
            var insert = 'insert into course(collegeid, courseid, name, credit, classHour) values(?, ?, ?, ?, ?)';
            var insert_params = [collegeid, courseid, name, credit, classHour];
            mysql.query(insert, insert_params, (err, result) => {
                if(err){
                    logger.error('(course-add):' + err.message);
                    done(new Error('课程添加失败！'))
                }
                else{
                    done(null, {msg: '课程添加成功'})
                }
            })
            mysql.release();
        }
    })
}

// 课程删除
async function mydelete(msg, done){
    var { course } = msg;
    var tempClass = 'temp:delete:class:' + (new Date()).getTime();
    
    var deleteCourseSql = 'delete from course where courseid in (';
    // 课程班级并集
    var tempClass_params = [];
    for(var i = 0; i < course.length; i++){
        tempClass_params.push('idx:class:course:' + course[i]);
        if(i == 0){
            deleteCourseSql += ' ?';
        }
        else{
            deleteCourseSql += ', ?';
        }
    }
    var union = async () => {
        return await new Promise((resolve) => {
            // 建立临时表
            redis.sunionstore(tempClass, tempClass_params, (err, keys) => {
                if(err){
                    logger.error('(course-delete):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    resolve(keys)
                }
            })
        })
    }
    if((await union()) != 0){
        done(new Error('当前课程有开课记录，无法删除'))
    }

    deleteCourseSql += ')';
    const mysql = await connectHandler();
    mysql.query(deleteCourseSql, course, (err, result) => {
        if(err){
            logger.error('(course-delete):' + err.message);
            done(new Error('课程删除失败！'))
        }
        else{
            done(null, {msg: '课程删除成功'})
        }
    })

    // 删除临时表
    redis.del(tempClass)
    mysql.release()
}

// 课程导入
router.post('/course/import', async (msg, done) => {
    try{
        var collegeIndex = 0;
        var courseIndex = 1;

        var file = msg.body.file;
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
        var rule = ['开设分院', '课程号', '课程名', '学分', '学时'];
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

        // 获取分院列表
        var getCollegeList = async () => {
            return await new Promise((resolve) => {
                userSeneca.act('target:server-user,module:school,if:collegeList',
                (err, res) => {
                    if(err){
                        done.send({status: 500, msg: err.message})
                    }
                    else{
                        var collegeName = [];
                        var collegeId = [];
                        res.forEach((item, index) => {
                            collegeName[index] = item.name;
                            collegeId[index] = item.collegeid;
                        })
                        resolve({
                            collegeName: collegeName,
                            collegeId: collegeId
                        })
                    }
                })
            })
        }
        var { collegeName, collegeId } = await getCollegeList();

        var insert = 'insert into course(collegeid, courseid, name, credit, classHour) values';
        var insert_params = [];
        var newData = [];
        data.forEach(item => {
            // 数据不能有空项
            item = item.filter((value) => {    
                return !(
                    value === undefined ||
                    value === null ||
                    (typeof value === 'object' && Object.keys(value).length === 0) ||
                    (typeof value === 'string' && value.trim().length === 0)
                )
            })
            if(item.length != rule.length){
                throw new Error('格式错误，请重新检查文件内容是否符合要求！')
            }

            // 判断课程编号是否有重复
            if(newData.indexOf(item[courseIndex]) == -1){
                newData.push(item[courseIndex]);
            }

            // 分院名替换为编号
            var index = collegeName.indexOf(item[collegeIndex]);
            if(index == -1){
                throw new Error('格式错误，请重新检查分院信息是否符合要求！')
            }
            else{
                item[collegeIndex] = collegeId[index];
            }

            insert += '(?,?,?,?,?),';
            insert_params = insert_params.concat(item);
        })
        insert = insert.slice(0, insert.length - 1);

        if(newData.length !== data.length){
            throw new Error('有课程号重复出现，请重新检查文件内容！')
        }

        const mysql = await connectHandler();
        mysql.query(insert, insert_params, (err, result) => {
            if(err){
                logger.error('(course-import):' + err.message);
                done.send({status: 500, msg: '课程导入失败！'})
            }
            else{
                done.send({msg: '课程导入成功'})
            }
        })
        mysql.release();
    }
    catch(err){
        logger.error('(course-import):' + err.message);
        done.send({status: 500, msg: err.message})
    }
})

module.exports = {
    list: list,
    add: add,
    delete: mydelete,
    router: router
}