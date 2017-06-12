/**
 * @Author: jifeng.lv
 * @Date:   2017-04-12
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-22
 */



const fillzero = require('../base/fillzero');
const updateStatus = require('./compareCard');
const iconv = require('iconv-lite');
const getSerial = require('../base/getSerial');
const cardModel = require('../model/cardSchema');
const loger = require('../base/log');

function updateCard(deviceid, smapVal, schoolid) {

  cardModel.aggregate({
      '$match': {
        'schoolid': schoolid,
        'isupdated': '0'
      }
    }, {
      '$sort': {
        'username': 1
      }
    }, {
      '$limit': 15
    }, {
      '$project': {
        '_id': 0,
        'cardnumber': 1,
        'username': 1,
        'cardtype': {
          '$cond': ['$usertype' === '教师', '1', '0']
        },
        'toneinfo': {
          '$cond': ['$usertype' === '教师', {
            '$concat': ['$username', '老师']
          }, {
            '$concat': ['$username', '的家长']
          }]
        },
        'updated': 1
      }
    }, {
      '$group': {
        '_id': '$schoolid',
        'cardnumbers': {
          '$push': '$cardnumber'
        },
        'usernames': {
          '$push': '$username'
        },
        'cardtypes': {
          '$push': '$cardtype'
        },
        'toneinfos': {
          '$push': '$toneinfo'
        },
        'updated': {
          '$max': '$updated'
        }
      }
    })
    .then((doc) => {
      return new Promise(function(resolve, reject) {
        if (doc.length !== 0) {
          let usernames = doc[0].usernames;
          let datanums = usernames.length;
          let sock = smapVal[0];
          let cardnumbers = doc[0].cardnumbers;
          let cardtypes = doc[0].cardtypes;
          let toneinfos = doc[0].toneinfos;
          let str = '';
          smapVal[5] = cardnumbers;

          for (let i = 0; i < datanums; i++) {
            str = str + '1' + fillzero(cardnumbers[i], 18, 'str') + cardtypes[i] + '3' + fillzero(toneinfos[i], 30, 'str') + fillzero(' ', 10, 'str');
          }
          getSerial(deviceid)
            .then((serial) => {
              str = '76' + serial + fillzero(datanums.toString(), 4) + str;
              sock.send(iconv.encode(str, 'gbk'));
            });
        } else {
          return;
        }
      });
    });
}

module.exports = updateCard;
