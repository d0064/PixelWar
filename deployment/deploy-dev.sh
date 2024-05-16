#!/bin/sh
tar --exclude='./dist/tiles' --exclude='./dist/log' -cvJf /tmp/ppfun.tar.xz ./dist
scp /tmp/ppfun.tar.xz PixelWar:/tmp/
rm /tmp/ppfun.tar.xz
ssh PixelWar ./dev-deploy-from-temp.sh
