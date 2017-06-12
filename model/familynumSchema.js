/**
 * @Author: jifeng.lv
 * @Date:   2017-05-16
 * @Email:  871593867@qq.com
 * @Last modified by:   jifeng.lv
 * @Last modified time: 2017-05-16
 */


const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

let familynumSchema = new Schema({
  _id: String,
  Memberid: String,
  MemberName: Array,
  Phone: Array,
  Updated: Date
});

module.exports = familynumModel = mongoose.model('familynum', familynumSchema, 'familynum');
