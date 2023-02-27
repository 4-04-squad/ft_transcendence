#!/usr/bin/env bash

set -x

# This script is used to run the application in a docker container.

# Wait for the app to be mounted
while [ ! -d /app ]; do
    sleep 1
done

# Install dependencies
cd /app && yarn install


# is dev mode?
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