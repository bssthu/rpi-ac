#!/usr/bin/env python2
# -*- coding:utf-8 -*-
# File          : ac_client.py
# Author        : bssthu
# Project       : rpi-ac
# 


import time
import json
import os
try:
    from urllib2 import urlopen
except ImportError:
    from urllib.request import urlopen


if __name__ == '__main__':
    last_state = 'on'
    # 载入配置文件
    with open('conf.json', 'rt') as fp:
        config = json.load(fp)
    while True:

        try:
            state = urlopen(config['server_url']).read()
            if state != last_state:
                last_state = state
                print('new state: %s' % str(state))
                cmd = config['command_dict'].get(state, None)
                if cmd is not None:
                    os.system(cmd)
        except Exception as e:
            print(e)
        time.sleep(config['interval'])
