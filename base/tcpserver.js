/**
 * @Author: jifeng.lv
 * @Date:   2017-03-27
 * @Email:  871593867@qq.com
 * @Last modified by:   Artisan
 * @Last modified time: 2017-05-18
 */



const net = require("net");
const ExBuffer = require('./Exbuffer');
const loger = require('./log');
const handler = require('./common').handler;
const schedule = require('node-schedule');
const mapLoop = require('../lib/mapLoop');
const acqCardLoop = require('../lib/acqCardLoop');
const getFamilyNum = require('../lib/getFamilyNum.js');


let dic = new Map();

exports.server = function() {

  net.Socket.prototype.send = function(msg) {
    var len = Buffer.byteLength(msg) + 4;
    var headStr = '';
    for (let i = 0; i < 4 - len.toString().length; i++) {
      headStr += '0';
    }
    //写入4个字节表示本次包长
    var headBuf = Buffer.from(headStr + len);

    var bodyBuf = Buffer.alloc(len);
    headBuf.copy(bodyBuf, 0, 0, headBuf.length);
    msg.copy(bodyBuf, 4, 0, len - 4);
    if (this.writable) {
      this.write(bodyBuf);
    } else {
      loger.warnLog.warn("socket write err,writable :" + this.writable);
      this.emit("c_close");
    }
  };
  socket_server = net.createServer(function(sock) {

    //客户端ip地址和端口
    sock.c_ip = sock.remoteAddress;
    sock.c_port = sock.remotePort;

    loger.debugLog.debug('socket connected,ip:' + sock.c_ip + ",port:" + sock.c_port);
    //客户端默认是65秒发一次心跳,一般情况下2分钟左右比较好,连接超时断开连接
    sock.setTimeout(2 * 60 * 1000);
    sock.addListener("timeout", function() {
      loger.warnLog.warn("socket timeout,ip:" + sock.c_ip + ",port:" + sock.c_port);
      sock.end();
      sock.destroy();
      sock.emit("c_close");
    });

    var exBuffer = new ExBuffer().uint32Head().bigEndian();
    exBuffer.on('data', onReceivePackData);

    //当服务端收到完整的包时
    function onReceivePackData(buffer) {
      var receive_data = buffer.toString();
      console.log(receive_data);
      if (receive_data) {
        var func_no = receive_data.substr(0, 2);
        if (handler[func_no]) {
          handler[func_no].handle(buffer, sock, dic);
        }
      }
    }

    sock.on("data", function(data) {
      exBuffer.put(data); //只要收到数据就往ExBuffer里面put
    });

    sock.on("error", function(e) {
      loger.errLog.error("socket unknow " + e);
      sock.emit("c_close");
    });

    sock.on("c_close", function() {
      dic.forEach((value, key) => {
        if (value[0] === sock) {
          value[2] = 0;
        }
      });
    });
  });
  //轮询新增卡数据下发
  let j = schedule.scheduleJob('*/15 * * * *', function() {
    let dictionary = dic;
    mapLoop(dictionary);
  });
  //更新数据库卡数据
  let k = schedule.scheduleJob('0 0 0 * * *', function() {
    let dictionary = dic;
    acqCardLoop(dictionary);
  });

  // let l = schedule.scheduleJob('0 0 0 * * *', function() {
  //   let dictionary = dic;
  //   getFamilyNum(dictionary);
  // });

  socket_server.listen({
    port: 3000
    // host: '192.168.0.119'
  }, function() {
    loger.infoLog.info('server start listening:' + JSON.stringify(socket_server.address()));
    // global.log("listen on port: " + " ok!");
  });
};
