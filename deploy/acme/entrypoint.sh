#!/bin/sh

test -n "${ACME_DOMAIN}" || exit 1

if [ -z "${ACME_EMAIL}" ]
then
  ACME_EMAIL="admin@${ACME_DOMAIN}"
fi

if [ -e "/.lego/certificates/${ACME_DOMAIN}.key" ]
then
  if [ -n "${ACME_WEBROOT}" ]
  then
    test -e "${ACME_WEBROOT}" || mkdir -p "${ACME_WEBROOT}"
    exec /usr/bin/lego --domains="${ACME_DOMAIN}" \
      --email="${ACME_EMAIL}" \
      --accept-tos --key-type=rsa2048 --http --http.webroot "${ACME_WEBROOT}" \
      renew --days "${ACME_DAYS}"
  else
    exec /usr/bin/lego --domains="${ACME_DOMAIN}" \
      --email="${ACME_EMAIL}" \
      --accept-tos --key-type=rsa2048 --http \
      renew --days "${ACME_DAYS}"
  fi
else
  exec /usr/bin/lego --domains="${ACME_DOMAIN}" \
    --email="${ACME_EMAIL}" \
    --accept-tos --key-type=rsa2048 --http \
    run
fi
