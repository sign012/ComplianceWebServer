/**
 * 管理用户 + 菜单栏目管理接口
 * */

const express = require('express');
const UserCtl = require('../../controller/user-ctl');
const svgCaptcha = require("svg-captcha");
const dbCtl = require('../../lib/dbctl/db-ctl');
// const dcacheHelperCtl = require('../../lib/dcache-helper');
// dcacheHelperCtl.initDCache();
const router = express.Router();

// 检查用户登录
router.post('/check/:id', async(req, res, next) => {

    let params = {
        uid: req.body.username || '',
        pwd: req.body.password || '',
        remark: req.body.remark || '',
        yzm: req.body.yzm || '',
        isdel: '0'
    };
    let id = req.params['id']
        // 判定是否是开发环境，主要用于验证码校验
    if (global.CONFIG.CompliancePcWebServer.BasicCfg.isDev === 'no') {
        dbCtl.selectNoSQL('DTDB', { id }, 't_mgr_verify_code').then(async ret => {
            let sessionCaptcha = '';
            if (ret.iRet == 0) {
                sessionCaptcha = ret.data[0].value
            }
            if (params.yzm !== sessionCaptcha) {
                res.json({ iRet: -1019, msg: '验证码错误' });
                return;
            }
            let resUserData = await UserCtl.checkUserLogin(params.uid, params.pwd, params.remark);

            res.json(resUserData);
        }).catch(e => {
            res.json({ iRet: -10003, msg: '验证码已过期，请刷新后重试' });
            return
        })
    } else if (params.uid === 'admin') {
        res.json({
            "iRet": 0,
            "msg": "成功",
            "token": "FTkr9CQcNi86al/Em+buxrQe4yf95u39/Nc+TcTaPE+Sdl69ZFd7prbpQnJSR2yHyfP1AIybN8754cW/cNeo3rRsDRYaznyuvAtx7yERi/4dhQLb01A8L1AGRS6worGq",
            "data": {
                "uid": "admin",
                "userType": "A",
                "rIds": "",
                "departId": "",
                "orgId": "",
                "realName": "超级管理员Admin",
                "stopMoney": 0,
                "mgrType": "S"
            }
        });
    } else {
        res.json({
            iRet: -1,
            msg: '用户名或密码错误',

            data: {}
        })
    }
});
// 获取验证码
router.get('/verify', async(req, res, next) => {
    const captcha = svgCaptcha.createMathExpr({
        size: 4, // 验证码长度
        width: 100,
        height: 38,
        fontSize: 40,
        // width: 54,
        // height: 24,
        // fontSize: 20,
        ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
        noise: 3, // 干扰线条的数量
        color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: '#cc9a65' // 验证码图片背景颜色
    });
    let { id } = req.query
    await dbCtl.selectNoSQL('DTDB', { id }, 't_mgr_verify_code').then(ret => {
            if (ret.data.length > 0) {
                return dbCtl.execNoSQLForUpdate('DTDB', { value: captcha.text }, { id }, 't_mgr_verify_code')
            } else {
                return dbCtl.execNoSQLRetValue('DTDB', { id, value: captcha.text }, ['id'], 't_mgr_verify_code')
            }
        }).then(ret => {
            if (ret.iRet == 0) {
                res.type('svg');
                res.send(captcha.data);
            } else {
                res.json({
                    iRet: -10003,
                    msg: '生成验证码失败'
                })
            }
        }).catch(e => {

        })
        // console.log('captcha.text ====> ', captcha.text);
        // req.session.captcha = captcha.text;

    // console.log(' req.session.captcha ====> ', req.query, req.session.id, req.session.captcha);

    // res.type('svg');
    // res.json({data: captcha.data, text: req.session.captcha});
    // res.send(captcha.data);

});

/**
 * 退出登录
 */
router.post('/logout', (req, res, next) => {
    res.json({
        iRet: 0,
    });
});

module.exports = router;