FROM nginx:1.23-alpine

# Install dependencies

RUN apk update && apk upgrade \
    && apk add --no-cache --quiet --update \ 
    	  openssl vim curl bash zsh git gettext dos2unix

# Generate ssl certificate
RUN	mkdir -p /etc/nginx/ssl/private /etc/nginx/ssl/certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/private/${DOMAIN}.key \
    -out /etc/nginx/ssl/certs/${DOMAIN}.crt \
    -subj "/C=CH/ST=Geneva/L=Geneva/O=42/OU=42/CN=${DOMAIN}"


COPY ./conf.d/default.conf /etc/nginx/http.d/conf/default.conf
COPY ./conf.d/prod.conf /etc/nginx/http.d/conf/prod.conf

# Copy entrypoint script
COPY ./scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the port the Nginx server will be running on
EXPOSE 80 443

# Start the application
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]