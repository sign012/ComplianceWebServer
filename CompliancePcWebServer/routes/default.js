const express = require('express');

const router = express.Router();
const common = require('../lib/common');
const debug = require('debug')(`app:${common.getFileName(__filename)}`);

// Router ===================================================
function renderIndex(req, res) {
    res.render('./index');
}
router.get('/', renderIndex);

router.use('/mgr', require('./api'));
router.use('/api-file', global.CONFIG.CompliancePcWebServer.OtherCfg.isProduction === 'false' ? require('./module/file-upload') : require('./module/file-upload-oss')) // 文件上传

// router.get('*', renderIndex);

module.exports = router;