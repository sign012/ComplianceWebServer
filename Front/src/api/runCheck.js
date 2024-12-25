// 运行审查 页面相关api 
import requestWup from "@/utils/axiosReqWup";
import store from "../store";
import dayjs from 'dayjs';
import request from '@/utils/axiosReq';
const baseurl = store.state.user.wupUrl;
const baseURL_wup = baseurl || '//prx.test.upchina.com/json/live_monitor';

// 直播模块 记录日志
const setLog = (data, logType, msg) => {
	console.log('data', data);
	return request({
		url: '/api-user/set-livelog',
		method: 'post',
		data: {
			data,
			logType,
			msg
		}
	});
}


//  走wup
export const queryEmployee = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryEmployee`,
		method: "POST",
		data: {
			req: data,
		},
	}).then((ret) => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 直播报备列表
export const queryLiveReport = (data = {}) => {
	return requestWup({
		url: `${baseURL_wup}/queryLiveReport`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 删除直播报备计划(仅支持删除未审核的记录)
export const deleteLiveReportInfo = (data = {}) => {
	return requestWup({
		url: `${baseURL_wup}/deleteLiveReportInfo`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 7, `删除了直播报备计划`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
//   语音转文字
export const queryLiveContent = (data) => {
	return requestWup({
		url: `${baseURL_wup}/queryLiveContent`,
		method: "POST",
		data: {
			req: {
				live_id: data.id,
				// live_id: 'LiveA20240604080135AUP00002A2ALHA274',
				page_number: data.pageIndex,
				page_size: data.pageSize,
				time_type: Number(data.type)
			},
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
//   违规记录 直播详情用live_id请求， 直播监控用employee_id请求
export const queryLiveViolation = (data = {}) => {
	// data = {
	//     id: 'LiveA20240628085231AUP00005A2A3A61',
	//     type: 1,
	// }
	let params = {};
	if (data.id) {
		params = {
			live_id: data.id,
			time_type: Number(data.type),
		};
	} else {
		params = {
			time_type: 0,
			start_time: {
				timestamp: dayjs().startOf('day').valueOf() / 1000,
				range_type: 1
			},
			end_time: {
				timestamp: dayjs().add(1, 'day').startOf('day').valueOf() / 1000,
				range_type: 4
			},
			employee_id: data.employee_id,
			live_platform: data.live_platform,
			status: data.status,

		};
	}

	return requestWup({
		url: `${baseURL_wup}/queryLiveViolation`,
		method: "POST",
		data: {
			req: params,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

//  添加直播报备
export const createLiveReport = (data) => {
	return requestWup({
		url: `${baseURL_wup}/createLiveReport`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 4, `新增了直播报备计划`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 修改直播报备
export const updateLiveReportInfo = (data) => {
	return requestWup({
		url: `${baseURL_wup}/updateLiveReportInfo`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 5, `修改了直播报备计划`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 审核直播报备
export const auditLiveReportInfo = (data) => {
	return requestWup({
		url: `${baseURL_wup}/auditLiveReportInfo`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 6, `审核了直播报备计划`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

//  添加员工
export const createEmployeeInfo = (data) => {
	// return;
	return requestWup({
		url: `${baseURL_wup}/createEmployeeInfo`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 4, `新增了主播`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 修改主播
export const updateEmployeeInfo = (data) => {
	return requestWup({
		url: `${baseURL_wup}/updateEmployeeInfo`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 5, `修改了${data.employee_id}主播信息`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 修改主播监控状态
export const changeEmployeeMonitorStatus = (data) => {
	return requestWup({
		url: `${baseURL_wup}/changeEmployeeMonitorStatus`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 5, `修改了${data.employee_id}主播监控状态`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 正在直播列表
export const queryLiveCurrent = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryLiveCurrent`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};


// 直播回看列表
export const queryLiveHistory = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryLiveHistory`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 审核违规记录
export const auditLiveViolation = (data = {}) => {
	return requestWup({
		url: `${baseURL_wup}/auditLiveViolation`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 6, `审核了违规记录`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 风险统计
export const queryLiveStats = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryLiveStats`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 风险统计-审核明细
export const queryLiveViolationBatch = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryLiveViolationBatch`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 正在直播列表
export const queryUnionLiveInfoByIds = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryUnionLiveInfoByIds`,
		method: "POST",
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};


// 查询敏感词库
export const querySensitiveWordsList = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/querySensitiveWordsList`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 查询敏感词详情
export const querySensitiveWordsDetail = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/querySensitiveWordsDetail`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 删除敏感词库
export const deleteSensitiveWords = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/deleteSensitiveWords`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 7, `删除了敏感词库`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 新增敏感词库
export const createSensitiveWords = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/createSensitiveWords`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			data.words = data.words.slice(0, 10);
			setLog(data, 4, `新增了敏感词库(日志只截取前10个敏感词展示)`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 更新敏感词库
export const updateSensitiveWords = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/updateSensitiveWords`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			data.words = data.words.slice(0, 10);
			setLog(data, 4, `新增了敏感词库(日志只截取前10个敏感词展示)`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};


// 查询邮件告警任务
export const queryEmailAlertTask = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryEmailAlertTask`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};


// 删除邮件告警任务
export const deleteEmailAlertTask = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/deleteEmailAlertTask`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 7, `删除了邮件告警任务`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 新增邮件告警任务
export const createEmailAlertTask = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/createEmailAlertTask`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 4, `新增了邮件告警任务`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};
// 更新邮件告警任务
export const updateEmailAlertTask = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/updateEmailAlertTask`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 5, `更新了邮件告警任务`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 查询风险分类列表 
export const queryCustomizeLabelInfo = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryCustomizeLabelInfo`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 更新风险分类列表 
export const updateCustomizeLabelInfo = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/updateCustomizeLabelInfo`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		if (ret && ret.eno && ret.eno.error_code === 0) {
			setLog(data, 5, `更新了风险分类列表`);
		}
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};

// 查询所有违规标签
export const queryOriginalLabelInfo = (data = {}) => {

	return requestWup({
		url: `${baseURL_wup}/queryOriginalLabelInfo`,
		method: "POST", // GET
		data: {
			req: data,
		},
	}).then(ret => {
		return {
			ret: ret.eno.error_code,
			msg: ret.eno.error_msg,
			data: ret,
		};
	});
};