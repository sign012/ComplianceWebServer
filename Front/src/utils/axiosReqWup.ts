import axios from 'axios';
import { getToken } from '@/utils/auth';
const service: any = axios.create({
  // baseURL: process.env.VUE_APP_URL, //'/mgr',   //  涉及 WUP 和 本地的 HTTP 请求，baseURL 取消
  timeout: 30000 // 超时时间
});
// 请求拦截
service.interceptors.request.use(
  (request: any) => {

	// 客户端信息
		let client_info = {
			account_id: localStorage.getItem('last_loginName') || '',
			token:getToken() || ''
		} 
	 // 检查请求的 data 是否存在
	 if (request.data && request.data.req) {
		// 如果 data 是 FormData 或 URLSearchParams，则直接添加 client_info
		if (request.data.req instanceof FormData || request.data.req instanceof URLSearchParams) {
		  request.data.req.append('client_info', JSON.stringify(client_info));
		} else {
		  // 否则，将 client_info 添加到 data 对象中
		  request.data.req = {
			...request.data.req,
			client_info
		  };
		}
	  } else {
		// 如果 data 不存在，则创建一个包含 client_info 的对象
		request.data.req = {
		  client_info
		};
	  }
    return request;
  },
  (err: any) => {
    Promise.reject(err);
  }
);
// 响应拦截
service.interceptors.response.use((res: any) => {
  return res.data.rsp;
});

export default service;
