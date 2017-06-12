/**
 * @Author: jifeng.lv
 * @Date:   2017-03-29
 * @Email:  871593867@qq.com
 * @Last modified by:   jifeng.lv
 * @Last modified time: 2017-05-16
 */



const proveTerminal = require('../logic/prove');
const gettermianlInfo = require('../logic/terminalStatus');
const connectStatus = require('../logic/connectStatus');
const updateCommand = require('../logic/updateCommand');
const signRecs = require('../logic/signRecs');
const updateCard = require('../logic/updateCard');
const batchreport = require('../logic/batchReport');
const cardlogin = require('../logic/cardLogin');

var handler = {
  '10': new on_proveTerminal(),
  '82': new on_getterminalinfo(),
  '05': new on_connectStatus(),
  '75': new on_updateCommand(),
  '76': new on_updateCard(),
  '04': new on_signRecs(),
  '08': new on_signRecs(),
  '18': new on_batchReport(),
  '01': new on_cardlogin()
};

exports.handler = handler;

function on_proveTerminal() {
  this.handle = function(data, sock, dic) {
    proveTerminal(data, sock, dic);
  };
}

function on_getterminalinfo() {
  this.handle = function(data, sock) {
    gettermianlInfo(data, sock);
  };
}

function on_connectStatus() {
  this.handle = function(data, sock, dic) {
    connectStatus(data, sock, dic);
  };
}

function on_updateCommand() {
  this.handle = function(data, sock, dic) {
    updateCommand(data, sock, dic);
  };
}

function on_updateCard() {
  this.handle = function(data, sock, dic) {
    updateCard(data, sock, dic);
  };
}

function on_signRecs() {
  this.handle = function(data, sock, dic) {
    signRecs(data, sock, dic);
  };
}

function on_batchReport() {
  this.handle = function(data, sock, dic) {
    batchreport(data, sock, dic);
  };
}

function on_cardlogin() {
  this.handle = function(data, sock, dic) {
    cardlogin(data, sock, dic);
  };
}
