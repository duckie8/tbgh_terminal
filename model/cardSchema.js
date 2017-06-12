/**
 * @Author: jifeng.lv
 * @Date:   2017-04-10
 * @Email:  871593867@qq.com
 * @Last modified by:   jifeng.lv
 * @Last modified time: 2017-05-16
 */



const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

let cardSchema = new Schema({
  id: Number,
  cardid: Number,
  cardnumber: String,
  schoolid: String,
  schoolname: String,
  classid: String,
  classname: String,
  usestatus: String,
  usertype: String,
  userid: {
    type: String,
    ref: 'familynum'
  },
  username: String,
  cardholder: String,
  isupdated: {
    type: String,
    default: '0'
  },
  updated: String,
  createtime: {
    type: Date
  }
});

module.exports = cardModel = mongoose.model("cards", cardSchema, "cards");
