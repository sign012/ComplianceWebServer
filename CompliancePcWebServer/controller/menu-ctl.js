// 菜单类
const dbCtl = require('../lib/dbctl/db-ctl')
let Menu = {}
const dbName = 'DTDB'

//获取用户菜单
Menu.getMenus = function() {

    return dbCtl.selectNoSQLByOrder(dbName, { isValid: 1 }, 't_mgr_menu', 'sort', false)
}

//创建菜单
Menu.createMenus = function(whereObj) {
    return dbCtl.execNoSQLRetValue(dbName, whereObj, [], 't_mgr_menu')
}

//编辑菜单
Menu.editMenus = function(whereObj) {
    return dbCtl.execNoSQLForUpdate(dbName, whereObj, { 'auto_inc_id': whereObj.auto_inc_id }, 't_mgr_menu')
}

//删除菜单
Menu.delMenus = function(whereObj) {
    return dbCtl.execNoSQLForUpdate(dbName, { isValid: 0 }, { 'auto_inc_id': whereObj.auto_inc_id }, 't_mgr_menu')
}

module.exports = Menu