/**
 * @Author: jifeng.lv
 * @Date:   2017-04-01
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

function signRecs(data, sock, dic) {
  let deviceid = parseInt(data.slice(6, 24)).toString();
  let val = dic.get(deviceid);
  if (val === undefined) {
    sock.emit('c_close');
  } else {
    let schoolid = val[1];
    let cardnum = data.slice(24, 34).toString();
    let starttime = data.slice(60, 74).toString();
    let Opttype = data.slice(74, 75).toString(); //08功能号，进离校状态
    getSerial(deviceid)
      .then((serial) => {
        sock.send(Buffer.from('04' + serial + '1'));

        cardModel.findOne({
            cardnumber: cardnum,
            schoolid: schoolid
          })
          .then((doc) => {
            if (doc !== null) {
              resInfo(cardnum, deviceid, starttime, val[4], schoolid, Opttype);
            }
          });
      });
  }
};

module.exports = signRecs;

function resInfo(cardNum, terminalnum, brushtime, platformid, schoolid, opttype) {
  let hour;
  if (opttype === '') {
    hour = brushtime.slice(8, 10);
  } else if (opttype === '1') {
    hour = 13;
  } else {
    hour = 1;
  }
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
              "inout": hour < 12 ? '1' : '2',
              "module": cardinfo[1].module,
              "submodule": cardinfo[1].submodule,
              "memberid": cardinfo[0].userid,
              "membername": cardinfo[0].username,
              "cardholder": cardinfo[0].cardholder === '' ? "家长" : cardinfo[0].cardholder,
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
