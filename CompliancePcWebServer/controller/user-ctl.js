// 用户管理
const dbCtl = require('../lib/dbctl/db-ctl');
const logCtl = require('../controller/log-ctl');
const commTool = require('../lib/common');
const cipherCode = require('../lib/cipherCode');
const logger = require('../lib/logger');
const ERROROBJ = require('../lib/enum-cfg');
const enumCfg = require('../lib/enum-cfg');
// const dcacheHelperCtl = require('../lib/dcache-helper');
let UserCtl = {};
const dbName = 'DTDB';

/**
 * 检查用名账号是否存在
 * @param {*} uid 用户账号
 * @returns 
 */
UserCtl.checkUser = (uid) => {
	return dbCtl.selectNoSQLForRowCount(dbName, { userbasic_uid: uid, isdel: 0 }, 't_dtuser')
}

/**
 * 添加用户
 * @param params 参数
 * @param adminObj 操作员信息 { uid:1,realname:'admin' }
 * */
UserCtl.addUser = async (params, adminObj) => {
	// 检查用户是否存在
	let retCountData = await UserCtl.checkUser(params.userbasic_uid)
	if (retCountData.iRet === 0 && retCountData.data[0].amount === 0) {
		// 用户不存在，可添加
		let userObj = {
			userbasic_uid: params.userbasic_uid,
			userbasic_password: params.userbasic_password,
			userbasic_usertype: params.userbasic_usertype,
			userbasic_rids: params.userbasic_rids || '',
			userbasic_userstatus: params.userbasic_userstatus,
			departid: params.departid || '', // 部门
			salt: params.salt, // 加盐
			realname: params.realname,
			created: Date.now(),
			isdel: '0',
			userList: params.userList || '', // 子账户列表
			//   mgrtype: params.mgrtype,
		};

		let hasExist = await dbCtl.selectNoSQL(dbName, { userbasic_uid: userObj.userbasic_uid }, 't_dtuser').then(res => {
			if (res.data.length > 0) {
				return true
			} else {
				return false
			}
		})
		if (!hasExist) {
			// 不存在即插入
			let retUserData = await dbCtl.execNoSQLRetValue(dbName, userObj, ['auto_inc_id'], 't_dtuser');
			if (retUserData.iRet === 0) {
				// 通知缓存服务
				// commTool.sendNotice('PN_USER', `where userbasic_uid ='${userObj.userbasic_uid}' and isdel = 0`, adminObj)
				// 记录操作日志
				logCtl.setCompanyLog(adminObj.uid || '1', adminObj.realname || 'admin', '1', `平台添加了${userObj.userbasic_uid} 用户`);
			}
			return retUserData;
		} else {
			return {
				iRet: -10003,
				msg: '该用户账号已存在!'
			}
		}
	} else {
		return { iRet: 80001, msg: ERROROBJ["80001"], data: {} };
	}

};


/**
 * 更新用户信息
 * @param params 待更新参数
 * @param setType update/del
 * @param whereObj 条件
 * @param adminObj 操作员信息 { uid:1,realname:'admin' }
 * */
