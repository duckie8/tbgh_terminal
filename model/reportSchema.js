/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-04-14
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-22
 */


const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

var reportSchema = new Schema({
  cardnumber: String,
  schoolid: String,
  schoolname: String,
  userid: String,
  username: String,
  cardholder: String,
  msg: Object,
  creattime: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 72
  }
});
module.exports = reportSchema = mongoose.model("cok_detail", reportSchema, "cok_detail");
