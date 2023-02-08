FROM goacme/lego:latest

EXPOSE 80

ENV ACME_DOMAIN=""
ENV ACME_EMAIL=""
ENV ACME_DAYS="15"
ENV ACME_WEBROOT=""

COPY ./entrypoint.sh /entrypoint.sh

VOLUME /.lego

ENTRYPOINT ["/entrypoint.sh"]
