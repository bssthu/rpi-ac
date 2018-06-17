#!/usr/bin/env node
// -*- coding:utf-8 -*-
// File          : server.js
// Author        : bss
// Project       : wechat_listener
// Creation Date : 2015-11-04
// Description   : https://github.com/bssthu/wechat_listener
// 
// Module dependencies:
// - xml2js: https://github.com/Leonidas-from-XIV/node-xml2js
// 


var http = require('http');
var https = require('https');
var url = require('url');
var querystring = require('querystring');
var crypto = require('crypto');
var fs = require('fs');
var xml2js = require('xml2js');

var config = require('./config');


var acState = 'on_0';

var acServer = http
  .createServer(acReceiver)
  .listen(config.acPort);

var wechatServer = http
  .createServer(wechatReceiver)
  .listen(config.httpPort);


function acReceiver(request, response) {
  var pathName = url.parse(request.url).pathname;
  if (pathName === config.acPath) {
    response.write(acState);
  }
  response.end();
}


function wechatReceiver(request, response) {
  var query = querystring.parse(url.parse(request.url).query)

  var arr = [ config.token, query.timestamp, query.nonce ];
  var cryptoSrc = arr.sort().join('')
  var sha1 = crypto.createHash('sha1');
  var signature = sha1.update(cryptoSrc).digest('hex');

  // 身份验证，见“接入指南”
  // http://mp.weixin.qq.com/wiki/17/2d4265491f12608cd170a95559800f2d.html
  if (query.signature === signature) {
    if (query.hasOwnProperty('echostr')) {
      response.write(query.echostr);
    }
  }
  response.end();

  if (request.method === 'POST') {
    request.setEncoding('utf-8');
    var postData = '';

    request.addListener('data', function (postDataChunk) {
      postData += postDataChunk;
    });

    request.addListener('end', function () {
      // 接收普通消息
      // http://mp.weixin.qq.com/wiki/10/79502792eef98d6e0c6e1739da387346.html
      handleXmlMessage(postData);
    });
  }
}


function handleXmlMessage(xmlMessage) {
  xml2js.parseString(xmlMessage, function (err, result) {
    if (!err) {
      if (result.hasOwnProperty('xml')) {
        xmlResult = result.xml;
        if (xmlResult.hasOwnProperty('MsgType') &&
            xmlResult.hasOwnProperty('FromUserName') &&
            xmlResult.hasOwnProperty('Content')) {
          if (xmlResult.MsgType[0] === 'text' &&
              config.trustedOpenIds[xmlResult.FromUserName[0]] &&
              xmlResult.Content[0] !== null) {
            handleTextMessage(xmlResult.Content[0]);
            writeLog(xmlResult.FromUserName[0] + ', '
                + xmlResult.CreateTime[0] + ', '
                + xmlResult.Content[0] + '\n');
          }
        }
      }
    }
  });
}


function handleTextMessage(text) {
  Object.keys(config.acCmd).forEach(function (cmdName) {
    Object.keys(config.acCmd[cmdName]).forEach(function (aliasName) {
      if (text === aliasName) {
        executeAcCmd(cmdName);
      }
    });
  });
}


// 用于空调控制的指令
function executeAcCmd(cmdName) {
  acState = cmdName + '_' + Date.now() / 1000;
}


function writeLog(text) {
  fs.open(config.logName + '.log', 'a', function (err, fd) {
    if (!err) {
      fs.write(fd, text, function (err) {
        fs.closeSync(fd);
      });
    }
  });
}
