#!/bin/sh
set -e

# Generate env.js from template at container start
envsubst < /usr/share/nginx/html/crss/assets/env.template.js > /usr/share/nginx/html/crss/assets/env.js

exec nginx -g 'daemon off;'
