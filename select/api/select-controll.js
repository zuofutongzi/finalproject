const logger = require('../logger')
const key = require('../key')

const connectHandler = key.mysql
const redis = key.redis
const userSeneca = key.userSeneca

// 选课情况获取
function detail(msg, done){
    redis.mget('classControll:main', (err, res) => {
        if(err){
            logger.error('(selectControll-detail):' + err.message);
            done(new Error('数据库访问失败，请稍后再试...'))
        }
        else{
            res = JSON.parse(res)
            done(null, res)
        }
    })
}

// 选课控制设置
// var options = {
//     schoolYear: String, 
//     schoolTerm: String, 
//     selectStart: String, 
//     selectEnd: String, 
//     isCapacityLimit: int,
//     isDrop: int
// }
async function set(msg, done){
    var { schoolYear, schoolTerm, selectStart, selectEnd, isCapacityLimit, isDrop } = msg;
    var updateSql = 'update classControll set schoolYear = ?, schoolTerm = ?, selectStart = ?, selectEnd = ?, isCapacityLimit = ?, isDrop = ?, isDrawLots = ?';
    var update_params = [ schoolYear, schoolTerm, selectStart, selectEnd, isCapacityLimit, isDrop, 0];

    // 清空等候队列
    redis.del('select:waitingDQueue', 'select:waitingSQueue')

    const mysql = await connectHandler();
    mysql.query(updateSql, update_params, (err, res) => {
        if(err){
            logger.error('(selectControll-set):' + err.message);
            done(new Error('课程设置失败！'))
        }
        else{
            logger.info('(selectControll-set):课程设置成功');
            done(null, {msg: '课程设置成功'})
        }
    })
    mysql.release();
}

// 选课抽签
// var options = {
//     schoolYear: String,
//     schoolTerm: String
// }
function drawlots(msg, done){
    var { schoolYear, schoolTerm } = msg;

    var getClass = () => {
        return new Promise((resolve, reject) => {
            redis.sort('idx:class:schoolYear:' + schoolYear + ':schoolTerm:' + schoolTerm, (err, keys) => {
                if(err){
                    reject('数据库访问失败，请稍后再试...')
                }
                else{
                    resolve(keys)
                }
            })
        })
    }
    getClass().then(result => {
        return new Promise((resolve, reject) => {
            var clsid = [];
            Promise.all(result.map(item => {
                return new Promise((resolve, reject) => {
                    redis.mget('class:' + item, (err, res) => {
                        if(err){
                            reject('数据库访问失败，请稍后再试...')
                        }
                        else{
                            res = JSON.parse(res);
                            redis.smembers('idx:classSelect:class:' + item, (err, keys) => {
                                if(err){
                                    reject('数据库访问失败，请稍后再试...')
                                }
                                else{
                                    // 随机排序
                                    keys = keys.sort(() => {
                                        return 0.5 - Math.random();
                                    })
                                    keys = keys.slice(res.capacityLimit, keys.length);
                                    clsid = clsid.concat(keys);
                                    resolve(clsid)
                                }
                            })
                        }
                    })
                })
            }))
            .then(result => {
                resolve(clsid)
            })
            .catch(err => {
                reject(err)
            })
        })
    })
    .then(result => {
        return new Promise(async (resolve, reject) => {
            var deleteSql = 'delete from classSelect where stuClassid in (';
            result.forEach(item => {
                deleteSql += '?,';
            });
            deleteSql = deleteSql.slice(0, deleteSql.length - 1);
            deleteSql += ')';
            var updateSql = 'update classControll set isDrawLots = 1';
            var updateClassSql = 'update class set capacityReal = capacityLimit where capacityReal > capacityLimit';

            const mysql = await connectHandler();
            mysql.query(updateSql, (err, res) => {
                if(err){
                    //回滚事务
                    mysql.rollback(() => {
                        reject('数据库访问失败，请稍后再试...')
                    });
                }
                else if(result.length != 0){
                    mysql.query(updateClassSql, (err, res) => {
                        if(err){
                            //回滚事务
                            mysql.rollback(() => {
                                reject('数据库访问失败，请稍后再试...')
                            });
                        }
                        else{
                            mysql.query(deleteSql, result, (err, res) => {
                                if(err){
                                    //回滚事务
                                    mysql.rollback(() => {
                                        reject('数据库访问失败，请稍后再试...')
                                    });
                                }
                                else{
                                    //提交事务
                                    mysql.commit(function(err) {
                                        if(err){
                                            mysql.rollback(() => {
                                                reject('数据库访问失败，请稍后再试...')
                                            });
                                        }
                                        else{
                                            resolve('success')
                                        }
                                    });
                                }
                            })
                        }
                    })
                }
                else{
                    //提交事务
                    mysql.commit(function(err) {
                        if(err){
                            mysql.rollback(() => {
                                reject('数据库访问失败，请稍后再试...')
                            });
                        }
                        else{
                            resolve('success')
                        }
                    });
                }
            })
            mysql.release();
        })
    })
    .then(result => {
        logger.info('(selectControll-drawlots):抽签成功')
        done(null, {msg: '抽签成功'})
    })
    .catch(err => {
        logger.error('(selectControll-drawlots):' + err)
        done(new Error(err))
    })
}

module.exports = {
    detail: detail,
    set: set,
    drawlots
}