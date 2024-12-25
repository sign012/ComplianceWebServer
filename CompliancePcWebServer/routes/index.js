function init(app) {
    app.use('/compliance', require('./default'));

    // app.use('/mgr', require('./api'));

    app.use('*', (req, res) => {
        res.render('./index')
    });
}

exports.init = init;