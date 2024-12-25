/**
 * 几种打log方式的主要场景
 * debug模块：适用开发的时候打印数据。方便本地调试的时候，对日志filter，
 * 并不需要在服务器上展示出来。但是如果确实有需要临时展示，可能通过改taf日志级别来实现。
 * console.log:适用次要log。无法filter，主要用于本地调试和服务器上没有必要持久存储的log
 * logger.error.error: 适用于比较重要的error log，会在服务器存储一段时间
 * logger.data.debug: 适用于比较重要的data log，会在服务器存储一段时间
 *
 * logger.error和logger.data两个日志方式是一样的，只不过文件名不一样。
 * 一般的不需要创建远程log，如果确实有需要，请自行创建。例如本js的logger.access_log。会永久存储log.
 */
const TafLogs = require('@taf/taf-logs');
const morgan = require('morgan');

const logger = {};
const morganTaf = {};

/*
 * 错误日志存在本地就可以了，error 是文件名
 *
 * let logger = require('./logger');
 * logger.error.error('xxxx');
 */
logger.error = new TafLogs('TafDate', 'error');

/*
 * 访问日志
 * let logger = require('./logger');
 * logger.access_log.debug('xxxx');
 * logger.access_log.warn('xx');
 * ...
 */
logger.access_log = new TafLogs('TafDate', 'access_log');

logger.dataError = new TafLogs('TafDate', 'dataError');

logger.userReport = new TafLogs('TafDate', 'userReport');

logger.dataInfo = new TafLogs('TafDate', 'dataInfo');

logger.apiError = new TafLogs('TafDate', 'apiError');

logger.userLogin = new TafLogs('TafDate', 'userLogin');

logger.dcacheErrorLog = new TafLogs('TafDate', 'dcacheErrorLog');

logger.accountStockErrorLog = new TafLogs('TafDate', 'accountStockErrorLog');
logger.tradeServerErrorLog = new TafLogs('TafDate', 'tradeServerErrorLog');

logger.simCounterServerErrorLog = new TafLogs('TafDate', 'simCounterServerErrorLog'); // 模拟柜台服务日志

logger.dbSQLLog = new TafLogs('TafDate', 'dbSQLLog')

/* 
 * 新增
 */
logger.fileFTPLog = new TafLogs('TafDate', 'fileFTPLog'); // FTP日志

morganTaf.write = (str) => {
    logger.access_log.debug(str.replace('\n', ''));
};
morgan.token('pid', () => process.pid);
logger.morgan_taf_log = () => morgan(':remote-user ":method :url" :status :res[content-length] ":referrer" ":user-agent" :response-time :pid', {
    stream: morganTaf,
    skip(req, res) {
        return req.url === '/favicon.ico' || res.statusCode > 400 || !process.env.TAF_CONFIG;
    }
});
global.logger = logger;

module.exports = logger;