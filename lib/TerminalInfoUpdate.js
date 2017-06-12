/**
 * @Author: jifeng.lv
 * @Date:   2016-11-28
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-18
 */



const Promise = require('bluebird');
const request = require('request');

module.exports = function(data) {
    var module = "";
    var schoolid = "";
    var terminalnumber = "";
    var sn = "";
    var token = data;
    var options = {
        uri: "http://apps.mmc06.com/v2/Terminal/getTerminals?module=" + module + "&schoolid=" + schoolid + "&terminalnumber=" + terminalnumber + "&sn=" + sn + "",
        method: "get",
        headers: {
            "Content-Type": "application/json",
            "token": token
        },
        json: true
    };
    //发起get请求获取机具信息
    return new Promise((resolve, reject) => {
        request(options, (err, req, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};
