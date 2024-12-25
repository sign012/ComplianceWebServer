/**
 * 记录日志
 * */
const dbCtl = require('../lib/dbctl/db-ctl');
const moment = require('moment');
const logDBCtl = {};
const logger = require("../lib/logger");
const schedule = require('node-schedule');
// logType = {
//     1:'操作类',
//     2:'登录类',
//     3:'错误类',
// }
// 前端展示以下类型
// 1: "管理",
// 2: "登录",
// 3: "错误",
// 4: "新增",
// 5: "修改",
// 6: "审核",
// 7: "删除",


/**
 * 记录管理员操作日志
 * @param userId 用户ID
 * @param realName 用户真实姓名
 * @param logType 日志类型
 * @param cnt 操作内容
 * @param remark 备注
 * */
logDBCtl.setCompanyLog = (userId, realName, logType, cnt, remark) => {

	return dbCtl.execNoSQLRetValue('DTDB', {
		userId: userId,
		realName: realName,
		logType: logType || 1,
		cnt: cnt,
		isdel: 0,
		remark: remark || '',
		// auto_create_time: moment().format('YYYY-MM-DD HH:mm:ss')
	}, ['userId'], 't_mgr_log');

};
/**
 * 获取后台用户操作日志
 * @param {*} whereObj 
 * @param {*} pageSize 
 * @param {*} pageIndex 
 * @returns 
 */
logDBCtl.getCompanyLog = async (whereObj, pageSize = 50, pageIndex = 1, userId) => {
	//机构管理员 查看操作日志
	if (whereObj.orgId) {
		let userArr = await dbCtl.selectNoSQLForColumn('DTDB', { orgid: whereObj.orgId, isdel: 0 }, 't_dtuser', ['userbasic_uid']).then(res => {
			return res.data.map(e => {
				return e.userbasic_uid
			})
		})
		//根据用户id模糊搜索
		if (userId) {
			userArr = userArr.filter(e => {
				if (e.indexOf(userId) > -1) {
					return e
				}
			})
		}
		whereObj.userId = ['IN', userArr]
		delete whereObj.orgId
	}
	whereObj.isdel = 0
	let resCount = await dbCtl.selectNoSQLForRowCount('DTDB', whereObj, 't_mgr_log')
	let resData = await dbCtl.selectNoSQLForPage('DTDB', whereObj, 't_mgr_log', ['*'], pageSize, pageIndex, 'auto_inc_id', true);
	if (resCount.iRet === 0) {
		resData.total = resCount.data[0].amount
		return resData
	}
}




/**
 * 直播平台获取后台用户操作日志
 * @param {*} whereObj 
 * @param {*} pageSize 
 * @param {*} pageIndex 
 * @returns 
 */
logDBCtl.getOperLogList = async (whereObj, pageSize = 50, pageIndex = 1, userId) => {
	// whereObj = {};
	whereObj.isdel = 0
	let resCount = await dbCtl.selectNoSQLForRowCount('DTDB', whereObj, 't_mgr_log')
	let resData = await dbCtl.selectNoSQLForPage('DTDB', whereObj, 't_mgr_log', ['*'], pageSize, pageIndex, 'auto_create_time', true);
	if (resCount.iRet === 0) {
		resData.total = resCount.data[0].amount
		return resData
	}
}


// 清理验证码
logDBCtl.cleanVerifyCode = () => {
	schedule.scheduleJob('0 0 0 * * *', async () => {
		let ret = await dbCtl.execSQLToDB('DTDB', 'truncate table t_mgr_verify_code')
		if (ret.iRet === 0) {
			logger.tradeServerErrorLog.info('验证码表清理成功')
		} else {
			logger.tradeServerErrorLog.info('验证码表清理失败')
		}
	})
	logger.tradeServerErrorLog.info('开启验证码表清理...')
}
// // 清理日志操作
async function cleanLog() {
	logger.tradeServerErrorLog.info(`========开启日志清理========`)
	// let eTime = new Date(moment().startOf('month')).getTime()
	// 获取当前日期
	let now = moment();
	// 获取三个月前的那个月的第一天
	let threeMonthsAgoFirstDay = now.clone().subtract(2, 'months').startOf('month');
	let eTime = new Date(threeMonthsAgoFirstDay);  // 删除eTime之前的日志
	let today = moment().format('YYYYMMDD');  // 判断今天是否是月底最后一天
	let lastDayOfLastMonth = now.clone().endOf('month').format('YYYYMMDD'); //  判断今天是否是月底最后一天
	logger.tradeServerErrorLog.info("today", today, 'MonthDays', lastDayOfLastMonth)
	if (today !== lastDayOfLastMonth) { return }
	let { data } = await dbCtl.selectNoSQLForRowCount('DTDB', { isdel: 0, auto_create_time: ['BETWEEN', [0, moment(eTime).format('YYYY-MM-DD HH:mm:ss')]] }, 't_mgr_log')
	logger.tradeServerErrorLog.info('清理范围：', moment(eTime).format('YYYY-MM-DD HH:mm:ss'), '之前', '日志条数：', data[0].amount)
	if (data[0].amount === 0) return
	let bTime1 = new Date().getTime()
	let res = await dbCtl.execNoSQLForUpdate('DTDB', { isdel: 1 }, { auto_create_time: ['BETWEEN', [0, moment(eTime).format('YYYY-MM-DD HH:mm:ss')]], isdel: 0 }, 't_mgr_log')
	let eTime1 = new Date().getTime()
	logger.tradeServerErrorLog.info('清理日志耗时========>', eTime1 - bTime1)
	if (res.iRet === 0) {
		logger.tradeServerErrorLog.info('数据清理成功')
	}
}

// 定时清理日志
logDBCtl.cleanOptLog = async () => {
	// 开启日志清理
	if (global.CONFIG.CompliancePcWebServer.BasicCfg.clearLog == 1) {
		// 保证当前只有一个定时器在工作
		if (global.clean_task) global.clean_task.cancel()
		cleanLog()
		global.clean_task = schedule.scheduleJob(global.CONFIG.CompliancePcWebServer.BasicCfg.clearJob, () => {
			cleanLog()
		})
		// 3个小时检查 避免重启导致的清理不正常
		// setInterval(() => cleanLog(users), 1000 * 60 * 60 * 3)
		if (global.clean_task) logger.tradeServerErrorLog.info('定时任务正在运行...')

		return {
			iRet: 0,
			msg: '操作成功'
		}
	} else {
		// 关闭日志清理
		if (global.clean_task) {
			global.clean_task.cancel();
		}
		logger.tradeServerErrorLog.info('已关闭日志清理任务')
	}

}

module.exports = logDBCtl;