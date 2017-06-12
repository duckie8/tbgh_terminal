/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-05-10
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-22
 */


const cardModel = require('../model/cardSchema');
const terminalModel = require('../model/terminalSchema');
const request = require('request');
const getToken = require('../base/AcquireToken');
const Promise = require('bluebird');
const loger = require('../base/log');
const reportModel = require('../model/reportSchema');
const getSerial = require('../base/getSerial');
const moment = require('moment');
const photo = require('../config').photo;
const fillzero = require('../base/fillzero.js');

function batchreport(data, sock, dic) {
  let requestdata = data.toString();
  let deviceid = parseInt(requestdata.substr(6, 18)).toString();
  let record_num = parseInt(requestdata.substr(24, 2));

  let dicval = dic.get(deviceid);
  if (dicval === undefined) {
    sock.emit('c_close');
  } else {
    let schoolid = dicval[1];
    let cardnum, Opttype, brushtime;

    getSerial(deviceid)
      .then((serial) => {
        sock.send(Buffer.from('18' + serial + '1'));
        for (let i = 0; i < record_num; i++) {
          cardnum = requestdata.substr(51 * i + 26, 10);
          //let personnumber = requestdata.substr(51 * i + 44, 18);
          brushtime = requestdata.substr(51 * i + 62, 14);
          Opttype = requestdata.substr(51 * i + 76, 1);
          cardModel.findOne({
              cardnumber: cardnum,
              schoolid: schoolid
            })
            .then((doc) => {
              if (doc !== null) {
                resInfo(cardnum, deviceid, brushtime, dicval[4], schoolid, Opttype);
              }
            });
        }
      });
  }
}

module.exports = batchreport;

function resInfo(cardNum, terminalnum, brushtime, platformid, schoolid, opttype) {
  getToken()
    .then((token) => {
      Promise.all([seacherCard(cardNum, schoolid), searchTerminal(terminalnum, platformid, schoolid)])
        .then((cardinfo) => {
          let options = {
            uri: "http://apps.mmc06.com/v2/Terminal/putCok",
            method: "post",
            headers: {
              "Content-Type": "application/json",
              "Token": token
            },
            body: {
              "terminalnumber": cardinfo[1].terminalnumber,
              "cardnumber": cardNum,
              "brushtime": moment(brushtime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss'),
              "inout": opttype === '0' ? 1 : 2,
              "module": cardinfo[1].module,
              "submodule": cardinfo[1].submodule,
              "memberid": cardinfo[0].userid,
              "membername": cardinfo[0].username,
              "cardholder": cardinfo[0].cardholder === '' || cardinfo[0].cardholder === null ? "家长" : cardinfo[0].cardholder,
              "Photo": photo,
              "classid": cardinfo[0].classid,
              "classname": cardinfo[0].classname === '' ? cardinfo[1].schoolname : cardinfo[0].classname,
              "schoolid": cardinfo[0].schoolid,
              "schoolname": cardinfo[1].schoolname,
              "platformid": cardinfo[1].platformid
            },
            json: true
          };
          request(options, function(err, res, body) {
            if (err) {
              logger.errlog.error(`Attendance failed`);
            } else {
              var reportEntity = {
                cardnumber: cardNum,
                schoolid: cardinfo[0].schoolid,
                schoolname: cardinfo[1].schoolname,
                userid: cardinfo[0].userid,
                username: cardinfo[0].username,
                cardholder: cardinfo[0].cardholder === null ? "家长" : cardinfo[0].cardholder,
                msg: body
              };
              reportModel.create(reportEntity, (err, doc) => {
                if (err) {
                  logger.errlog.error(`Attendance data reported return data failed to save`);
                }
              });
            }
          });
        });
    });
}

function seacherCard(cardNum, schoolid) {
  return new Promise((resolve, reject) => {
    cardModel.findOne({
      cardnumber: cardNum,
      schoolid: schoolid
    }, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
}

function searchTerminal(terminalnum, platformid, schoolid) {
  return new Promise((resolve, reject) => {
    terminalModel.findOne({
      terminalnumber: terminalnum,
      platformid: platformid,
      schoolid: schoolid
    }, (err, ter) => {
      if (err) {
        reject(err);
      } else {
        resolve(ter);
      }
    });
  });
}
