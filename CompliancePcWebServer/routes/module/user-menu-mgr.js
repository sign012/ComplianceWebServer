/**
 * 管理用户 + 菜单栏目管理接口
 * */

const express = require('express');
const path = require('path');
const moment = require('moment');
const Menu = require('../../controller/menu-ctl');
const Role = require('../../controller/role-ctl');
const Dept = require('../../controller/dept-ctl');
const UserCtl = require('../../controller/user-ctl');
const cipher = require('../../lib/cipherCode');
const commTool = require('../../lib/common');
const logDBCtl = require('../../controller/log-ctl')
const ERROROBJ = require('../../lib/enum-cfg');
const cipherCode = require("../../lib/cipherCode");


const router = express.Router(),
	dbName = 'DTDB';

/*********** 菜单管理 **********/
// 获取菜单
router.post('/get-menus', async (req, res, next) => {
	let resData = await Menu.getMenus(); // 只有admin超管才能看所有菜单resData
	// 一个账户只有一个角色权限 
	let resData_1 = await Role.getRoles({ auto_inc_id: req.body.rids })
	if (req.body.rids !== 'admin' && req.body.rids) {
		let allMenu = resData.data
		if (resData_1.iRet === 0 && resData_1.data.length > 0) {
			let rolesMenu = JSON.parse(resData_1.data[0].menuList)
			let tempArr = []
			for (let key in rolesMenu) {
				tempArr.push(parseInt(key))
				for (let item of rolesMenu[key]) {
					tempArr.push(item.id)
				}
			}
			//过滤符合的用户菜单
			resData.data = allMenu.filter(e => {
				if (tempArr.includes(e.auto_inc_id)) {
					return e
				}
			})
		}
	}
	// 菜单只给admin使用
	if (!req.body.rids) {
		resData.data = resData.data.filter(e => e.filePath !== 'menu-mgr')
	}
	res.json(resData)
})

// 创建菜单
router.post('/creat-menus', async (req, res, next) => {
	if (!req.body.menuName || !req.body.menuPath) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return
	}
	let resData = await Menu.createMenus(req.body)

	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台创建 ${req.body.menuName}菜单`)
	}
})

// 编辑菜单
router.post('/edit-menus', async (req, res, next) => {
	if (!req.body.menuName || !req.body.menuPath || (!req.body.pId && req.body.pId != 0) || (!req.body.isLeaf && req.body.isLeaf != 0) || !req.body.auto_inc_id) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} });
		return
	}
	let reqData = {
		IsValid: req.body.IsValid,
		filePath: req.body.filePath,
		isLeaf: req.body.isLeaf,
		menuIcon: req.body.menuIcon,
		menuName: req.body.menuName,
		menuPath: req.body.menuPath,
		pId: req.body.pId,
		auto_inc_id: req.body.auto_inc_id,
		sort: req.body.sort
	}
	let resData = await Menu.editMenus(reqData)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台编辑 ${req.body.menuName}菜单`)
	}

})

