FROM nginx:1.23

COPY default.conf.tpl /default.conf.tpl

CMD ["/bin/sh" , "-c" , "envsubst '$ASSETS_BUCKET_HOST $ASSETS_BUCKET_PATH' < /default.conf.tpl > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
