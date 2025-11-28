#!/bin/sh
set -e

# Generate env.js from template at container start
envsubst < /usr/share/nginx/html/crss/assets/env.template.ts > /usr/share/nginx/html/crss/assets/env.ts

exec nginx -g 'daemon off;'
