#!/bin/bash
cd /home/site/wwwroot
npm install
npx prisma generate
node app.js