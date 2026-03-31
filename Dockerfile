FROM exist.azurecr.io/nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

RUN mkdir -p /usr/share/nginx/html/crss
COPY dist/ui-bsmd2 /usr/share/nginx/html/crss
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
