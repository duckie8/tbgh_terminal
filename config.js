/**
 * @Author: jifeng.lv
 * @Date:   2016-11-22
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-10
 */



module.exports = {
  mmcconfig: {
    "uri": 'http://apps.mmc06.com/v2/Account',
    "ref_url": 'http://apps.mmc06.com/v2/Account',
    "clientid": "",
    "clientsecret": ""
  },
  mongoDBconfig: {
    "username": "",
    "pwd": "",
    "url": "mongodb://"
  },
  log4js: {
    "appenders": [{
        "type": "console"
      },
      {
        "category": "debug",
        "type": "dateFile",
        "filename": "./logs/debug",
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
      }, {
        "category": "info",
        "type": "dateFile",
        "filename": "./logs/info",
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
      }, {
        "category": "warn",
        "type": "dateFile",
        "filename": "./logs/warn",
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
      }, {
        "category": "error",
        "type": "dateFile",
        "filename": "./logs/error",
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
      }
    ],
    "replaceConsole": true,
    "levels": {
      "debug": "DEBUG",
      "info": "INFO",
      "warn": "WARN",
      "error": "ERROR"
    }
  },
  photo: 'https://www.mmc06.com/resource/timg.jpg'
};
