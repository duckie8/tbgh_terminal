/**
 * @Author: jifeng.lv
 * @Date:   2017-03-30
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-27
 */



const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

var statusSchema = new Schema({
  deviceid: String,
  versioninfo: String,
  minitorinfo: String,
  serial: {
    type: Number,
    default: 0
  },
  cardversion: {
    type: String,
    default: '2000-01-01 00:00:00'
  },
  conntime: String,
  times: {
    type: Number,
    default: 1
  }
});

module.exports = statusModel = mongoose.model('tbterminal', statusSchema, 'tbterminal');
