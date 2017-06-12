/**
 * @Author: jifeng.lv
 * @Date:   2016-11-22
 * @Email:  871593867@qq.com
 * @Last modified by:   jifeng.lv
 * @Last modified time: 2017-04-18
 */



const mmc = require('../config').mmcconfig;
const request = require('request');
const Promise = require('bluebird');
const tokenModel = require('../model/tokenSchema');
const moment = require('moment');
const ref_token = require('../model/ref_token');

module.exports = function() {
  return new Promise((resolve, reject) => {
    //查询是否有token
    tokenModel.findOne((err, doc) => {
      if (err) {
        reject(err);
      } else {
        //不存在token，重新获取
        if (!doc) {
          ref_token.findOne((err, doc) => {
            if (err) {
              reject(err);
            } else if (!doc) { //不存在刷新token
              var clientid = mmc.clientid;
              var clientsecret = mmc.clientsecret;
              //请求参数
              var postData = {
                "clientId": clientid,
                "clientSecret": clientsecret
              };
              //请求接口方式
              var options = {
                uri: mmc.uri,
                method: 'post',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: postData,
                json: true
              };
              var time = moment().format('YYYY-MM-DD HH:mm:ss');
              //post请求获取token
              request(options, function(err, res, body) {
                if (err) {
                  console.log(err);
                } else {
                  var token = body.access_token;
                  var refreshToken = body.refresh_token;

                  var tokenEntity = {
                    oauth_token: token
                  };
                  //保存token至mongodb数据库
                  tokenModel.create(tokenEntity, function(err, doc) {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(doc.oauth_token);
                    }
                  });
                  ref_token.create({
                    refresh_token: body.refresh_token
                  });
                }
              });
            } else {
              var option = {
                uri: mmc.ref_url,
                method: 'post',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: {
                  "refresh_token": doc.refresh_token
                },
                json: true
              };
              request(option, function(err, res, body) {
                if (err) {
                  console.log(err);
                } else {
                  var token = body.access_token;
                  var refreshToken = body.refresh_token;

                  var tokenEntity = {
                    oauth_token: token
                  };
                  //保存token至mongodb数据库
                  tokenModel.create(tokenEntity, function(err, doc) {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(doc.oauth_token);
                    }
                  });
                  ref_token.update({
                    refresh_token: body.refresh_token
                  }, {
                    upsert: true
                  });
                }
              });
            }
          });
        } else {
          //存在则往下传
          resolve(doc.oauth_token);
        }
      }
    });
  });
};
