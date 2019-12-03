const winston = require('winston');
const moment = require('moment');

let customLevels = {
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
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
    transports: [
        new (winston.transports.Console)({
            level: 'error',
            levels: customLevels.levels,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            colorize: true,
            silent: true //true关闭，false打开
        }),
        new (winston.transports.File)({
            name: 'info',
            filename: './logs/info.log', //项目根目录
            maxsize: 1024 * 1024 * 50, //50M
            level: 'info',
            levels: customLevels.levels,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            json: false
        }),
        new (winston.transports.File)({
            name: 'error',
            filename: './logs/error.log', //项目根目录
            maxsize: 1024 * 1024 * 50, //50M
            level: 'error',
            levels: customLevels.levels,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            json: false
        })
    ]
})

module.exports = logger