/**
 * @Author: jifeng.lv
 * @Date:   2017-04-10
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-08
 */



const statusModel = require('../model/statusSchema');
const loger = require('../base/log');
const updateCard = require('../lib/updateCardFun');
const getSerial = require('../base/getSerial');
const cardModel = require('../model/cardSchema');
const Promise = require('bluebird');
const _ = require('lodash');
// const async = require('async');

function updateCV(data, sock, dic) {

  let valid = '';
  let deviceid = '';
  dic.forEach((value, key) => {
    if (value[0] === sock) {
      valid = '1';
      deviceid = key;
    }
  });
  let smapVal = dic.get(deviceid);
  let socket = smapVal[0];
  let status = data.slice(6, 7).toString();
  if (valid === '1' && status === '1') {
    let cards = smapVal[5];

    update(cards, deviceid, smapVal);

  } else if (valid === '1' && status === '0') {
    updateCard(deviceid, smapVal, smapVal[1]);
  } else {
    sock.emit('c_close');
  }
}
module.exports = updateCV;

function fn(card, schoolid) {
  return new Promise(function(resolve, reject) {
    cardModel.update({
      cardnumber: card,
      schoolid: schoolid
    }, {
      isupdated: '1'
    }, (err, doc) => {
      resolve(doc);
    });
  });
};

function updateCardStatus(cardsinfo, schoolid) {
  return new Promise(function(resolve, reject) {
    let prevPromise = Promise.resolve();
    _.forEach(cardsinfo, (item, key) => {
      if (key === cardsinfo.length - 1) {
        prevPromise = prevPromise.then(() => {
          resolve();
          return fn(item, schoolid);
        });
      } else {
        prevPromise = prevPromise.then(() => {
          return fn(item, schoolid);
        });
      }
    });
  });
}

async function update(cards, deviceid, smapVal) {
  let a = await updateCardStatus(cards, smapVal[1]);
  updateCard(deviceid, smapVal, smapVal[1]);
}
