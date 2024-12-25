const express = require('express');
const router = express.Router();
const moment = require('moment');
const logDBCtl = require('../../controller/log-ctl')
const ERROROBJ = require('../../lib/enum-cfg');
const app = require('../api')

let getLogList = async (req, res) => {
	let params = {
		userId: { $like: `%${req.body.userId || ''}%` },
		cnt: { $like: `%${req.body.cnt}%` },
		logType: { $like: `%${req.body.logType}` },
	}
	if (req.body.orgId) {
		params.orgId = req.body.orgId
	}
	if (req.body.auto_create_time) {
		params.auto_create_time = ['BETWEEN', req.body.auto_create_time]
	}
	let pageSize = req.body.pageSize || 50
	let pageIndex = req.body.pageIndex || 0
	let resData = await logDBCtl.getCompanyLog(params, pageSize, pageIndex, req.body.userId)
	res.json(resData)
}

let getTradeLog = async (params, res) => {
	let pageSize = params.pageSize || 50
	let pageIndex = params.pageIndex || 1
	let resData = await logDBCtl.getTradeLog(params, pageSize, pageIndex)
	res.json(resData)
}
let getOperLogList = async (req, res) => {
	let params = {
		userId: { $like: `%${req.body.userId || ''}%` },
		cnt: { $like: `%${req.body.cnt}%` },
		logType: { $like: `%${req.body.logType}` },
	}
	if (req.body.orgId) {
		params.orgId = req.body.orgId
	}
	if (req.body.auto_create_time) {
		params.auto_create_time = ['BETWEEN', req.body.auto_create_time]
	}
	let pageSize = req.body.pageSize || 50
	let pageIndex = req.body.pageIndex || 1
	let resData = await logDBCtl.getOperLogList(params, pageSize, pageIndex)
	// 非管理员 且 非顶级部门时，操作日志列表需要筛选部门
	// if (res.locals.userInfo.mgrType !== 'S' && res.locals.userInfo.departId != 0) { 

	//     let operListFilter = resData.data.filter(e =>  {
	// 		req.body.userIdByDept.forEach(items=>{
	// 			if(items == e.auto_inc_id) {
	// 				return true;
	// 			}
	// 		})
	// 	});

	//     resData.data = operListFilter;
	// }
	res.json(resData)
}

/** 日志操作 */
router.post('/log/:type/:funcname?', async (req, res, next) => {
	if (req.params['type'] === 'list') {
		// getLogList(req, res)  
	}
	if (req.params['type'] === 'useList') {
		// getTradeLog(req.body, res)  
	}
	if (req.params['type'] === 'clean') {
		// res.json(logDBCtl.cleanOptLog(app)) //  定时清理日志
	}
	if (req.params['type'] === 'operlist') {
		getOperLogList(req, res)
	}
	if (req.params['type'] === 'add') {
		getOperLogList(req, res)
	}

})
module.exports = router