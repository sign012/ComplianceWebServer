/*
 * Taf config 读取
 */

'use strict';

const Q = require('q');
const ConfigParser = require('@taf/taf-utils').Config;

const dbCtl = require('../lib/dbctl/db-ctl');

const config = {};

function parseConf(content, configFormat) {
    let ret = content;
    if (configFormat === 'c') {
        const configParser = new ConfigParser();
        configParser.parseText(content, 'utf8');
        ret = configParser.data;
    } else if (configFormat === 'json') {
        ret = JSON.parse(content);
    }
    return ret;
}

config.loadConfig = function loadConfig(filename, configFormat) {
    const dfd = Q.defer();
    global.cacheData = {}
    if (process.env.TAF_CONFIG) {
        const tafConfigHelper = require('@taf/taf-config');
        const helper = new tafConfigHelper();
        helper.loadConfig(filename, configFormat).then((data) => {
            data = parseConf(data, configFormat);
            global.CONFIG = data;
            dfd.resolve(data);
            
            dbCtl.initConnectDB();

        }, (err) => {
            dfd.reject(`loadConfig file error${err.toString()}`);
        });
    } else {
        const fs = require('fs');
        fs.readFile(filename, {encoding: 'utf-8'}, (err, data) => {
            if (err) {
                dfd.reject(err);
            } else {
                data = parseConf(data, configFormat);
                global.CONFIG = data;
                dfd.resolve(data);

                dbCtl.initConnectDB();
            }
        });
    }
    return dfd.promise;
};


module.exports = config;
