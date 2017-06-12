/**
 * @Author: jifeng.lv
 * @Date:   2017-04-10
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-09
 */


const iconv = require('iconv-lite');

function fillzero(rawdata, leng, type) {
  if (type === 'str') {
    let buf = iconv.encode(rawdata, 'gbk');
    for (let i = 0; i < leng - buf.length; i++) {
      rawdata = rawdata + ' ';
    }
    return rawdata;
  } else {
    for (let i = 0; i < leng - rawdata.length; i = 0) {
      rawdata = '0' + rawdata;
    }
    return rawdata;
  }
}

module.exports = fillzero;