UserCtl.setUser = async (params, setType, whereObj, adminObj) => {
	let retUpdateData
	retUpdateData = await dbCtl.execNoSQLForUpdate(dbName, params, whereObj, 't_dtuser');
	let logStr = ''
	if (retUpdateData.iRet === 0) {
		// 删除操作不发送加载缓存行为
		if (setType !== 'del') {
			// 通知缓存
			// commTool.sendNotice('PN_USER', `where userbasic_uid ='${whereObj.userbasic_uid}' and isdel = ${setType === 'del' ? 1 : 0}`, adminObj)

		}
		// 记录操作日志
		const setStr = setType === 'update' ? '更新' : (setType === 'pwd' ? '修改' : '删除');
		if (setType === 'update') {
			if (params.userbasic_userstatus == 2) {
				delete global.user_cache_info[whereObj.userbasic_uid]
				logStr += `的状态为冻结`
			} else {
				let { data } = await dbCtl.selectNoSQL(dbName, { userbasic_uid: whereObj.userbasic_uid }, 't_dtuser')
				let obj = data[0]
				let userInfo = {
					uid: obj.userbasic_uid,
					userType: obj.userbasic_usertype,
					rIds: obj.userbasic_rids,
					departId: obj.departid,
					orgId: obj.orgid,
					realName: obj.realname,
					mgrType: obj.mgrtype,
					userList: obj.userList
				}
				global.user_cache_info[whereObj.userbasic_uid] = userInfo
				logStr += `的信息内容为:${JSON.stringify(params)}`
			}
		}
		if (setType === 'pwd') {
			logStr += '的密码'
		}
		logCtl.setCompanyLog(adminObj.uid || '1', adminObj.realname || 'admin', '1', `平台${setStr}了${whereObj.userbasic_uid}用户${logStr}`);
	}
	return retUpdateData;
};


/**
 * 检查用户登录，返回用户信息
 * @param userId 用户登录名
 * @param pwd 密码
 * @return {iRet:状态码(0成功),msg:'',data:{用户信息}}
 * */
UserCtl.checkUserLogin = async (userId, pwd, remark) => {
	// 检查用户的 加盐码 + 用户的类型（类型用于前置判定是否运行登录平台）
	let retData = await dbCtl.selectNoSQL(dbName, {
		userbasic_uid: userId,
		isdel: '0',
	}, 't_dtuser');
	if (retData.iRet === 0 && retData.data.length > 0) {
		const userInfo = retData.data[0];
		// 账户是否被禁用
		if (userInfo.userbasic_userstatus == 2) {
			return {
				iRet: 80006,
				msg: ERROROBJ['80006'],
				data: {},
			};
		}
		// 只有部门管理员可以登录后台管理系统 A 管理员 T 交易员 
		// if (userInfo.userbasic_usertype !== 'A') {
		//     return {
		//         iRet: 80003,
		//         msg: ERROROBJ['80003'],
		//         data: {},
		//     };
		// }
		if (pwd === userInfo.userbasic_password) {
			let rIds = '';
			try {
				rIds = userInfo.userbasic_rids === '' ? '' : JSON.parse(userInfo.userbasic_rids);
			} catch (e) {
				logger.userLogin.info(' 用户角色列表拉取错误 ===>', userInfo);
				rIds = '';
			}
			// 登录成功写日志
			logCtl.setCompanyLog(userId || '1', userInfo.realname || 'admin', 2, `成功登录平台`, remark);

			let uObj = {
				uId: userInfo.userbasic_uid, // 用户id
				rName: userInfo.realname, // 用户真实名
				mType: userInfo.mgrtype, // 管理类型
				orgId: userInfo.orgid,
				departId: userInfo.departid
			};
			const _token = cipherCode.encryption(JSON.stringify(uObj));
			return {
				iRet: 0,
				msg: ERROROBJ['0'],
				token: _token,
				data: { // 用户信息
					uid: userInfo.userbasic_uid,
					userType: userInfo.userbasic_usertype,
					rIds: rIds,
					departId: userInfo.departid,
					orgId: userInfo.orgid,
					realName: userInfo.realname,
					stopMoney: userInfo.stopmoney,
					mgrType: userInfo.mgrtype,
				},
			};
		} else {
			return {
				iRet: 80004,
				msg: ERROROBJ['80004'],
				data: {},
			};
		}
	} else {
		return {
			iRet: 80002,
			msg: ERROROBJ['80002'],
			data: {},
		};
	}
};

/**
 * 获取用户信息
 * @param {*} userid 
 * @returns 
 */
UserCtl.getUserInfo = async (userid) => {
	let retData = await dbCtl.selectNoSQL(dbName, { userbasic_uid: userid, userbasic_userstatus: 0, isdel: 0 }, 't_dtuser')
	return retData
}