//删除菜单
router.post('/del-menus', async (req, res, next) => {
	if (!req.body.auto_inc_id) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} });
		return
	}
	let resData = await Menu.delMenus(req.body)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台删除 ${req.body.menuName}菜单`)
	}

})
/*********** 角色管理 **********/
//获取角色
router.post('/get-roles', async (req, res, next) => {
	let resData = await Role.getRoles(req.body)
	if (res.locals.userInfo.mgrType !== 'S') {
		// let arr = resData.data.filter(item => item.departId === res.locals.userInfo.departId);
		// resData.data = arr;
	}
	resData.data.forEach(e => {
		e.create_time = e.create_time ? moment(e.create_time).format("YYYY-MM-DD HH:mm:ss") : '-';
		e.update_time = e.update_time ? moment(e.update_time).format("YYYY-MM-DD HH:mm:ss") : '-';
		let menuList = JSON.parse(e.menuList)

		e.rights = []
		e.operList = []


		for (let key in menuList) {
			for (let item of menuList[key])
				e.rights.push(item.name)
		}
		e.rights = e.rights.join('、');
		// 操作权限

		switch (e.roleType) {
			case "A":
				e.operList = ['审核', '编辑'];
				break;
			case "B":

				e.operList = ['编辑'];
				break;
			case "C":
				e.operList = ['审核'];
				break;
			case "D":
				e.operList = ['无'];
				break;
			default:
				e.operList = ['无'];
		}
		e.operList = e.operList.join('、');

	})
	res.json(resData)
})
//创建角色
router.post('/create-roles', async (req, res, next) => {
	if (!req.body.roleName) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return
	}
	req.body.create_time = moment().format('YYYY-MM-DD HH:mm:ss');

	req.body.isValid = 1;
	let resData = await Role.createRoles(req.body)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台创建 ${req.body.roleName}角色`)
	}

})
//编辑角色
router.post('/edit-roles', async (req, res, next) => {
	if (!req.body.auto_inc_id || !req.body.roleName) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return
	}
	let reqData = {
		auto_inc_id: req.body.auto_inc_id,
		isValid: req.body.isValid,
		menuList: req.body.menuList,
		roleName: req.body.roleName,
		roleType: req.body.roleType,
		update_time: moment().format('YYYY-MM-DD HH:mm:ss'),
		create_time: req.body.create_time,
		userList: req.body.userList,
		departId: req.body.departId,
	}
	let resData = await Role.editRoles(reqData)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台编辑 ${req.body.roleName}角色`)
	}

})
//删除角色
router.post('/del-roles', async (req, res, next) => {
	if (!req.body.auto_inc_id) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return
	}
	let resData = await Role.delRoles(req.body)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台删除 ${req.body.roleName}角色`)
	}

})


/*********** 用户管理相关 **********/

router.post('/get-org-dept', async (req, res, next) => {

	let retData = await UserCtl.getUserOrgDeptDict();
	res.json(retData)

});


/* 获取用户信息 */
router.post('/get-user-info', async (req, res, next) => {
	let token = req.headers['x-token'];
	const tokenObj = JSON.parse(cipher.decryption(token));
	// 新增信息： 用户公司，用户权限列表
	let userInfo = res.locals.userInfo;
	// 超管所属公司为0 
	if (userInfo.mgrType === 'S') {
		userInfo.departId = '0';
		userInfo.userType = 'A';

	} else {
		let roleId = JSON.parse(userInfo.rIds) ? Number(JSON.parse(userInfo.rIds)[0]) : '';
		let roledata = await Role.getRoles({ auto_inc_id: roleId })
		if (roledata.iRet === 0) {
			userInfo.userType = roledata.data[0].roleType;
		}
	}

	res.locals.userInfo = userInfo;
	console.log('最新缓存用户信息', res.locals.userInfo)
	global.user_cache_info[tokenObj.uId] = userInfo
	// 返回用户信息
	res.json({
		iRet: 0,
		msg: '',
		data: res.locals.userInfo
	});

});

/* 创建用户 */
router.post('/add-user', async (req, res, next) => {

	let isEmpty = false;
	for (let key in req.body) {
		if (key === 'userbasic_uid' ||
			key === 'userbasic_usertype' ||
			key === 'realname' ||
			key === 'mgrtype') {
			if (!req.body[key] || req.body[key] === '') {
				isEmpty = true;
			}
		}
	}

	if (isEmpty) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return;
	}

	const salt = commTool.randomString(-6);
	// let pwd = (req.body.password && req.body.password !== '') ? cipher.onePwdMD5Salt(req.body.password, salt) : cipher.pwdMD5(global.CONFIG.CompliancePcWebServer.BasicCfg.defaultPwd, salt);
	let resData = await UserCtl.addUser({
		userbasic_uid: req.body.userbasic_uid,
		userbasic_password: req.body.userbasic_password,
		userbasic_usertype: req.body.userbasic_usertype,
		userbasic_rids: (req.body.userbasic_rids && req.body.userbasic_rids !== '') ? JSON.stringify(req.body.userbasic_rids.split('|')) : '',
		departid: req.body.departid || '',
		// orgid: req.body.orgid || '',
		salt: salt,
		realname: req.body.realname,
		// stopmoney: req.body.stopmoney || '0',

		userbasic_userstatus: req.body.userbasic_userstatus,
		// userbasic_exinfo_telno: req.body.userbasic_exinfo_telno,
		// extraparams: req.body.extraparams,
		userList: req.body.userList,
		mgrtype: req.body.mgrtype,
	}, {
		uid: res.locals.userInfo.uid,
		realname: res.locals.userInfo.realName
	});

	return res.json(resData);

});

