#!/usr/bin/env bash

set -x

# Check the environment and start the app
if [ "$ENVIRONMENT" == "development" ]; then
    # Start the app in dev mode
    echo "Starting nginx in dev mode"
    rm -rf /etc/nginx/conf.d/default.conf
    cp /etc/nginx/http.d/conf/default.conf /etc/nginx/conf.d/default.conf
elif [ "$ENVIRONMENT" == "production" ]; then
    # Start the app in prod mode
    echo "Starting nginx in prod mode"
    rm -rf /etc/nginx/conf.d/default.conf
    cp /etc/nginx/http.d/conf/prod.conf /etc/nginx/conf.d/default.conf
else
    echo "Unknown environment: $ENVIRONMENT"
fi

# Start nginx
nginx -g "daemon off;"