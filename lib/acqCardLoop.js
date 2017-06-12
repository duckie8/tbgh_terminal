/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-04-28
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-22
 */


const acqCard = require('../base/CardAcquire');

function mapLoop(dic) {
  if (dic.size === 0) {
    return;
  } else {
    dic.forEach((val, key) => {
      if (val[2] === 1) {
        acqCard(val[1], val[4]);
      }
    });
  }
}

module.exports = mapLoop;
