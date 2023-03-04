#!/usr/bin/env bash

set -x

# This script is used to run the application in a docker container.

# Wait for the app to be mounted
while [ ! -d /app ]; do
    sleep 1
done

cd /app

# read the .env file
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ $line == *=* ]]; then
    # prepend VITE_APP_ prefix to each line
    echo "VITE_APP_${line}" >> .env
  fi
done < .env.container

# rm the .env file and rename the .env.container file to .env
rm .env.container

# Install dependencies
yarn install


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