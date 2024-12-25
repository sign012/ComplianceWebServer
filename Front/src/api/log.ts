import request from '@/utils/axiosReq';
/** 机构操作 API */
export function getOpLogReq(data: any) {
  return request({
    url: '/api-log/log/list',
    method: 'post',
    data
  });
}

export function getUserLogReq(data: any) {
  return request({
    url: '/api-log/log/useList',
    method: 'post',
    data
  });
}

export function cleanLogReq(data: any) {
  return request({
    url: '/api-log/log/clean',
    method: 'post',
    data
  });
}
// 直播平台操作日志
export function getOperLogList(data: any) {
  return request({
    url: '/api-log/log/operlist',
    method: 'post',
    data
  });
}
