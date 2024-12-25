/* 资产相关接口 */

import request from '@/utils/axiosReq';

/**
 * 券商资产分配列表查询 支持分页
 * @param data {'accountid': ['IN', ['sss', 'sss']],'pageSize': 100,'pageIndex': 1}
 * @returns
 */
export function getAssetPackageList(data: any) {
  return request({
    url: `/api-asset-mgr/get-assetpackage-list`,
    method: 'post',
    data
  });
}

/**
 * 创建资产包
 * @param data {accountid: '',name: '',type: '',trademode: '',dutyid:'',rate: 0,saletype: ''}
 * */
export function addAssetPackage(data: any) {
  return request({
    url: `/api-asset-mgr/add-assetpackage`,
    method: 'post',
    data
  });
}

/**
 * 创建股票分配，所有的股票分配均用该接口
 * 请注意请求的结构体
 * @param data {stockChanges: [{symbol:'',accountId:'',assetId:'',userId:'',incrementStock:0,incrementReserve:0}]}
 * */
export function addDistStock(data: any) {
  return request({
    url: `/api-asset-mgr/add-dist-stock`,
    method: 'post',
    data
  });
}

/**
 * 查询券商资产包下员工已分配股票和预约券总和
 * @param data{accountid,assetid}
 * */
export function getAssetUserStockNum(data: any) {
  return request({
    url: `/api-asset-mgr/get-user-stocknum`,
    method: 'post',
    data
  });
}

/**
 * 设置资产包
 * @param data {accountid: '',name: '',type: '',trademode: '',dutyid:'',rate: 0,saletype: ''}
 * @param stype update  del
 * */
export function setAssetPackage(data: any, stype: string) {
  return request({
    url: `/api-asset-mgr/set-assetpackage/${stype}`,
    method: 'post',
    data
  });
}

/**
 * 设置资产包交易负责人
 * @param data {assetid:'',responsiblelist:[{userbasic_uid:''}]}
 */
export function setAssetUser(data: any) {
  return request({
    url: `/api-asset-mgr/set-asset-user`,
    method: 'post',
    data
  });
}

/**
 * 获取券商账号
 * @param data {name: {$like: "%%"} trademarket: {$like: "%%"}}
 * @param type all | tree
 * @returns
 */
export function getAssetAccount(data: any, type: string) {
  return request({
    url: `/api-asset-mgr/get-account/${type}`,
    method: 'post',
    data
  });
}

/**
 * 设置券商账号
 * @param data
 * @param type add edit del editCount
 * @returns
 */
export function setAssetAccount(data: any, type: string) {
  return request({
    url: `/api-asset-mgr/set-account/${type}`,
    method: 'post',
    data
  });
}

/**
 * 查询券商账户资产（母账号券池）不分页
 * */
export function getAccountStockList(data: any) {
  return request({
    url: `/api-asset-mgr/get-accountstock-list`,
    method: 'post',
    data
  });
}

/**
 * 设置资金账号关联股票   add update del
 * @param data 参数 {accountid:'',symbol:'',marketid:'', ....}
 * */
export function setAccountStock(data: any, stype: string) {
  return request({
    url: `/api-asset-mgr/set-accountstock/${stype}`,
    method: 'post',
    data
  });
}

/**
 * 账户分配第2步接口,返回账户的股票池关联
 * 员工分配接口,返回账户的股票池关联
 * @param data {accountid:'',assetid:''}  如果是员工分配，需要增加属性 userid:''
 * */
export function getAccountStockPoolList(data: any) {
  return request({
    url: `/api-asset-mgr/get-accountstockpoolbyasset`,
    method: 'post',
    data
  });
}

/**
 * 员工资源分配列表查询
 * */
export function getUserAssetList(data: any) {
  return request({
    url: `/api-asset-mgr/get-userassetlist`,
    method: 'post',
    data
  });
}

/**
 * 批量更新券息
 * @param data
 * @param type account 资金账号-股票券息   {symbolList:[],...}
 * */
export function batchCouponRate(data: any, type: string) {
  return request({
    url: `/api-asset-mgr/batch-set-couponrate/${type}`,
    method: 'post',
    data
  });
}

/**
 * 员工资产包分配
 * @param data {assetid:'',userid:'', ... }
 * @param type set  del
 * */
