const express = require('express');
const path = require('path');
const logger = require('./lib/logger');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const compress = require('compression');
const logDBCtl = require('./controller/log-ctl');


/* test
const cli = require('./lib/cipherCode');
const commTool = require('./lib/common');

const salt = commTool.randomString();
console.log(' cli ====> ',cli.pwdMD5('888888',salt),salt);
*/

const app = express();

const routes = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger.morgan_taf_log());
app.use(compress());
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(session({
//     secret: 'boomli',
//     name: 'leeSession',
//     cookie: {maxAge: 600000},  // 5分钟
//     resave: false,
//     saveUninitialized: true,
// }));


// console.log(' process.env.NODE_ENV ====> ', process.env);    

if (process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
	app.use(allowCrossDomain);
}


app.use(express.static(path.join(__dirname, 'public')));


global.clean_task = null;
global.wupUrl = global.CONFIG.CompliancePcWebServer.wupUrl;
global.comName = global.CONFIG.CompliancePcWebServer.comName;
global.user_cache_info = {}
//清理任务开启
logDBCtl.cleanOptLog()
logDBCtl.cleanVerifyCode()
// 本地存admin信息
// global.user_cache_info = {
//     'admin': {
//         uid: 'admin',
//         userType: 'A',
//         rIds: '',
//         departId: '',
//         orgId: '',
//         realName: '超级管理员Admin',
//         stopMoney: 0,
//         mgrType: 'S'
//     }
// }

routes.init(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {

	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development' || app.get('env') === 'local') {
	app.use((err, req, res) => {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stack traces leaked to user
app.use((err, req, res) => {
	res.status(err.status || 500);
	res.render('errorFriendly');
});

/**
 * 新增跨域响应头
 */
function allowCrossDomain(req, res, next) {
	// 所有的接口都可以访问
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	next();
}


module.exports = app;