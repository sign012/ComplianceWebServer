// 角色类
const dbCtl = require('../lib/dbctl/db-ctl')
let Role = {}
const dbName = 'DTDB'

//获取角色菜单
Role.getRoles = function (whereObj) {
   return dbCtl.selectNoSQL(dbName,{'auto_inc_id':{$like:`%${ whereObj.auto_inc_id || ''}%`},isValid:1},'t_mgr_role')
}

//创建角色
Role.createRoles = function (whereObj) {
   return dbCtl.execNoSQLRetValue(dbName,whereObj,[],'t_mgr_role')
}

//编辑角色
Role.editRoles = function (whereObj) {
   return dbCtl.execNoSQLForUpdate(dbName,whereObj,{'auto_inc_id':whereObj.auto_inc_id},'t_mgr_role')
}

//删除角色
Role.delRoles = function (whereObj) {
   return dbCtl.execNoSQLForUpdate(dbName,{isValid:0},{'auto_inc_id':whereObj.auto_inc_id},'t_mgr_role')
}

module.exports = Role