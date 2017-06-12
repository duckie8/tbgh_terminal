/**
 * @Author: jifeng.lv
 * @Date:   2017-03-24
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-28
 */



const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

var refreshToken = new Schema({
    refresh_token: String,
    createtime: {
        type: Date,
        default: Date.now,
        expires: 60 * 14
    }
});
module.exports = ref_token = mongoose.model('ref_token', refreshToken, 'ref_token');
