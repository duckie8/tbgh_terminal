/**
 * @Author: jifeng.lv
 * @Date:   2017-05-16
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-18
 */


const Promise = require('bluebird');
const getToken = require('../base/AcquireToken');
const request = require('request');
const _ = require('lodash');
const loger = require('../base/log');
const familynumModel = require('../model/familynumSchema');

function getFamilyNum(dic, terminalnum) {
  getToken()
    .then((token) => {
      if (terminalnum) {
        let val = dic.get(terminalnum);
        saveFamilyNum(val, token);
      } else {
        dic.forEach((value) => {
          saveFamilyNum(value, token);
        });
      }
    });
}

module.exports = getFamilyNum;

function saveFamilyNum(value, token) {
  let body = {
    "platformid": value[4],
    "schoolid": value[1],
    "version": value[3]
  };
  let options = {
    uri: 'https://apps.mmc06.com/cok/v1/TelePhone/Query',
    method: 'post',
    headers: {
      "Content-Type": "application/json",
      "Token": token
    },
    body: body,
    json: true
  };
  request(options, function(err, res, body) {
    if (err) {
      loger.errLog.console.error('Request to get the affair number wrong');
    } else if (body.r instanceof Array && body.r.length > 0) {
      let Items = body.r;
      let precPromise = Promise.resolve();
      _.forEach(Items, (item) => {
        precPromise = precPromise.then(() => {
          return fn(item, value);
        });
      });
    }
  });
}

const fn = (data, value) => {
  return new Promise(function(resolve, reject) {
    value[3] = value[3] > data.Updated ? value[3] : data.Updated;
    familynumModel.update({
        _id: data.Memberid
      }, {
        Memberid: data.Memberid,
        $addToSet: {
          Phone: data.Phone,
          MemberName: data.MemberName,
        },
        Updated: data.Updated
      }, {
        upsert: true
      })
      .then((doc) => {
        resolve(doc);
      })
      .catch((err) => {
        reject(err);
        loger.errLog.console.error('Update affair number wrong');
      });
  });
};