/* 设置用户 stype : update / del / pwd */
router.post('/set-user/:stype', async (req, res, next) => {
	for (let key in req.body) {
		if (key === 'userbasic_uid' || key === 'userbasic_usertype' || key === 'mgrtype') {
			if (!req.body[key] || req.body[key] === '') {
				isEmpty = true;
			}
		}
	}

	let param = {},
		whereObj = {
			userbasic_uid: req.body.userbasic_uid,
			// userbasic_usertype: req.body.userbasic_usertype,
			isdel: 0,
			// mgrtype: req.body.mgrtype,
		};
	if (req.params.stype === 'update') {
		for (let key in req.body) {
			if (key === 'userbasic_uid' || key === 'mgrtype') { } else if (key === 'userbasic_rids') {
				param['userbasic_rids'] = (req.body.userbasic_rids && req.body.userbasic_rids !== '') ? JSON.stringify(req.body.userbasic_rids.split('|')) : '';
			} else {
				param[key] = req.body[key];
			}
		}
	} else if (req.params.stype === 'pwd') {
		if (req.body.password === '') {
			return {
				iRet: 80005,
				msg: ERROROBJ['80005'],
				data: ''
			}
		}
		let newpwd = req.body.password
		param = {
			userbasic_password: newpwd
		};
	} else {
		param = { isdel: 1 };
	}

	let resData = await UserCtl.setUser(param, req.params.stype, whereObj, {
		uid: res.locals.userInfo.uid,
		realname: res.locals.userInfo.realName
	});

	res.json(resData);

});

/**
 * 获取用户列表
 * stype ：dept-部门查询  stype  all 所有  org 机构  trade交易员
 * */
router.post('/get-users/:stype', async (req, res, next) => {
	let whereObj = {};
	let usertype = ''
	if ((!req.body.value || req.body.value === '') && ['dept', 'user', 'org'].indexOf(req.params.stype) > -1) {
		return res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: [] })
	}

	if (req.params.stype === 'dept') {
		// 部门
		whereObj = {
			departid: req.body.value,
		};
	} else if (req.params.stype === 'user') {
		// 用户
		whereObj = {
			isdel: 0,
			"$and": [
				{ userbasic_uid: `${req.body.value}` },
				{ realname: { $like: `%${req.body.value}%` } },
			]

		};
	} else if (req.params.stype === 'userinfo') {
		// 用户
		whereObj = {
			isdel: 0,
			realname: { $like: `%${req.body.value}%` },
		};
		if (req.body.orgid) {
			whereObj.orgid = req.body.orgid
		}
	} else {
		return res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: [] })
	}

	let resData = await UserCtl.getUser(usertype, whereObj, req.body.pageSize, req.body.pageIndex)
	res.json(resData)
});


//获取员工列表
router.post('/user-list', async (req, res, next) => {
	let whereObj = {
		isdel: 0,
		"$and": [
			{ userbasic_uid: { $like: `%${req.body.value || ''}%` } },
			{ realname: { $like: `%${req.body.value || ''}%` } },
		]
	};
	for (let key in req.body) {
		if (['pageSize', 'pageIndex', 'value', 'stype', 'subDepartmentIds'].includes(key)) {
			continue
		}
		whereObj[key] = req.body[key]
	}
	let usertype = req.body.stype
	let resData = await UserCtl.getUser(usertype, whereObj, req.body.pageSize, req.body.pageIndex)

	// 非管理员 且 非顶级部门时，用户列表需要筛选部门
	if (res.locals.userInfo.mgrType !== 'S' && res.locals.userInfo.departId != 0) {
		if (req.body.subDepartmentIds && req.body.subDepartmentIds.length > 0) {
			console.log('根据部门筛选员工')
			let userListFilter = resData.data.filter(e => req.body.subDepartmentIds.includes(Number(e.departid)));
			resData.data = userListFilter;
		}
	}
	res.json(resData)
})



