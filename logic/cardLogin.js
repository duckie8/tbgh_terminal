/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-05-11
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-22
 */


const cardModel = require('../model/cardSchema');
const _ = require('lodash');
const fillzero = require('../base/fillzero');
const moment = require('moment');
const iconv = require('iconv-lite');
const loger = require('../base/log');
const getSerial = require('../base/getSerial');

function cardlogin(data, sock, dic) {
  data = data.toString();
  let deviceid = parseInt(data.substr(21, 18)).toString();
  let cardnum = data.substr(39, 10);
  // let studentid=data.substr(57,18);
  let requesttime = data.substr(75, 14);

  let dicval = dic.get(deviceid);
  if (dicval === undefined) {
    sock.emit('c_close');
  } else {
    let time = moment().format('YYYYMMDDHHmmss');
    cardModel.findOne({
        cardnumber: cardnum,
        schoolid: dicval[1]
      })
      .populate({
        path: 'userid',
        select: '_id Memberid MemberName Phone Updated'
      })
      .then((doc) => {
        if (doc) {
          let Opttype;
          let calltime;
          if (doc.usertype === '教师') {
            Opttype = '2';
            calltime = '9999';
          } else {
            Opttype = '1';
            calltime = '60';
          };
          let MemberNames = doc.userid.MemberName;
          let Phones = doc.userid.Phone;
          let relation = arr2str(MemberNames, 4, true);
          let msisdn = arr2str(Phones, 15);

          let str = Opttype + fillzero(Phones.length.toString(), 2) + msisdn + relation + '0000' + time + fillzero(calltime, 4);
          getSerial(deviceid)
            .then((serial) => {
              str = '01' + serial + str;
              sock.send(iconv.encode(str, 'gbk'));
            });
        } else {
          getSerial()
            .then((serial) => {
              let str = '01' + serial + '0';
              sock.send(Buffer.from(str));
            });
        }
      })
      .catch((err) => {
        loger.errLog.error('Query family number failed');
      });

  }
}

module.exports = cardlogin;

const arr2str = (arr, len, name) => {
  let str = '';
  if (name) {
    _.forEach(arr, (data) => {
      str = str + fillzero(data.substr(0, 2), len, 'str');
    });
    return str;
  } else {
    _.forEach(arr, (data) => {
      str = str + fillzero(data, len, 'str');
    });
    return str;
  }
};
