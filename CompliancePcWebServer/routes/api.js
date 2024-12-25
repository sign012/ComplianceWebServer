const express = require('express');
const router = express.Router();
const common = require('../lib/common');
const debug = require('debug')(`app:${common.getFileName(__filename)}`);
const ERROROBJ = require('../lib/enum-cfg');
const cipher = require('../lib/cipherCode');
const UserCtl = require('../controller/user-ctl');
const Role = require('../controller/role-ctl');
// Router ===================================================
function renderIndex(req, res) {
    res.render('./index');
}

router.get('/', renderIndex);


function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
/**
 * 检查TOKEN
 * */
async function checkUserToken(req, res, next) {
    let token = req.headers['x-token'];
    if (!token || token === '') {
        res.json({ iRet: 20001, msg: ERROROBJ['20001'], data: {} });
        return;
    }
    try {
        const tokenObj = JSON.parse(cipher.decryption(token));
        console.log('检查token')
        // if (global.user_cache_info[tokenObj.uId]) {
        //     // 从内存中将用户信息取出
        //     res.locals.userInfo = global.user_cache_info[tokenObj.uId];
        //     console.log('从内存中取出用户信息')
        //         // 判断userList是否是JSON格式
        //     let _userList = res.locals.userInfo.userList
        //     if (isJSON(_userList)) {
        //         res.locals.userInfo.userList = JSON.parse(res.locals.userInfo.userList)
        //         global.user_cache_info[tokenObj.uId] = res.locals.userInfo;
        //     }
        //     next()
        // } else {
            let { data } = await UserCtl.getUserInfo(tokenObj.uId)
                // 判断用户是否存在
            if (data.length > 0) {
                let obj = data[0]
                let userInfo = {
                    uid: obj.userbasic_uid,
                    // userType: obj.userbasic_usertype, // 从用户表取没用， 角色表中更新后，用户表内的没同步
                    rIds: obj.userbasic_rids,
                    orgId: obj.orgid,
                    realName: obj.realname,
                    stopMoney: obj.stopmoney,
                    mgrType: obj.mgrtype,
                    departId: obj.departid,
                    userList: JSON.parse(obj.userList),
                }


                res.locals.userInfo = userInfo;
                console.log('从数据库中取出用户信息，并存入缓存')
                global.user_cache_info[tokenObj.uId] = userInfo
                next();
            } else {
                res.json({ iRet: 20002, msg: ERROROBJ['20002'], data: {} });
                return;
            }
        // }
    } catch (e) {
        console.log(e);
        res.json({ iRet: 20002, msg: ERROROBJ['20002'], data: {} });
        return;
    }
}


// 码表相关

// 获取全部码表信息
// router.get('/hq/dict', hqApiCtl.getHSAStockDict)

// router.get('/hq/stock/:stock', hqApiCtl.getHSStock)

// router.post('/hq/stocks/bySymbol', hqApiCtl.getHSStocks)

// 业务相关

router.use('/login', require('./module/check-user-login')); // 检查用户登录

router.use('/api-user', checkUserToken, require('./module/user-menu-mgr')); // 用户相关 api
router.use('/api-log', checkUserToken, require('./module/log-record')); // 日志相关 api
router.use('/queryWupUrl', (req, res) => {
        res.json({
            iRet: 0,
            msg: '',
            data: {
                wupUrl: global.wupUrl || '//prx.test.upchina.com/json/live_monitor',
                comName: global.comName || '公司名称'
            }

        });
    })
    // router.get('*', renderIndex);

module.exports = router;