// 检测用户账号是否存在
router.post('/check-user', async (req, res, next) => {
	let userbasic_uid = req.body.userbasic_uid || ''
	let resData = await UserCtl.checkUser(userbasic_uid)
	if (resData.iRet === 0 && resData.data[0].amount === 0) {
		res.json({ iRet: 0, msg: ERROROBJ["0"], data: {} })
	} else {
		res.json({ iRet: 90004, msg: ERROROBJ["90004"], data: {} });
	}
})

// 获取员工树形结构
router.post('/get-tree-user', async (req, res, next) => {
	if (!req.body.rIds || (req.body.rIds !== 'admin' && !req.body.orgid)) {
		return res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} });
	} else {
		let params = {
			rIds: req.body.rIds,
			orgid: req.body.orgid,
			departid: req.body.departid
		}
		//根据用户类型进行筛选 A 管理 T 交易
		if (req.body.userbasic_usertype) {
			params.userbasic_usertype = req.body.userbasic_usertype
		}
		let resData = await UserCtl.getUserTree(params)
		res.json(resData)
	}
})
/**
 * 分组管理
 */
router.post('/get-group', async (req, res, next) => {
	let resData = await UserCtl.getGroup()
	res.json(resData)
})
router.post('/set-group/:type', async (req, res, next) => {
	let type = req.params['type']
	let whereObj = req.body
	let resData = await UserCtl.setGroup(type, whereObj)
	res.json(resData)
})


// 部门管理

//获取角色
router.post('/get-depts', async (req, res, next) => {
	let resData = await Dept.getDepts(req.body)

	resData.data.forEach(e => {
		e.create_time = e.create_time ? moment(e.create_time).format("YYYY-MM-DD HH:mm:ss") : '-';
		e.update_time = e.update_time ? moment(e.update_time).format("YYYY-MM-DD HH:mm:ss") : '-';
	})
	res.json(resData)
})
//创建部门
router.post('/create-dept', async (req, res, next) => {
	if (!req.body.deptName) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return
	}
	req.body.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
	req.body.isValid = 1;
	let resData = await Dept.createDept(req.body)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台创建 ${req.body.deptName}部门`)
	}

})
//编辑部门
router.post('/edit-dept', async (req, res, next) => {
	if (!req.body.auto_inc_id || !req.body.deptName) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return
	}
	let reqData = {
		auto_inc_id: req.body.auto_inc_id,
		deptName: req.body.deptName,
		departId: req.body.departId,
		remark: req.body.remark,
		update_time: moment().format('YYYY-MM-DD HH:mm:ss'),
		create_time: req.body.create_time,
		isValid: req.body.isValid,
		pid: req.body.pid,
		level: req.body.level
	}
	let resData = await Dept.editDept(reqData)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台编辑 ${req.body.deptName}部门`)
	}

})
//删除部门
router.post('/del-dept', async (req, res, next) => {
	if (!req.body.auto_inc_id) {
		res.json({ iRet: 10001, msg: ERROROBJ["10001"], data: {} })
		return
	}
	let resData = await Dept.delDept(req.body)
	res.json(resData)
	if (resData.iRet === 0) {
		logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', 1, `平台删除 ${req.body.deptName}部门`)
	}

})

/**
 *  直播相关接口 记录操作日志
 */
/* 创建用户 */
router.post('/set-livelog', async (req, res, next) => {

	let msg = req.body.msg;
	let data = req.body.data;
	let logType = req.body.logType;
	// console.log('msg', msg);
	// console.log('data', data);
	logDBCtl.setCompanyLog(res.locals.userInfo.uid || 'admin', res.locals.userInfo.realName || 'admin', logType, msg + '内容为：' + JSON.stringify(data))
	return res.json({ iRet: 0, msg: '', });

});


module.exports = router;