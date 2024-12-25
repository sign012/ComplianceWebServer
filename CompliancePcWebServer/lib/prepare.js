const config = require('./config');

function all() {
    return config.loadConfig('CompliancePcWebServer.conf', 'c');
}

// 属性缓存
process.on('message', (data) => {
    console.error('nofity', data);
    if (data.cmd === 'load') {
        //
    }
});

module.exports = {
    all
};