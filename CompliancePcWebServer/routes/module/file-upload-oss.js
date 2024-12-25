const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const fileCtl = require('../../controller/file-upload-oss-ctl')
const logger = require('../../lib/logger');
const crypto = require('crypto');
const { log } = require('console');
const router = express.Router()


/****** 文件上传基础文件夹 ******/

let multerPath = '';
let storage;
const tplTypeList = ['.zip', '.py', '.gz', '.bz2', '.tar', '.tgz'];

function mkdir() {
    let dirList = __dirname.split('/');
    if (dirList.length == 1) {
        //同时适配window和linux
        dirList = __dirname.split('\\');
    }
    multerPath = `/${dirList[1]}/${dirList[2]}/${dirList[3]}/HtTempTplFile`;

    console.log('==>', multerPath);

    fs.access(multerPath, exists => {
        console.log(' multerPath ====> ', multerPath, ' exists ===>', exists);
        if (exists && exists.code === 'ENOENT') {
            console.log(' 创建文件夹 ====> ', multerPath);
            fs.mkdirSync(multerPath, '0755');
        }
        storage = multer({
            dest: multerPath
        }).fields([
            { name: 'tplfile', maxCount: 1 },
        ]);

    });
}

mkdir();

router.post('/upload', async(req, res, next) => {
    storage(req, res, function(err) {
        if (err) {
            logger.fileFTPLog.info('[System] ' + err.message);
            res.send({
                iRet: -10011,
                data: {},
                message: '文件读取错误',
            });
        } else {
            //循环处理
            req.files['tplfile'].forEach(item => {

                let exName = item.originalname.substring(item.originalname.lastIndexOf('.')),
                    originalname = item.originalname,
                    valid = true,
                    uploadTmpPath = item.path;
                // if (tplTypeList.indexOf(exName.toLowerCase()) < 0) {
                //     res.send({
                //         iRet: -10021,
                //         data: '',
                //         message: `文件类型错误，系统模版仅支持${tplTypeList.join('、')}格式文件`,
                //     });
                //     valid = false;
                // } else 
                if (item.size > (+global.CONFIG.CompliancePcWebServer.OtherCfg.maxUpdateFileSize) * 100) {
                    res.send({
                        iRet: -10022,
                        data: '',
                        message: `上传文件最大支持${global.CONFIG.CompliancePcWebServer.OtherCfg.maxUpdateFileSize}K`,
                    });
                    valid = false;
                }

                if (valid) {
                    //读取临时文件
                    fs.readFile(uploadTmpPath, (err, data) => {
                        if (err) {
                            logger.fileFTPLog.info('[System] ' + err.message);
                        } else {
                            // 处理文件
                            let md5Str = crypto.createHash("md5");
                            md5Str.update(data);
                            let md5Val = md5Str.digest('hex');
                            let fileName = `${md5Val}${exName}`;
                            // logger.fileFTPLog.info(' 文件MD5 ==> ', md5Val, item.originalname, item.originalname.substring(item.originalname.lastIndexOf('.')));
                            fileCtl.initServer();
                            fileCtl.uploadFile({
                                file: data,
                                fileName: fileName,
                                // fileName: originalname
                            }).then(retData => {
                                if (retData.iRet === 0) {
                                    retData.data.filePathMD5 = md5Val
                                    retData.data.filePath = global.CONFIG.CompliancePcWebServer.OtherCfg.downLoadFileUrl + retData.data.sObjPath
                                }
                                res.send(retData);
                            });

                            fs.unlink(uploadTmpPath, err => {
                                if (err) {
                                    logger.fileFTPLog.info('[System] ' + err.message);
                                } else {
                                    logger.fileFTPLog.info('[System] ' + 'Delete ' + uploadTmpPath + ' successfully!');
                                }
                            });
                        }
                    });
                } else {
                    fs.unlink(uploadTmpPath, err => {
                        if (err) {
                            logger.fileFTPLog.info('[System] ' + err.message);
                        } else {
                            logger.fileFTPLog.info('[System] ' + 'Delete ' + uploadTmpPath + ' successfully!');
                        }
                    });
                }
            });
        }
    });
})

module.exports = router