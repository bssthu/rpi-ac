#!/bin/sh
# -*- coding:utf-8 -*-
kill -2 $(ps -ef | grep -m 1 ac_client.py | awk '{print $2}')
