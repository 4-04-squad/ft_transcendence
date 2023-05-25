FROM nginx:1.23-alpine

# Install dependencies

ARG ENV

RUN apk update && apk upgrade \
    && apk add --no-cache --quiet --update \
    	  openssl vim curl bash zsh git gettext

# Generate ssl certificate
RUN	mkdir -p /etc/nginx/ssl/private /etc/nginx/ssl/certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/private/${DOMAIN}.key \
    -out /etc/nginx/ssl/certs/${DOMAIN}.crt \
    -subj "/C=CH/ST=Geneva/L=Geneva/O=42/OU=42/CN=${DOMAIN}"
# Expose the port the Nginx server will be running on
EXPOSE 80 443

# Start the Nginx server

CMD if [ "${ENV}" = "development" ]; then nginx -g "daemon off;"; else nginx -c /etc/nginx/conf.d/prod.conf -g "daemon off;"; fi
