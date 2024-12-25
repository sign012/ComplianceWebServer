// 角色类
const dbCtl = require('../lib/dbctl/db-ctl')
let Dept = {}
const dbName = 'DTDB'

//获取角色菜单
Dept.getDepts = function(whereObj) {
    return dbCtl.selectNoSQL(dbName, { 'auto_inc_id': { $like: `%${ whereObj.auto_inc_id || ''}%` }, isValid: 1 }, 't_mgr_dept')
}

//创建角色
Dept.createDept = function(whereObj) {
    return dbCtl.execNoSQLRetValue(dbName, whereObj, [], 't_mgr_dept')
}

//编辑角色
Dept.editDept = function(whereObj) {
    return dbCtl.execNoSQLForUpdate(dbName, whereObj, { 'auto_inc_id': whereObj.auto_inc_id }, 't_mgr_dept')
}

//删除角色
Dept.delDept = function(whereObj) {
    return dbCtl.execNoSQLForUpdate(dbName, { isValid: 0 }, { 'auto_inc_id': whereObj.auto_inc_id }, 't_mgr_dept')
}

module.exports = Dept