import request from '@/utils/axiosReq';
import { ObjTy } from '@/types/common';
import store from '../store';
/* 登录验证 */
export function loginReq(data: ObjTy) {
  // let id = sessionStorage.getItem('yzmid');
  let id = store.state.user.yzmid;
  console.log('登录验证===>', id);
  return request({
    url: `/login/check/${id}`,
    data,
    method: 'post',
    bfLoading: false,
    isParams: false,
    isAlertErrorMsg: false
  });
}

export function getInfoReq() {
  return request({
    url: '/api-user/get-user-info',
    bfLoading: false,
    method: 'post'
  });
}

export function logoutReq() {
  return request({
    url: '/login/logout',
    method: 'post'
  });
}

export function getMenuReq(data: any) {
  return request({
    url: '/api-user/get-menus',
    method: 'post',
    data
  });
}

export function createMenuReq(data: any) {
  return request({
    url: '/api-user/creat-menus',
    method: 'post',
    data
  });
}

export function editMenuReq(data: any) {
  return request({
    url: '/api-user/edit-menus',
    method: 'post',
    data
  });
}

export function delMenuReq(data: any) {
  return request({
    url: '/api-user/del-menus',
    method: 'post',
    data
  });
}

export function getRoleReq(data: any) {
  return request({
    url: '/api-user/get-roles',
    method: 'post',
    data
  });
}

export function createRoleReq(data: any) {
  return request({
    url: '/api-user/create-roles',
    method: 'post',
    data
  });
}

export function editRoleReq(data: any) {
  return request({
    url: '/api-user/edit-roles',
    method: 'post',
    data
  });
}

export function delRoleReq(data: any) {
  return request({
    url: '/api-user/del-roles',
    method: 'post',
    data
  });
}

/**
 * 查询用户集合
 * @param data 条件参数
 * @param stype dept-部门查询  stype  all 所有  org 机构  trade交易员
 * */
export function getUserListReq(data: any, stype: string) {
  return request({
    url: `/api-user/get-users/${stype}`,
    method: 'post',
    data
  });
}
/**
 * 检测用户是否存在
 * @param data
 * @returns
 */
export function checkUser(data: any) {
  return request({
    url: `/api-user/check-user`,
    method: 'post',
    data
  });
}
/**
 * 获取用户机构部门字典
 * */
export function getOrgDeptReq() {
  return request({
    url: '/api-user/get-org-dept',
    method: 'post'
  });
}

/**
 * 创建用户
 * */
export function addUserReq(data: any) {
  return request({
    url: `/api-user/add-user`,
    method: 'post',
    data
  });
}

/**
 * 设置用户
 * */
export function setUserReq(data: any, stype: string) {
  return request({
    url: `/api-user/set-user/${stype}`,
    method: 'post',
    data
  });
}

/**
 * 获取用户侧边栏信息
 */
export function getUserTree(data: any) {
  return request({
    url: `/api-user/get-tree-user`,
    method: 'post',
    data
  });
}

export function getUserReq(data: any) {
  return request({
    url: '/api-user/user-list',
    method: 'post',
    data
  });
}

export function queryWupUrl() {
  return request({
    url: '/queryWupUrl',
    method: 'get'
  });
}
export function getDeptList(data: any) {
  return request({
    url: '/api-user/get-depts',
    method: 'post',
    data
  });
}
export function createDeptReq(data: any) {
  return request({
    url: '/api-user/create-dept',
    method: 'post',
    data
  });
}
export function editDeptReq(data: any) {
  return request({
    url: '/api-user/edit-dept',
    method: 'post',
    data
  });
}
export function delDeptReq(data: any) {
  return request({
    url: '/api-user/del-dept',
    method: 'post',
    data
  });
}
