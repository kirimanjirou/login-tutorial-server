#!/bin/sh

PID_NODE=`ps -ef |grep "node ./bin/www_android_tutorial" |grep -v grep|awk '{ print $2 }'`

echo "PID_NODE is: " $PID_NODE

if [ -n "$PID_NODE" ]; then
kill -9 $PID_NODE
fi


echo "service is not ready"
