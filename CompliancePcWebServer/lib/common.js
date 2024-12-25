const common = {};
const logger = require("../lib/logger");
const dbCtl = require('../lib/dbctl/db-ctl');

function isType(type) {
    return obj => Object.prototype.toString.call(obj) === `[object ${type}]`;
}

common.isString = isType('String');
common.isArray = isType('Array');
common.isFunction = isType('Function');

common.getFileName = _fileName => _fileName.split('/').pop().replace('.js', '');

/**
 * 生成随机6位字符串
 * @param number 位数 最多 10 位
 * @param isLower 是否小写
 * */
common.randomString = (number, isLower) => {
    if (isLower) {
        return (Math.random().toString(36).slice(number || -6)).toLowerCase();
    }
    return (Math.random().toString(36).slice(number || -6)).toUpperCase();
}

/**
 * 预防sql注入
 * @param {*} sql 
 * @returns 
 */
common.checkSQL = (sql) => {
    let word = /[i,I][n,N][s,S][e,E][r,R][t,T]|[u,U][p,P][d,D][a,A][t,T][e,E]|[d,D][e,E][l,L][e,E][t,T][e,E]/
    return word.test(sql)
}


module.exports = common;