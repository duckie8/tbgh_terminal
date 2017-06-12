/**
 * @Author: jifeng.lv
 * @Date:   2016-11-22
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-12
 */


const request = require('request');
const Promise = require('bluebird');
const getToken = require('./AcquireToken.js');
const cardModel = require('../model/cardSchema');
const idsModel = require('../model/idsSchema');
const moment = require('moment');
const _ = require('lodash');

module.exports = function(schoolid, platformid) {
  //获取token，发起请求获取card
  getToken().then((token) => {
    var postData = {
      'platformid': platformid,
      "schoolid": schoolid,
      "cv": "2000-12-21 00:00:00",
      "CurrentPage": "",
      "ItemsPerPage": 500
    };
    var options = {
      uri: "http://apps.mmc06.com/v2/Terminal/getCards",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "token": token
      },
      body: postData,
      json: true
    };
    var time = moment().format('YYYY-MM-DD HH:mm:ss');
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        } else if (body.r.Items !== undefined) {
          const fn = (data) => {
            return new Promise(function(resolve, reject) {
              let query = {
                name: "user",
                schoolid: schoolid
              };
              idsModel.findOneAndUpdate(query, {
                $set: {
                  expires_in: time
                },
                $inc: {
                  id: 1
                }
              }, {
                upsert: true
              }, (err, doc) => {
                if (err) {
                  reject(err);
                }
                if (!doc) {
                  cardModel.update({
                    schoolid: data.schoolid,
                    cardnumber: data.cardnumber
                  }, {
                    id: 0,
                    cardid: data.cardid,
                    cardnumber: data.cardnumber,
                    schoolid: data.schoolid,
                    schoolname: data.schoolname,
                    classid: data.classid,
                    classname: data.classname,
                    usestatus: data.usestatus,
                    userid: data.userid,
                    usertype: data.usertype,
                    username: data.username,
                    cardholder: data.cardholder,
                    isupdated: '0',
                    updated: data.updated,
                    createtime: time
                  }, {
                    upsert: true
                  }, (err, raw) => {
                    if (err) {
                      reject(err);
                    } {
                      resolve(data);
                    }
                  });
                } else {
                  cardModel.update({
                    schoolid: data.schoolid,
                    cardnumber: data.cardnumber
                  }, {
                    id: doc.id,
                    cardid: data.cardid,
                    cardnumber: data.cardnumber,
                    schoolid: data.schoolid,
                    schoolname: data.schoolname,
                    classid: data.classid,
                    classname: data.classname,
                    usestatus: data.usestatus,
                    userid: data.userid,
                    usertype: data.usertype,
                    username: data.username,
                    cardholder: data.cardholder,
                    isupdated: '0',
                    updated: data.updated,
                    createtime: time
                  }, {
                    upsert: true
                  }, (err, raw) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(data);
                    }
                  });
                }
              });

            });
          };
          let precPromise = Promise.resolve();
          var Items = body.r.Items;
          //将获取的卡信息循环插入mongodb中
          _.forEach(Items, (item) => {
            precPromise = precPromise.then(() => {
              return fn(item);
            });
          });
        }
      });
    });
  }).catch((err) => {
    throw err;
  });
};
