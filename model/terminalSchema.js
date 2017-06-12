/**
 * @Author: jifeng.lv
 * @Date:   2017-03-29
 * @Email:  871593867@qq.com
 * @Last modified by:   jifeng.lv
 * @Last modified time: 2017-03-31
 */



const mongoose = require('../base/Mongoose');
const Schema = mongoose.Schema;

//新建机具的数据库模型骨架
var terminalSchema = new Schema({
    terminalid: Number,
    platformid: String,
    schoolid: String,
    schoolname: String,
    module: String,
    iotype: String,
    submodule: String,
    terminalnumber: String,
    sn: String,
    time: String
});

//暴露由Schame发布生成的模型
module.exports = terminalModel = mongoose.model('terminal', terminalSchema, 'terminal');
