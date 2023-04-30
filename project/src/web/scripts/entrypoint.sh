#!/usr/bin/env bash

set -x

# This script is used to run the application in a docker container.

# Wait for the app to be mounted
while [ ! -d /app ]; do
    sleep 1
done

cd /app

# Get all environment variables and write them to .env file
env | grep -E "^[A-Z_]+=.*$" | sed -E 's/^([A-Z_]+)=(.*)$/VITE_APP_\1="\2"/' > .env

# Check the environment and start the app
if [ "$ENVIRONMENT" == "development" ]; then
    # Start the app in dev mode
    echo "Starting frontend in dev mode"
    yarn dev
elif [ "$ENVIRONMENT" == "production" ]; then
    # Start the app in prod mode
    echo "Starting frontend in prod mode"
    yarn build
else
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
fi
