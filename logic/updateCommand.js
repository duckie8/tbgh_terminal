/**
 * @Author: jifeng.lv
 * @Date:   2017-03-31
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-08
 */



const terminalModel = require('../model/terminalSchema');
const statusModel = require('../model/statusSchema');
const loger = require('../base/log');
const iconv = require('iconv-lite');
const updateCard = require('../lib/updateCardFun');

function updateCommand(data, sock, dic) {

  let deviceid = '';
  let valid = '0';
  //判断该连接是否有效存储与内存中
  dic.forEach((value, key) => {
    if (value[0] === sock) {
      valid = '1';
      deviceid = key;
    }
  });

  let smapval = dic.get(deviceid);
  let status = data.slice(6, 7).toString();
  if (valid === '1' && status === '1') {
    updateCard(deviceid, smapval, smapval[1]);
  } else if (valid === '1' && status === '0') {
    //发送卡信息更新同步请求
    getSerial(deviceid)
      .then((serial) => {
        setTimeout(() => {
          let sendmsg = '75' + serial;
          sock.send(Buffer.from(sendmsg));
        }, 1000 * 60 * 2);
      })
      .catch((err) => {
        loger.errLog.error(err);
      });
  } else {
    sock.emit("c_close");
  }
}

module.exports = updateCommand;
