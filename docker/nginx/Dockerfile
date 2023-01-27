FROM nginx:1.23

COPY default.conf /etc/nginx/conf.d

COPY startup.sh .
RUN chmod 755 startup.sh

CMD ["/bin/bash", "-c", "./startup.sh"]
