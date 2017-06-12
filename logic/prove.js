/**
 * @Author: jifeng.lv
 * @Date:   2017-03-29
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-18
 */


const loger = require('../base/log');
const terminalModel = require('../model/terminalSchema');
const moment = require('moment');
const getSerial = require('../base/getSerial');
const holdTerminal = require('../base/HoldTerminal');
const getCards = require('../base/CardAcquire');
const statusModel = require('../model/statusSchema');
const getFamilyNum = require('../lib/getFamilyNum.js');

function proveTerminal(data, sock, dic) {;

  let time = moment().format('YYYYMMDDHHmmss');
  let terminalnum = parseInt(data.slice(6, 24)).toString();

  terminalModel.findOne({
      '$or': [{
        terminalnumber: terminalnum,
        module: '天波公话'
      }, {
        terminalnumber: terminalnum,
        module: '卡尔'
      }, {
        terminalnumber: terminalnum,
        module: '真灼2.4G'
      }]
    })
    .then((doc) => {
      if (!doc) {
        holdTerminal();
        loger.errLog.error(terminalnum + ':' + 'This terminalnumber does not exit!');

        //返回公话认证不通过的
        let fun_buf = data.slice(0, 6);
        let buf = Buffer.alloc(7);
        let pro_buf = Buffer.from('0');
        fun_buf.copy(buf, 0, 0, 6);
        pro_buf.copy(buf, 6, 0, 1);
        sock.send(buf);
        sock.emit('c_close');

      } else {
        loger.infoLog.info(terminalnum + ':' + 'This terminalnumber certification is successful');

        //数组中的一个元素为连接socket，第二个为学校id，第三个为是否删除全部数据状态码，第四个为机具号，第五个为平台ID，第六个为更新的卡号
        dic.set(terminalnum, [sock, doc.schoolid, 1, '2000-01-01 00:01:00', doc.platformid]);

        getFamilyNum(dic, terminalnum);
        getCards(doc.schoolid, doc.platformid);

        statusModel.update({
          deviceid: terminalnum
        }, {
          conntime: time
        }, {
          upsert: true
        });

        getSerial(terminalnum)
          //返回公话认证通过
          .then((serial) => {
            let str = '10' + serial + 1;
            sock.send(Buffer.from(str));
            return serial;
          })
          // 发起公话状态查询
          .then((serial) => {
            setTimeout(() => {
              let str = '82' + serial + time;
              sock.send(Buffer.from(str));
            }, 1000 * 2);
          })
          .catch((err) => {
            loger.errLog.error(err);
          });
      }
    });
}
module.exports = proveTerminal;
