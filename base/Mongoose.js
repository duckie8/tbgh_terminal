/**
 * @Author: jifeng.lv
 * @Date:   2016-11-29
 * @Email:  871593867@qq.com
 * @Last modified by:   jifeng.lv
 * @Last modified time: 2017-03-31
 */



const mongoose = require('mongoose');
const mongoConfig = require('../config.js').mongoDBconfig;
const logger = require('./log.js');
const bluebird = require('bluebird');

var options = {
    user: mongoConfig.username,
    pass: mongoConfig.pwd,
    promiseLibrary: bluebird
};
mongoose.Promise = require('bluebird');
mongoose.connect(mongoConfig.url, options, (err, db) => {
    if (err) {
        logger.errLog.error('MongoDB Connection failed');
    } else {
        logger.infoLog.info('MongoDB Connection successful');
    }
});
module.exports = mongoose;