/**
 * 查询全体员工信息
 * @param {*} whereObj 查询条件
 * @param {*} pageSize 
 * @param {*} pageIndex 
 * @returns 
 */
UserCtl.getUser = async (usertype, whereObj, pageSize, pageIndex = 1) => {
	whereObj.isdel = 0;
	if (usertype !== '') {
		if (usertype === 'S') {
			// whereObj.orgid = { $like: `%${whereObj.orgid || ''}%` } // 超管
		}
	}
	let count = await dbCtl.selectNoSQLForRowCount(dbName, whereObj, 't_dtuser')
	let retUpdateData = await dbCtl.selectNoSQLForPage(dbName, whereObj, 't_dtuser', ['*'], pageSize || count.data[0].amount, pageIndex, 'userbasic_usertype', false);
	retUpdateData.total = count.data[0].amount
	return retUpdateData;
}

/**
 * 获取部门/机构对应的字典信息
 * @returns 
 */
UserCtl.getUserOrgDeptDict = async () => {

	let retOrgData = await dbCtl.selectNoSQLForColumn(dbName, { isdel: 0 }, 't_dtorg', ['orgid', 'name']);

	let retDeptData = await dbCtl.selectNoSQLForColumn(dbName, { isdel: 0 }, 't_dtdepartment', ['departid', 'name']);

	let _tempObj = {};
	for (let item of retOrgData.data) {
		_tempObj[`${item.orgid}`] = item.name;
	}
	for (let item of retDeptData.data) {
		_tempObj[`${item.departid}`] = item.name;
	}

	return {
		iRet: 0,
		msg: '',
		data: _tempObj
	};
}

/**
 * 根据权限获取相关的组织结构
 * @param {*} params 
 * @returns 
 */
UserCtl.getUserTree = async (params) => {
	let { rIds, userbasic_usertype } = params
	if (rIds === 'admin') {
		// 管理获取所有的机构信息
		return UserTree({ isdel: 0 }, userbasic_usertype)
	} else {

		let { orgid } = params
		if (rIds[0] == 2) {
			// 部门管理员
			return UserTree({ isdel: 0, orgid }, userbasic_usertype, params.departid)
		} else {
			// 机构管理员
			return UserTree({ isdel: 0, orgid }, userbasic_usertype)
		}

	}
}
/**
 * 获取 机构 部门 员工 资产包 数组
 * @param {*} whereObj 
 * @param {*} userbasic_usertype 
 * @returns 
 */
async function UserTree(whereObj, userbasic_usertype, departid) {
	let retOrgData = await dbCtl.selectNoSQLForColumn(dbName, whereObj, 't_dtorg', ['orgid', 'name']);
	if (departid) {
		whereObj.departid = departid
	}
	let retPartData = await dbCtl.selectNoSQLForColumn(dbName, whereObj, 't_dtdepartment', ['departid', 'orgid', 'name']);
	//根据用户类型进行查询
	if (userbasic_usertype) {
		whereObj.userbasic_usertype = userbasic_usertype
	}
	let retUserData = await dbCtl.selectNoSQLForColumn(dbName, whereObj, 't_dtuser', ['orgid', 'departid', 'realname', 'userbasic_uid', 'mgrtype', 'userbasic_usertype']);
	let retAssetData = await getUserAsset()
	let data = {
		orgList: retOrgData.data || [],
		partList: retPartData.data || [],
		userList: retUserData.data || [],
		assetPackage: retAssetData
	}
	return {
		iRet: 0,
		data
	}
}
/**
 * 获取员工资产包 集合
 * @returns 
 */
async function getUserAsset() {
	return new Promise(async (resolve, reject) => {
		await dbCtl.customOperate(dbName).select(
			'ua.userid as userbasic_uid',
			'ua.assetid',
			'ab.name'
		).from('t_dtuserasset as ua').leftJoin('t_dtassetbase as ab', 'ua.assetid', 'ab.assetid').where('ua.isdel', '=', 0).then(data => {
			resolve(data)
		})
	})
}




module.exports = UserCtl