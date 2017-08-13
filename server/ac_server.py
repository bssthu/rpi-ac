#!/usr/bin/env python2
# -*- coding:utf-8 -*-
# File          : ac_server.py
# Author        : bssthu
# Project       : rpi-ac
# 


import flask
app = flask.Flask(__name__)


state = 'on'


@app.route('/ac', methods=['GET'])
def on_check_ac_state():
    """获取空调状态"""
    global state
    return state


@app.route('/ac/ctl', methods=['POST'])
def on_set_ac_state():
    """设置空调状态"""
    global state
    state = flask.request.form['ac_state']
    return state


if __name__ == '__main__':
    app.run(host='0.0.0.0')
