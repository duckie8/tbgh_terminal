/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-04-13
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-04
 */


const updateCard = require('./compareCard');
const getSerial = require('../base/getSerial');
const sendCard = require('./updateCardFun');

function mapLoop(dic) {
  if (dic.size === 0) {
    return;
  } else {
    dic.forEach((val, key) => {
      if (val[2] === 1) {
        updateCard(val[1], val[3], val[4])
          .then(sendCard(val[3], val, val[1]));
      } else {
        let sock = val[0];
        sock.send(Buffer.from(77 + '0000' + 0));
        sock.send(Buffer.from(77 + '0000' + 1));
        sock.send(Buffer.from(77 + '0000' + 2));
        sock.end();
        sock.destroy();
        dic.delete(key);
      }
    });
  }
}

module.exports = mapLoop;
