#!/bin/sh
scp dist/server.js PixelWar:/home/pixelpla/PixelWar/
ssh PixelWar ./restart.sh
