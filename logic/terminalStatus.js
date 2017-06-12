/**
 * @Author: jifeng.lv
 * @Date:   2017-03-30
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-27
 */



const loger = require('../base/log');
const statusModel = require('../model/statusSchema');
const getSerial = require('../base/getSerial');
const moment = require('moment');

function gettermianlinfo(data, sock) {
  let Device_id = parseInt(data.slice(6, 24)).toString();
  let VersionInfo = data.slice(24, 42).toString();
  let MinitorInfo = data.slice(42, 114).toString();
  let time = moment().format('YYYY-MM-DD HH:mm:ss');
  statusModel.update({
      deviceid: Device_id
    }, {
      versioninfo: VersionInfo,
      minitorinfo: MinitorInfo,
      $inc: {
        times: 1
      }
    })
    .catch((err) => {
      loger.errLog.error(Device_id + 'The terminal certification update data failed');
    });
  //发送卡信息更新同步请求
  getSerial(Device_id)
    .then((serial) => {
      setTimeout(() => {
        let sendmsg = '75' + serial;
        sock.send(Buffer.from(sendmsg));
      }, 1000 * 5);
    })
    .catch((err) => {
      loger.errLog.error(err);
    });
}
module.exports = gettermianlinfo;
