#!/bin/bash
# update yum just in case
yum update -y
# get node into yum
curl -sL https://rpm.nodesource.com/setup_12.x | sudo -E bash -
# install node and npm in one line
yum install -y nodejs
# install pm2 to restart node app
npm i -g pm2

export app_root=/usr/exgenaws
if [ -d "$app_root" ];then
    rm -rf /usr/exgenaws
    mkdir -p /usr/exgenaws
else
    mkdir -p /usr/exgenaws
fi