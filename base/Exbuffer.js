/**
 * @Author: jifeng.lv
 * @Date:   2017-03-27
 * @Email:  871593867@qq.com
 * @Last modified by:   jifeng.lv
 * @Last modified time: 2017-03-31
 */



/*!
 * ExBuffer
 * yoyo 2012 https://github.com/play175/ExBuffer
 * new BSD Licensed
 */

/*
 * 构造方法
 * @param bufferLength 缓存区长度，默认512 byte
 */

const loger = require('./log');
const util = require('util');
const EventEmitter = require('events');

var ExBuffer = function(bufferLength) {
    var self = this;
    var _headLen = 2;
    var _endian = 'B';
    var _buffer = Buffer.alloc(bufferLength || 512); //Buffer大于8kb 会使用slowBuffer，效率低
    var _readOffset = 0;
    var _putOffset = 0;
    var _dlen = 0;
    var slice = Array.prototype.slice;
    // EventEmitter.call(this); //继承事件类
    var _readMethod = 'readUInt16BE';

    /*
     * 指定包长是uint32型(默认是ushort型)
     */
    this.uint32Head = function() {
        _headLen = 4;
        _readMethod = 'readUInt' + (8 * _headLen) + '' + _endian + 'E';
        return this;
    };

    /*
     * 指定包长是ushort型(默认是ushort型)
     */
    this.ushortHead = function() {
        _headLen = 2;
        _readMethod = 'readUInt' + (8 * _headLen) + '' + _endian + 'E';
        return this;
    };

    /*
     * 指定字节序 为Little Endian (默认：Big Endian)
     */
    this.littleEndian = function() {
        _endian = 'L';
        _readMethod = 'readUInt' + (8 * _headLen) + '' + _endian + 'E';
        return this;
    };

    /*
     * 指定字节序 为Big Endian (默认：Big Endian)
     */
    this.bigEndian = function() {
        _endian = 'B';
        _readMethod = 'readUInt' + (8 * _headLen) + '' + _endian + 'E';
        return this;
    };

    this.once = function(e, cb) {
        if (!this.listeners_once) this.listeners_once = {};
        this.listeners_once[e] = this.listeners_once[e] || [];
        if (this.listeners_once[e].indexOf(cb) == -1) this.listeners_once[e].push(cb);
    };

    this.on = function(e, cb) {
        if (!this.listeners) this.listeners = {};
        this.listeners[e] = this.listeners[e] || [];
        if (this.listeners[e].indexOf(cb) == -1) this.listeners[e].push(cb);
    };

    this.off = function(e, cb) {
        var index = -1;
        if (this.listeners && this.listeners[e] && (index = this.listeners[e].indexOf(cb)) != -1)
            this.listeners[e].splice(index);
    };

    this.emit = function(e) {
        var other_parameters = slice.call(arguments, 1);
        if (this.listeners) {
            var list = this.listeners[e];
            if (list) {
                for (var i = 0; i < list.length; ++i) {
                    // try{
                    list[i].apply(this, other_parameters);
                    // }catch(e){
                    //     alert(e.stack);
                    // }
                }
            }
        }

        if (this.listeners_once) {
            var _list = this.listeners_once[e];
            delete this.listeners_once[e];
            if (_list) {
                for (let i = 0; i < _list.length; ++i) {
                    // try{
                    _list[i].apply(this, other_parameters);
                    // }catch(e){
                    //     alert(e.stack);
                    // }
                }
            }
        }
    };

    /*
     * 送入一段Buffer
     */
    this.put = function(buffer, offset, len) {
        if (offset === undefined) offset = 0;
        if (len === undefined) len = buffer.length - offset;
        //buf.copy(targetBuffer, [targetStart], [sourceStart], [sourceEnd])
        //当前缓冲区已经不能满足次数数据了
        if (len + getLen() > _buffer.length) {
            var ex = Math.ceil((len + getLen()) / (1024)); //每次扩展1kb
            var tmp = Buffer.alloc(ex * 1024);
            var exlen = tmp.length - _buffer.length;
            _buffer.copy(tmp);
            //fix bug : superzheng
            if (_putOffset < _readOffset) {
                if (_putOffset <= exlen) {
                    tmp.copy(tmp, _buffer.length, 0, _putOffset);
                    _putOffset += _buffer.length;
                } else {
                    //fix bug : superzheng
                    tmp.copy(tmp, _buffer.length, 0, exlen);
                    tmp.copy(tmp, 0, exlen, _putOffset);
                    _putOffset -= exlen;
                }
            }
            _buffer = tmp;
        }
        if (getLen() === 0) {
            _putOffset = _readOffset = 0;
        }
        //判断是否会冲破_buffer尾部
        if ((_putOffset + len) > _buffer.length) {
            //分两次存 一部分存在数据后面 一部分存在数据前面
            var len1 = _buffer.length - _putOffset;
            if (len1 > 0) {
                buffer.copy(_buffer, _putOffset, offset, offset + len1);
                offset += len1;
            }

            var len2 = len - len1;
            buffer.copy(_buffer, 0, offset, offset + len2);
            _putOffset = len2;
        } else {
            buffer.copy(_buffer, _putOffset, offset, offset + len);
            _putOffset += len;
        }

        var count = 0;
        while (true) {
            //console.log('_readOffset:'+_readOffset);
            //console.log('_putOffset:'+_putOffset);
            //console.log(_buffer);
            count++;
            if (count > 1000) break; //1000次还没读完??
            if (_dlen === 0) {
                if (getLen() < _headLen) {
                    break; //连包头都读不了
                }
                if (_buffer.length - _readOffset >= _headLen) {
                    // _dlen = _buffer[_readMethod](_readOffset) - _headLen; 源码
                    _dlen = Number(_buffer.toString('utf8', _readOffset, _readOffset + 4)) - _headLen;
                    _readOffset += _headLen;
                } else { //
                    var hbuf = Buffer.alloc(_headLen);
                    var rlen = 0;
                    for (var i = 0; i < (_buffer.length - _readOffset); i++) {
                        hbuf[i] = _buffer[_readOffset++];
                        rlen++;
                    }
                    _readOffset = 0;
                    for (let i = 0; i < (_headLen - rlen); i++) {
                        hbuf[rlen + i] = _buffer[_readOffset++];
                    }
                    _dlen = Number(hbuf.toString('utf8', 0, 4)) - _headLen;
                }
            }

            //console.log('_dlen:'+_dlen + ',unreadLen:'+getLen());

            if (getLen() >= _dlen) {
                var dbuff = Buffer.alloc(_dlen);
                if (_readOffset + _dlen > _buffer.length) {
                    var _len1 = _buffer.length - _readOffset;
                    if (_len1 > 0) {
                        _buffer.copy(dbuff, 0, _readOffset, _readOffset + _len1);
                    }

                    _readOffset = 0;
                    var _len2 = _dlen - _len1;
                    _buffer.copy(dbuff, _len1, _readOffset, _readOffset += _len2);
                } else {
                    _buffer.copy(dbuff, 0, _readOffset, _readOffset += _dlen);
                }
                try {
                    _dlen = 0;
                    self.emit("data", dbuff);
                    if (_readOffset === _putOffset) {
                        break;
                    }
                } catch (e) {
                    self.emit("error", e);
                }
            } else {
                break;
            }
        }

    };


    //获取现在的数据长度
    function getLen() {
        if (_putOffset >= _readOffset) { // ------******-------
            return _putOffset - _readOffset;
        }
        return _buffer.length - _readOffset + _putOffset; //***-------*********
    }
};

//继承事件类
// util.inherits(ExBuffer, EventEmitter);
module.exports = exports = ExBuffer;
