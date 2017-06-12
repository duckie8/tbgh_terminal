/**
 * @Author: jifeng.lv
 * @Date:   2017-03-22
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-04-25
 */



const ExBuffer = require('./base/Exbuffer');
const server = require('./base/tcpserver').server;
const holdTerminal = require('./base/HoldTerminal');


holdTerminal();

server();
