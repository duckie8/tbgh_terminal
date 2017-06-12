/**
 * @Author: jifeng.lv
 * @Date:   2017-03-31
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-27
 */


const getSerial = require('../base/getSerial');
const statusModel = require('../model/statusSchema');
const moment = require('moment');

function connecteStatus(data, sock, dic) {

  let terminal = '';
  dic.forEach((value, key) => {
    if (value[0] === sock) {
      terminal = key;
    }
  });

  //网络连接（心跳包）检测
  if (terminal) {

    let time = moment().format('YYYY-MM-DD HH:mm:ss');
    statusModel.update({
      deviceid: terminal
    }, {
      conntime: time
    });

    getSerial(terminal)
      .then((serial) => {
        Buffer.from(serial).copy(data, 2, 0, 4);
        sock.send(data);
      });
  } else {
    sock.end();
    sock.destroy();
  }
}

module.exports = connecteStatus;
