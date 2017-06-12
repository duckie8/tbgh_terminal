/**
 * @Author: jifeng.lv <Artisan>
 * @Date:   2017-04-14
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-28
 */


const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

var tokenSchema = new Schema({
  oauth_token: String,
  expires_in: {
    type: Date,
    expires: 60 * 9,
    default: Date.now
  }
});
module.exports = tokenModel = mongoose.model("oauth_token", tokenSchema, "oauth_token");
