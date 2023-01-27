#! /bin/bash

echo $NGINX_HTPASSWD > /etc/nginx/conf.d/htpasswd
exec nginx -g "daemon off;"
