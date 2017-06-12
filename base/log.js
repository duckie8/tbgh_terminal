/**
 * @Author: jifeng.lv
 * @Date:   22-02-2017
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-10
 */



const log4js = require('log4js');
const log4js_config = require('../config').log4js;

// exports.configure = function() {
// }
log4js.configure(log4js_config);


var infoLog = log4js.getLogger('info');
exports.infoLog = infoLog;

var warnLog = log4js.getLogger('warn');
exports.warnLog = warnLog;

var errLog = log4js.getLogger('error');
exports.errLog = errLog;

var debugLog = log4js.getLogger('debug');
exports.debugLog = debugLog;

exports.use = function(app) {
    app.use(log4js.connectLogger(infoLog,   {
        level: 'info',
        format: ':method :url'
    }));
};