export function setAssetUserId(data: any, type: string) {
  return request({
    url: `/api-asset-mgr/set-asset-userid/${type}`,
    method: 'post',
    data
  });
}

export function setAssetUserIds(data: any) {
  return request({
    url: `/api-asset-mgr/set-asset-userid-link`,
    method: 'post',
    data
  });
}

/**
 * 查询股票
 * @param data userid 用户id
 * @returns
 */
export function getUserStock(data: any) {
  return request({
    url: `/api-asset-mgr/get-user-stock`,
    method: 'post',
    data
  });
}
/**
 * 设置员工持仓信息
 *
 * @param data userid accountid assetid
 * @returns
 */
export function setUserStock(data: any) {
  return request({
    url: `/api-asset-mgr/set-user-stock`,
    method: 'post',
    data
  });
}
/**
 * 批量清理员工持仓
 * @param data 持仓信息数组
 * @returns
 */
export function clearUserStock(data: any) {
  return request({
    url: `/api-asset-mgr/clear-user-stocks`,
    method: 'post',
    data
  });
}
/**
 * 查询账户下的股票
 * @param data accountid
 * @returns
 */
export function getAccountStock(data: any) {
  return request({
    url: `/api-asset-mgr/get-account-stock`,
    method: 'post',
    data
  });
}

/**
 * 查询账户下的股票
 * @param data accountid assetid
 * @returns
 */
export function getAssetStock(data: any) {
  return request({
    url: `/api-asset-mgr/get-asset-stock`,
    method: 'post',
    data
  });
}

/**
 * 查询资产包员工下的股票
 * @param data userid accountid assetid
 * @returns
 */
export function getAssetUserStock(data: any) {
  return request({
    url: `/api-asset-mgr/get-asset-user-stock`,
    method: 'post',
    data
  });
}
/**
 * 获取员工锁券列表
 * @param data assetid userid
 * @returns
 */
export function getAuditStock(data: any) {
  return request({
    url: '/api-asset-mgr/get-audit-stock',
    method: 'post',
    data
  });
}
export function getAuditNum(data: any) {
  return request({
    url: '/api-asset-mgr/get-audit-num',
    method: 'post',
    data
  });
}

/**
 * 获取员工锁券列表
 * @param data assetid userid
 * @returns
 */
export function setAuditStock(data: any) {
  return request({
    url: '/api-asset-mgr/set-audit-stock',
    method: 'post',
    data
  });
}
/**
 * 获取资产包列表
 * @param data
 * @returns
 */
export function getAssetBase(data: any) {
  return request({
    url: '/api-asset-mgr/get-assetbase-list',
    method: 'post',
    data
  });
}

export function getAssetsForPage(data: any) {
  return request({
    url: '/api-asset-mgr/get-user-asset',
    method: 'post',
    data
  });
}

export function getAssetsByOther(data: any) {
  return request({
    url: '/api-asset-mgr/get-assetbase-by-other',
    method: 'post',
    data
  });
}

// 清理碎股
export function cleanPosHold(data:any){
  return request({
    url:'/api-asset-mgr/clean-poshold',
    method:'post',
    data
  })
}



// 员工资源分配 更改
export function userStocks(data:any,type:string){
  return request({
    url:`/api-asset-mgr/user-stock/${type}`,
    method:'post',
    data
  })
}


// 券商账号原始资源数量编辑
export function editAccountStock(data:any){
  return request({
    url:`/api-asset-mgr/set-account-stock`,
    method:'post',
    data
  })
}

export function getAccountByAssetId(data:any){
  return request({
    url:`/api-asset-mgr/get-acccount-byAssetId`,
    method:'post',
    data
  })
}

export function recycleStock(data:any){
  return request({
    url:`/api-asset-mgr/recycle-stocks`,
    method:'post',
    data
  })
}

export function getStocksInfo(data:any){
  return request({
    url:`/hq/stocks/bySymbol`,
    method:'post',
    data
  })
}
/**
 * 券商账号同步接口
 * @param data 
 * @returns 
 */
export function getAccountInfo(data:any){
  return request({
    url:`/api-asset-mgr/get-account-info`,
    method:'post',
    data
  })
}
