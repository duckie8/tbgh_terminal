/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-04-18
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-28
 */


const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

var idsSchema = new Schema({
  name: {
    type: String,
    default: 'user'
  },
  schoolid: String,
  id: {
    type: Number
  },
  expires_in: {
    type: Date,
    expires: '7d',
    default: Date.now
  }
});
module.exports = ids = mongoose.model("ids", idsSchema, "ids");
