/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-04-13
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-08
 */


const statusModel = require('../model/statusSchema');
const cardModel = require('../model/cardSchema');
const Promise = require('bluebird');
const getToken = require('../base/AcquireToken.js');
const idsModel = require('../model/idsSchema');
const moment = require('moment');
const request = require('request');


function updateStatus(schoolid, deviceid, platformid) {
  return new Promise(function (resolve, reject) {
    Promise.all([acquireCard(schoolid, platformid), findCard(schoolid)])
      .then((cardInfo) => {
        let status;
        let acqcard = cardInfo[0];
        let getcard = cardInfo[1];
        if (acqcard.length !== 0) {
          let time = moment().format('YYYY-MM-DD HH:mm:ss');
          //生成获取的卡数据中卡号的数组
          let acqcardarr = acqcard.map(function (item) {
            return item.cardnumber;
          });
          //循环判断获取的卡号是否存在数据库中，若不存在则新增数据
          for (let i = 0; i < acqcardarr.length; i++) {
            status = getcard.indexOf(acqcardarr[i]);
            if (status === -1) {
              idsModel.findOneAndUpdate({
                name: "user",
                schoolid: schoolid
              }, {
                  $inc: {
                    id: 1
                  }
                }, (err, doc) => {
                  if (err) {
                    reject(err);
                  } else {
                    cardModel.update({
                      schoolid: acqcard[i].schoolid,
                      cardnumber: acqcard[i].cardnumber
                    }, {
                        id: doc.id,
                        cardid: acqcard[i].cardid,
                        cardnumber: acqcard[i].cardnumber,
                        schoolid: acqcard[i].schoolid,
                        schoolname: acqcard[i].schoolname,
                        classid: acqcard[i].classid,
                        classname: acqcard[i].classname,
                        usestatus: acqcard[i].usestatus,
                        userid: acqcard[i].userid,
                        usertype: acqcard[i].usertype,
                        username: acqcard[i].username,
                        cardholder: acqcard[i].cardholder,
                        isupdated: '0',
                        updated: acqcard[i].updated,
                        createtime: time
                      }, {
                        upsert: true
                      }, (err, raw) => {
                        if (err) {
                          reject(err);
                        }
                      });
                  }
                });
            } else {
              return;
            }
          }
        } else {
          return;
        }
      });
  });
}

module.exports = updateStatus;

//获取对应学校卡数据
function acquireCard(schoolid, platformid) {
  return new Promise(function (resolve, reject) {
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
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        } else if (body.r.Items !== undefined) {
          let Items = body.r.Items;
          resolve(Items);
        }
      });
    });
  });
}

//获取数据库卡号
function findCard(schoolid) {
  return new Promise(function (resolve, reject) {
    cardModel.find({
      schoolid: schoolid,
      isupdated: '0'
    }, {
        _id: 0,
        createtime: 0,
        updated: 0,
        isupdated: 0,
        cardholder: 0,
        username: 0,
        usertype: 0,
        userid: 0,
        usestatus: 0,
        classname: 0,
        classid: 0,
        schoolname: 0,
        schoolid: 0,
        cardid: 0,
        id: 0,
        __v: 0
      })
      .then((cards) => {
        resolve(cards);
      });
  });
}
