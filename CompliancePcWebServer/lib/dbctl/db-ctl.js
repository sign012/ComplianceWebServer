/* ManagerDB 数据库操作类 */

// const logger = require('../logger');
const knex = require('knex');
const knexJsonQuery = require('knex-json-query');


let DBCTL = {},
    knexClient = {}; // , DBkey = 'DTDB';


//  初始化本地数据库链接
DBCTL.initConnectDB = () => {

    let enableDBLinkList = global.CONFIG.CompliancePcWebServer.EnableDBLink.split('|');
    for (let DBkey of enableDBLinkList) {

        if (!knexClient[DBkey]) {
            knexClient[DBkey] = knex({
                client: 'mysql',
                connection: {
                    host: global.CONFIG.CompliancePcWebServer[DBkey].dbhost,
                    user: global.CONFIG.CompliancePcWebServer[DBkey].dbuser,
                    password: global.CONFIG.CompliancePcWebServer[DBkey].dbpass,
                    database: global.CONFIG.CompliancePcWebServer[DBkey].dbname,
					port: global.CONFIG.CompliancePcWebServer[DBkey].dbport
                },
                // debug: true,
                // log: {
                //     debug(message) {
                //         console.log(message.sql);
                //     },
                // },
                pool: { min: 1, max: 4 }
            });
        }

    }
};


/**
 * 执行sql语句
 * @param {String} linkName 连接数据库名称
 * @param {String} selBaseSQL 待执行脚本
 * @returns
 * */
DBCTL.execSQLToDB = (linkName, selBaseSQL) => {
    return new Promise((resolve, reject) => {
        knexClient[linkName].raw(selBaseSQL)
            .then(ret => {
                resolve({
                    iRet: 0,
                    msg: '',
                    data: ret
                });
            }).catch(err => {
                console.log(' execSQLToDB ERROR DB ==>', linkName, selBaseSQL, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: '执行脚本失败',
                    data: ''
                });
            });
    });
};

/**
 * 执行插入，并返回指定信息
 * @param linkName 连接数据库名称
 * @param paramsObj 需要添加的参数对象  {''}
 * @param retList 返回的执行属性 ['id','title']
 * @param tableName 表名
 */
