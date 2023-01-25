FROM nginx:1.23
COPY default.conf /etc/nginx/conf.d

ARG NGINX_HTPASSWD=none
RUN echo $NGINX_HTPASSWD > /etc/nginx/conf.d/htpasswd
