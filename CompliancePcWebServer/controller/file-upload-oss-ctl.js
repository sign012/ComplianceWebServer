/**
 * 相关的接口服务 （代理类集合）
 * */

const TafStream = require('@taf/taf-stream');
const Taf = require('@taf/taf-rpc').client;
const logger = require('../lib/logger');

const fileProxy = require('../lib/strategy/FileProxy').COMM;
const fileSJce = require('../lib/strategy/FileJce').COMM;
let fileServerProxy;

const fileOssServerCtl = {};

fileOssServerCtl.initServer = () => {
    if (!fileServerProxy) {
        fileServerProxy = Taf.stringToProxy(fileProxy.FileProxy, global.CONFIG.CompliancePcWebServer.proxy.FileUploadServer);
        fileServerProxy.setTimeout(30000); //设置超时30秒
    }
};

// 更新文件上传服务
fileOssServerCtl.uploadFile = params => {
    return new Promise((resolve, reject) => {
        let sReq = new fileSJce.UploadFileReq();
        sReq.readFromObject({
            vContent: params.file,
            sOrgFileName: params.fileName,
            sBusId: 'compliance',
            sBucket: 'upcdnfiles',
            sPath: 'dc/compliance',
            iRename: 1,
        });
        console.log(sReq)
        fileServerProxy.uploadFile(sReq).then(retData => {
            resolve({
                iRet: retData.response.return,
                data: retData.response.arguments.rsp.toObject(),
            });
        }, err => {
            logger.fileFTPLog.info(' uploadFile ERROR ==> ', err);
            resolve({
                iRet: -10003,
                data: {},
                message: '服务超时'
            });
        }).catch(e => {
            logger.fileFTPLog.info(' uploadFile CATCH ==> ', e);
            resolve({
                iRet: -10004,
                data: {},
                message: '服务异常'
            });
        });

    });
};

// fileOssServerCtl
fileOssServerCtl.fileServerFun = (funcName, sReq) => {
    return new Promise((resolve, reject) => {

        fileServerProxy[funcName](sReq).then(retData => {

            if (retData.response.return !== 0) {
                logger.fileFTPLog.info(' fileServerFun code ==> ', funcName, sReq, retData.response.return);
            }

            resolve({
                iRet: retData.response.return,
                data: retData.response.arguments.rsp.toObject(),
            });
        }, err => {
            logger.fileFTPLog.info(' fileServerFun ERROR ==> ', funcName, err, sReq);
            resolve({
                iRet: -10003,
                data: {},
                message: '服务超时'
            });
        }).catch(e => {
            logger.fileFTPLog.info(' fileServerFun CATCH ==> ', funcName, e, sReq);
            resolve({
                iRet: -10004,
                data: {},
                message: '服务异常'
            });
        });

    });

};


module.exports = fileOssServerCtl;