DBCTL.execNoSQLRetValue = (linkName, paramsObj, retList, tableName) => {
    return new Promise((resolve, reject) => {
        knexClient[linkName](tableName)
            .insert([paramsObj], retList)
            .into(tableName)
            .then((retData) => {
                resolve({
                    iRet: 0,
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' execSQLRetValue ERROR DB ==>', linkName, paramsObj, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 执行update，并返回指定信息
 * @param linkName 连接数据库名称
 * @param paramsObj 需要更新的参数对象  {xxx:'xxx',h:'yyyy'}
 * @param whereObj 匹配条件 {xxx:'xxx',abc:' < 1000 '}
 * @param tableName 表名
 */
DBCTL.execNoSQLForUpdate = (linkName, paramsObj, whereObj, tableName, ) => {

    return new Promise((resolve, reject) => {

        let queryWhere = knexJsonQuery(whereObj);

        knexClient[linkName](tableName)
            .where(queryWhere)
            .update(paramsObj)
            .then((retData) => {
                resolve({
                    iRet: retData === 0 ? 1 : 0, // 返回影响行数
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' execNoSQLForUpdate ERROR DB ==>', paramsObj, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 执行del，并返回指定信息
 * @param linkName 连接数据库名称
 * @param whereObj 匹配条件 {xxx:'xxx',abc:' < 1000 '}
 * @param tableName 表名
 */
DBCTL.execNoSQLForDel = (linkName, whereObj, tableName) => {
    return new Promise((resolve, reject) => {
        let queryWhere = knexJsonQuery(whereObj);

        knexClient[linkName](tableName)
            .where(queryWhere)
            .del()
            .then((retData) => {
                console.log(retData)
                resolve({
                    iRet: retData === 0 ? 1 : 0, // 返回影响行数
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' execNoSQLForDel ERROR DB ==>', whereObj, tableName, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 单表查询NOSQL
 * @param linkName 连接数据库名称
 * @param whereObj 条件对象  {''}
 * @param tableName 表名
 */
DBCTL.selectNoSQL = (linkName, whereObj, tableName) => {
    return new Promise((resolve, reject) => {
        let queryWhere = knexJsonQuery(whereObj);

        knexClient[linkName](tableName)
            .where(queryWhere)
            .select()
            .then((retData) => {
                resolve({
                    iRet: 0,
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' selectNoSQL ERROR DB ==>', whereObj, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 单表查询NOSQL（带排序）
 * @param linkName 连接数据库名称
 * @param whereObj 条件对象  {''}
 * @param tableName 表名
 * @param orderByName 排序属性
 * @param isDesc 是否倒序
 */
DBCTL.selectNoSQLByOrder = (linkName, whereObj, tableName, orderByName, isDesc) => {
    return new Promise((resolve, reject) => {
        let queryWhere = knexJsonQuery(whereObj);

        knexClient[linkName](tableName)
            .where(queryWhere)
            .select()
            .orderBy(orderByName, isDesc ? 'desc' : 'asc')
            .then((retData) => {
                resolve({
                    iRet: 0,
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                // console.log(' selectNoSQL ERROR DB ==>', whereObj, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 单表查询NOSQL
 * @param linkName 连接数据库名称
 * @param whereObj 条件对象  {''}
 * @param tableName 表名
 * @param columnList 列名
 */
DBCTL.selectNoSQLForColumn = (linkName, whereObj, tableName, columnList) => {
    return new Promise((resolve, reject) => {

        let queryWhere = knexJsonQuery(whereObj);

        knexClient[linkName](tableName)
            .where(queryWhere)
            .column(columnList)
            .select()
            .then((retData) => {
                resolve({
                    iRet: 0,
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                // console.log(' selectNoSQL ERROR DB ==>', whereObj, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 单表分页查询NOSQL
 * @param linkName 连接数据库名称
 * @param whereObj 条件对象  {''}
 * @param tableName 表名
 * @param columnList 列名
 * @param pageSize 每页条数
 * @param pageIndex 当前页数
 * @param orderByName 排序属性
 * @param isDesc 是否倒序
 *
 */
DBCTL.selectNoSQLForPage = (linkName, whereObj, tableName, columnList, pageSize, pageIndex, orderByName, isDesc) => {
    return new Promise((resolve, reject) => {

        let queryWhere = knexJsonQuery(whereObj);

        knexClient[linkName](tableName)
            .where(queryWhere)
            .column(columnList)
            .select()
            .limit(pageSize)
            .offset((pageIndex - 1) * pageSize)
            .orderBy(orderByName, isDesc ? 'desc' : 'asc')
            .then((retData) => {
                resolve({
                    iRet: 0,
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' selectNoSQL ERROR DB ==>', whereObj, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 单表总数查询NOSQL
 * @param linkName 连接数据库名称
 * @param whereObj 条件对象  {''}
 * @param tableName 表名
 */
DBCTL.selectNoSQLForRowCount = (linkName, whereObj, tableName) => {
    return new Promise((resolve, reject) => {
        let queryWhere = knexJsonQuery(whereObj);
        // console.log(' queryWhere ====> ',queryWhere,whereObj);
        knexClient[linkName](tableName)
            .where(queryWhere)
            .count('* as amount')
            .then((retData) => {
                resolve({
                    iRet: 0,
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' selectNoSQL ERROR DB ==>', whereObj, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 执行update，whereRaw 条件并返回指定信息
 * @param linkName 连接数据库名称
 * @param paramsObj 需要更新的参数对象  {xxx:'xxx',h:'yyyy'}
 * @param whereSQL
 * @param tableName 表名
 */
DBCTL.execNoSQLForUpdateWhereRaw = (linkName, paramsObj, whereSQL, tableName) => {
    return new Promise((resolve, reject) => {

        knexClient[linkName](tableName)
            .whereRaw(whereSQL)
            .update(paramsObj)
            .then((retData) => {
                resolve({
                    iRet: retData === 0 ? 1 : 0, // 返回影响行数
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' execNoSQLForUpdate ERROR DB ==>', paramsObj, whereSQL, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 执行del，whereRaw 条件物理删除
 * @param linkName 连接数据库名称
 * @param whereSQL
 * @param tableName 表名
 */
DBCTL.execNoSQLForDelWhereRaw = (linkName, whereSQL, tableName) => {
    return new Promise((resolve, reject) => {

        knexClient[linkName](tableName)
            .whereRaw(whereSQL)
            .del()
            .then((retData) => {
                resolve({
                    iRet: retData === 0 ? 1 : 0, // 返回影响行数
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                // console.log(' execNoSQLForDel ERROR DB ==>', whereObj, tableName, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};


/**
 * 执行添加/更新操作
 * @param linkName 连接数据库名称
 * @param params 参数 {}
 * @param keys 主键
 * @param tableName 表名
 */
DBCTL.execNoSQLForInsertAndUpdate = (linkName, params, keys, tableName) => {
    return new Promise((resolve, reject) => {

        knexClient[linkName](tableName)
            .insert(params)
            .onConflict(keys)
            .merge()
            .then((retData) => {
                resolve({
                    iRet: retData === 0 ? 1 : 0, // 返回影响行数
                    msg: '',
                    data: retData
                });
            }).catch((err) => {
                console.log(' execNoSQLForInsertAndUpdate ERROR DB ==>', params, key, tableName, err);
                resolve({
                    iRet: err.errno || -1004,
                    msg: `error：${err.code || '执行脚本失败'}`,
                    data: ''
                });
            });
    });
};

/**
 * 自定义操作
 * @param linkName 数据库名
 */
DBCTL.customOperate = (linkName) => {
    return knexClient[linkName]
}

module.exports = DBCTL;