#!/usr/bin/env bash
# Update the live website on the VPS: cd /var/www/website && bash deploy.sh
# The new version is built in .next-new while the current one keeps serving visitors, then
# swapped in and restarted — so the site isn't broken during the build.
set -e
git pull
npm install
rm -rf .next-new
NEXT_DIST_DIR=.next-new npm run build
rm -rf .next-old
[ -d .next ] && mv .next .next-old
mv .next-new .next
pm2 restart website
rm -rf .next-old
echo "Website updated."
