/**
 * @Author: jifeng.lv
 * @Date:   2017-04-06
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-18
 */



const Promise = require('bluebird');
const terminalStatus = require('../model/statusSchema');
const loger = require('./log');

function getSerial(terminalnum) {
  return new Promise(function(resolve, reject) {
    terminalStatus.findOneAndUpdate({
        deviceid: terminalnum
      }, {
        $inc: {
          serial: 1
        }
      }, {
        upsert: true
      })
      .then((doc) => {
        if (!doc) {
          resolve('0000');
        } else if (doc.serial > 9999) {
          let serial = '9999';
          resolve(serial);
          terminalStatus.update({
            deviceid: terminalnum
          }, {
            serial: 0
          }, (err, doc) => {
            loger.debugLog.debug(doc);
          });
        } else {
          let serial = doc.serial.toString();
          for (let i = 0; i < 4 - serial.length; i = 0) {
            serial = '0' + serial;
          }
          resolve(serial);
        }
      });
  });
}
module.exports = getSerial;
