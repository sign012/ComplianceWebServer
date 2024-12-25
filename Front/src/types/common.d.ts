/*类型命名建议以Ty结尾*/
/*
*
枚举 类，接口 都是大驼峰 WangMeng
方法，变量，常量 小驼峰 wangMeng
* */

/*通用对象*/
interface ObjTy {
    [propName: string]: any
}

/*axiosReq请求配置*/
import {AxiosRequestConfig} from 'axios'

interface AxiosReqTy extends AxiosRequestConfig {
    url?: string
    method?: string
    data?: ObjTy
    isParams?: boolean
    bfLoading?: boolean
    afHLoading?: boolean
    isUploadFile?: boolean
    isDownLoadFile?: boolean
    isAlertErrorMsg?: boolean
    baseURL?: string
    timeout?: number
}

interface AxiosConfigTy {
    url?: string
    method?: string
    data?: ObjTy
    isParams?: boolean
    bfLoading?: boolean
    afHLoading?: boolean
    isUploadFile?: boolean
    isDownLoadFile?: boolean
    isAlertErrorMsg?: boolean
    baseURL?: string
    timeout?: number
}

/* 管理用户 */
interface MgrUserTy {
    uid: string
    password?: string
    secondPwd?: string
    userType: string
    rIds?: string
    departId?: string
    orgId?: string
    realName: string
    stopMoney?: number | string
    mgrType: string
    phone?: string

}

/** 资金账户 **/
interface MgrAccountTy {
    id: string,
    name: string,
    password: string,
    secondPwd: string,
    state: string,
    created: string,
}

/** 柜台节点 **/
interface CounterNodeTy {
    nodeid: string,
    nodename: string,
    ctype: string,
    masterep?: string,
    slaveep?: string,
    masterparam?: ObjTy,
    slaveparam?: ObjTy,
    extraparams?: string
}

/** 机构 **/
interface OrgTy {
    orgid: string,
    name: string,
    extraparams?: string
}
