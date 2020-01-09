const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx').default;
const logger = require('../logger')
const key = require('../key')

//const mysql = key.mysql
const connectHandler = key.mysql
const redis = key.redis

// 分院列表
function collegeList(msg, done){
    redis.sort('idx:college', 'get', 'college:*', (err, key) => {
        if(err){
            logger.error('(school-collegeList):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            var data = [];
            key.forEach(item => {
                data.push(JSON.parse(item))
            })
            done(null, data)
        }
    })
}

// 专业列表
function majorList(msg, done){
    redis.sort('idx:major', 'get', 'major:*', (err, key) => {
        if(err){
            logger.error('(school-majorList):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            var data = [];
            key.forEach(item => {
                data.push(JSON.parse(item))
            })
            done(null, data)
        }
    })
}

// 班级列表
// var options = {
//     filter: {
//         isFirst: Boolean,
//         isPage: Boolean,
//         page: int/null,
//         size: int/null,
//         college: Array/null [分院，专业]
//     }
// }
async function classList(msg, done){
    var filter = JSON.parse(msg.filter);
    var res = {count: 0, data: []};
    var options = [];
    var tempKey =  'temp:class:' + (new Date()).getTime()
    options = options.concat(['idx:class','alpha','get','class:*'])
    // 将分院下的班级并集
    var union = async () => {
        var options = await new Promise((resolve) => {
            redis.sort('idx:major:college:' + filter.college[0], (err, keys) => {
                var temp = [];
                keys.forEach(item => {
                    temp.push('idx:class:major:' + item);
                })
                // 建立临时表
                redis.sunionstore(tempKey, temp, (err, keys) => {
                    resolve([tempKey, 'alpha', 'get', 'class:*'])
                })
            })
        })
        return options;
    }
    // 分院专业筛选
    if(filter.college && filter.college.length != 0){
        if(filter.college.length == 1){
            options = await union();
        }
        else if(filter.college.length == 2){
            options = ['idx:class:major:' + filter.college[1], 'alpha', 'get', 'class:*'];
        }
    }
    // 第一次访问接口获取列表总条数
    if(filter.isFirst){
        redis.sort(options, (err, keys) => {
            if(err){
                logger.error('(school-classList):' + err.message);
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
    redis.sort(options, async (err, keys) => {
        if(err){
            logger.error('(school-classList):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys[0] == null){
            done(new Error('当前没有班级！'))
        }
        else{
            var detail = async (value) => {
                var teacher = await new Promise((resolve) => {
                    redis.mget('teacher:' + value.teacherid, (err, res) => {
                        if(err){
                            logger.error('(school-classList):' + err.message);
                            done(new Error('数据库访问失败，请稍后再试...'))
                        }
                        else{
                            resolve(JSON.parse(res[0]).name)
                        }
                    })
                })
                var major = await new Promise((resolve) => {
                    redis.mget('major:' + value.majorid, (err, res) => {
                        if(err){
                            logger.error('(school-classList):' + err.message);
                            done(new Error('数据库访问失败，请稍后再试...'))
                        }
                        else{
                            resolve(JSON.parse(res[0]).name)
                        }
                    })
                })
                return {
                    teacher: teacher, 
                    major: major
                }
            }
            for(var i = 0; i < keys.length; i++){
                var item = JSON.parse(keys[i]);
                var itemDetail = await detail(item);
                item.teacher = itemDetail.teacher;
                item.major = itemDetail.major;
                res.data.push(item)
            }
            done(null, res)
        }
    })

    // 临时表删除
    redis.del(tempKey)
}

// 班级添加
// var options = {
//     classid: String,
//     name: String,
//     teacherid: String,
//     majorid: String,
//     enrol: String
// }
async function classAdd(msg, done){
    const mysql = await connectHandler();

    var { classid, name, teacherid, majorid, enrol } = msg;
    redis.sort('idx:class', 'alpha', (err, keys) => {
        if(err){
            logger.error('(school-classAdd):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else if(keys.indexOf(classid) != -1){
            logger.error('(school-classAdd):班级编号已存在');
            done(new Error('班级编号已存在！'))
        }
        else{
            redis.mget('teacher:' + teacherid, (err, res) => {
                if(err){
                    logger.error('(school-classAdd):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else if(res[0] == null){
                    done(new Error('教师不存在！'))
                }
                else if(JSON.parse(res[0]).classTeacher == 'true'){
                    done(new Error('教师已为其他班级班主任！'))
                }
                else{
                    var insert = 'insert into class(classid, name, teacherid, majorid, enrol) values(?, ?, ?, ?, ?)';
                    var insert_params = [classid, name, teacherid, majorid, enrol];

                    var update = 'update teacher set classTeacher = ?, classid = ? where userid = ?';
                    var update_params = ['true', classid, teacherid];
                    
                    mysql.beginTransaction(err => {
                        if(err){
                            logger.error('(school-classAdd):' + err.message);
                            done(new Error('班级添加失败！'))
                        }
                        else{
                            mysql.query(insert, insert_params, (err, result) => {
                                if(err){
                                    //回滚事务
                                    mysql.rollback(() => {
                                        logger.error('(school-classAdd):' + err.message);
                                        done(new Error('班级添加失败！'))
                                    });
                                }
                                else{
                                    mysql.query(update, update_params, (err, result) => {
                                        if(err){
                                            //回滚事务
                                            mysql.rollback(() => {
                                                logger.error('(school-classAdd):' + err.message);
                                                done(new Error('班级添加失败！'))
                                            });
                                        }
                                        else{
                                            //提交事务
                                            mysql.commit(function(err) {
                                                if(err){
                                                    mysql.rollback(() => {
                                                        logger.error('(school-classAdd):' + err.message);
                                                        done(new Error('班级添加失败！'))
                                                    });
                                                }
                                            });
                                            done(null, {msg: '班级添加成功！'})
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })

    //释放连接
    mysql.release();
}

// 班级删除
// var options = {
//     myclass: Array
// }
async function classDelete(msg, done){
    var { myclass } = msg;
    var tempStudent = 'temp:delete:student:' + (new Date()).getTime();

    // 班级删除sql
    var deletesql = 'delete from class where classid in (';
    var delete_params = [];
    // 教师更新sql
    var updatesql = 'update teacher set '
    var classTeacher = '';
    var classid = '';
    var userid = '(';
    // 学生删除sql
    var deleteStudentSql = 'delete from student where userid in (';
    var deleteStudentClass = [];
    for(var i = 0; i < myclass.length; i++){
        if(i == 0){
            deletesql += ' ?';
        }
        else{
            deletesql += ', ?';
        }
        delete_params.push(myclass[i].classid);
        deleteStudentClass.push('idx:student:class:' + myclass[i].classid);
        classTeacher += 'when "' + myclass[i].teacherid + '" then "false" ';
        classid += 'when "' + myclass[i].teacherid + '" then NULL ';
        userid += '"' + myclass[i].teacherid + '",';
    }
    deletesql += ')';
    updatesql += 'classTeacher = case userid ' + classTeacher + ' end, classid = case userid ' + classid + ' end ';
    userid = userid.slice(0, userid.length - 1);
    userid += ')';
    updatesql += 'where userid in' + userid;

    // 将班级下的学生并集,并获取学生id
    var union = async () => {
        var options = await new Promise((resolve) => {
            // 建立临时表
            redis.sunionstore(tempStudent, deleteStudentClass, (err, keys) => {
                if(err){
                    logger.error('(school-classDelete):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    resolve([tempStudent, 'alpha'])
                }
            })
        })
        var params = await new Promise((resolve) => {
            redis.sort(options, (err, keys) => {
                if(err){
                    logger.error('(school-classDelete):' + err.message);
                    done(new Error('数据库访问失败，请稍后再试...'))
                }
                else{
                    resolve(keys)
                }
            })
        })
        return params;
    }
    var deleteStudentSql_params = await union();
    for(var i = 0; i < deleteStudentSql_params.length; i++){
        if(i == 0){
            deleteStudentSql += ' ?';
        }
        else{
            deleteStudentSql += ', ?';
        }
    }
    deleteStudentSql += ')';

    const mysql = await connectHandler();
    mysql.beginTransaction(err => {
        if(err){
            logger.error('(school-classDelete):' + err.message);
            done(new Error('班级删除失败！'))
        }
        else{
            // 更改教师的班主任信息
            mysql.query(updatesql, (err, result) => {
                if(err){
                    //回滚事务
                    mysql.rollback(() => {
                        logger.error('(school-classDelete):' + err.message);
                        done(new Error('班级删除失败！'))
                    });
                }
                else{
                    // 若班级下有学生，删除班级下学生
                    if(deleteStudentSql_params.length != 0){
                        mysql.query(deleteStudentSql, deleteStudentSql_params, (err, result) => {
                            if(err){
                                //回滚事务
                                mysql.rollback(() => {
                                    logger.error('(school-classDelete):' + err.message);
                                    done(new Error('班级删除失败！'))
                                });
                            }
                            else{
                                // 删除班级
                                mysql.query(deletesql, delete_params, (err, result) => {
                                    if(err){
                                        //回滚事务
                                        mysql.rollback(() => {
                                            logger.error('(school-classDelete):' + err.message);
                                            done(new Error('班级删除失败！'))
                                        });
                                    }
                                    else{
                                        //提交事务
                                        mysql.commit(function(err) {
                                            if(err){
                                                mysql.rollback(() => {
                                                    logger.error('(school-classDelete):' + err.message);
                                                    done(new Error('班级删除失败！'))
                                                });
                                            }
                                        });
                                        done(null, {msg: '班级删除成功！'})
                                    }
                                })
                            }
                        })
                    }
                    // 班级下没有学生则直接删除班级
                    else{
                        // 删除班级
                        mysql.query(deletesql, delete_params, (err, result) => {
                            if(err){
                                //回滚事务
                                mysql.rollback(() => {
                                    logger.error('(school-classDelete):' + err.message);
                                    done(new Error('班级删除失败！'))
                                });
                            }
                            else{
                                //提交事务
                                mysql.commit(function(err) {
                                    if(err){
                                        mysql.rollback(() => {
                                            logger.error('(school-classDelete):' + err.message);
                                            done(new Error('班级删除失败！'))
                                        });
                                    }
                                });
                                done(null, {msg: '班级删除成功！'})
                            }
                        })
                    }
                }
            })
        }
    })

    // 删除临时表
    redis.del(tempStudent)
    mysql.release();
}

// 未找到使用seneca实现文件上传下载的方法，另增加express接口
// 班级导入
router.post('/school/class/import', async (msg, done) => {
    try{
        var classIndex = 0; // 对应班级下标
        var majorIndex = 2; // 对应专业下标
        var teacherIndex = 3; // 对应教师下标
        var insert = '';
        var insert_params = [];
        var update = '';

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
        var rule = ['班级编号', '班级名称', '专业', '班主任编号', '入学年份']
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

        // 获取专业列表
        var major = async () => {
            var list = await new Promise((resolve) => {
                redis.sort('idx:major', 'get', 'major:*', (err, keys) => {
                    var list = [];
                    keys.forEach(item => {
                        list.push(JSON.parse(item));
                    })
                    resolve(list);
                })
            })
            return list;
        }
        var majorList = await major();

        // 获取班主任列表
        var teacher = async () => {
            var list = await new Promise((resolve) => {
                redis.sort('idx:teacher', 'alpha', 'get', 'teacher:*', (err, keys) => {
                    var list = [];
                    keys.forEach(item => {
                        item = JSON.parse(item);
                        if(item.classTeacher == 'true'){
                            list.push(item.userid);
                        }
                    })
                    resolve(list);
                })
            })
            return list;
        }
        var teacherId = await teacher();

        // 获取班级列表
        var myclass = async () => {
            var list = await new Promise((resolve) => {
                redis.sort('idx:class', 'alpha', (err, keys) => {
                    resolve(keys);
                })
            })
            return list;
        }
        var classList = await myclass();
        
        insert = 'insert into class(classid, name, majorid, teacherid, enrol) values ';
        update = 'update teacher set ';
        var classTeacher = '';
        var classid = '';
        var userid = '(';
        var newTeacher = [];
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
            // 判断数据中的专业信息是否正确
            var index = majorList.findIndex(value => {
                return value.name == item[majorIndex];
            })
            if(index == -1){
                throw new Error('专业错误，请重新检查文件内容是否符合要求！')
            }
            else{
                // 专业替换成专业编号
                item[majorIndex] = majorList[index].majorid;

                // 判断教师编号是否重复，判断教师是否已经为班主任
                if(teacherId.indexOf(item[teacherIndex]) != -1){
                    throw new Error('编号为' + item[teacherIndex] + '的教师已为其他班级班主任，请重新检查文件内容！')
                }
                if(newTeacher.indexOf(item[teacherIndex]) == -1){
                    newTeacher.push(item[teacherIndex])
                }

                // 判断班级编号是否重复出现
                if(newData.indexOf(item[classIndex]) == -1){
                    newData.push(item[classIndex])
                }

                // 判断班级编号是否存在
                if(classList.indexOf(item[classIndex]) != -1){
                    throw new Error(item[classIndex] + '班级编号已存在，请重新检查文件内容！')
                }

                insert += '('
                for(var i = 0; i < item.length; i++){
                    if(i == 0){
                        insert += '?';
                    }
                    else{
                        insert += ',?';
                    }
                }
                insert += '),';
                insert_params = insert_params.concat(item);

                classTeacher += 'when "' + item[teacherIndex] + '" then "true" ';
                classid += 'when "' + item[teacherIndex] + '" then "' + item[classIndex] + '" ';
                userid += '"' + item[teacherIndex] + '",';
            }
        })
        update += 'classTeacher = case userid ' + classTeacher + ' end, classid = case userid ' + classid + ' end ';
        userid = userid.slice(0, userid.length - 1);
        userid += ')';
        update += 'where userid in' + userid;
        insert = insert.slice(0, insert.length - 1);

        if(newTeacher.length != data.length){
            throw new Error('有教师编号重复出现，请重新检查文件内容！')
        }
        if(newData.length != data.length){
            throw new Error('有班级编号重复出现，请重新检查文件内容！')
        }

        const mysql = await connectHandler();
        mysql.beginTransaction(err => {
            if(err){
                logger.error('(school-classImport):' + err.message);
                done.send({status: 500, msg: '班级导入失败！'})
            }
            else{
                mysql.query(insert, insert_params, (err, result) => {
                    if(err){
                        //回滚事务
                        mysql.rollback(() => {
                            logger.error('(school-classImport):' + err.message);
                            done.send({status: 500, msg: '班级导入失败！'})
                        });
                    }
                    else{
                        mysql.query(update, (err, result) => {
                            if(err){
                                //回滚事务
                                mysql.rollback(() => {
                                    logger.error('(school-classImport):' + err.message);
                                    done.send({status: 500, msg: '班级导入失败！'})
                                });
                            }
                            else{
                                //提交事务
                                mysql.commit(function(err) {
                                    if(err){
                                        mysql.rollback(() => {
                                            logger.error('(school-classImport):' + err.message);
                                            done.send({status: 500, msg: '班级导入失败！'})
                                        });
                                    }
                                });
                                done.send({msg: '班级导入成功！'})
                            }
                        })
                    }
                })
            }
        })

        //释放连接
        mysql.release();
    }
    catch(err){
        logger.error('(school-classImport):' + err.message);
        done.send({status: 500, msg: err.message})
    }
})

module.exports = {
    collegeList: collegeList,
    majorList: majorList,
    classList: classList,
    classAdd: classAdd,
    classDelete: classDelete,
    router: router
}