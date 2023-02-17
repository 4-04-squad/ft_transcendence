#!/usr/bin/env bash

# This script is used to run the application in a docker container.

# Wait for the app to be mounted
while [ ! -d /app ]; do
    sleep 1
done

# Install dependencies
cd /app && yarn install && yarn build

# Start the app
yarn dev --port 3000