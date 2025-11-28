FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

RUN mkdir -p /usr/share/nginx/html/crss
COPY dist/ui-bsmd2 /usr/share/nginx/html/crss
RUN envsubst < /usr/share/nginx/html/crss/assets/env.template.ts > /usr/share/nginx/html/crss/assets/env.ts

ENTRYPOINT ["nginx", "-g", "daemon off;"]
