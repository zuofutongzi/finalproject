const winston = require('winston');
const moment = require('moment');
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf } = format

let customLevels = {
    levels: {
        debug: 3,
        info: 2,
        warn: 1,
        error: 0
    },
    colors: {
        debug: 'blue',
        info: 'green',
        warn: 'yellow',
        error: 'red'
    }
};

winston.addColors({
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red'
})

// create the main logger 等级高的包含等级低的输出日志
var logger = winston.createLogger({
    level: 'debug',
    levels: customLevels.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        printf(info => {
          return `${info.timestamp} [${info.level}]: ${info.message}`
        })
    ),
    transports: [
        new (winston.transports.Console)({
            level: 'error',
            levels: customLevels.levels,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            colorize: true,
            silent: false //true关闭，false打开
        }),
        new (winston.transports.File)({
            name: 'info',
            filename: './logs/info.log', //项目根目录
            maxsize: 1024 * 1024 * 50, //50M
            level: 'info',
            levels: customLevels.levels,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            json: false,
            format: combine(
                timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                printf(info => {
                  return `${info.timestamp} [${info.level}]: ${info.message}`
                })
            )
        }),
        new (winston.transports.File)({
            name: 'error',
            filename: './logs/error.log', //项目根目录
            maxsize: 1024 * 1024 * 50, //50M
            level: 'error',
            levels: customLevels.levels,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            json: false,
            format: combine(
                timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                printf(info => {
                  return `${info.timestamp} [${info.level}]: ${info.message}`
                })
            )
        })
    ]
})

module.exports = logger