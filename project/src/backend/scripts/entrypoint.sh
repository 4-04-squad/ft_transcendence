#!/usr/bin/env bash

# This script is used to run the application in a docker container.

# Wait for the app to be mounted
while [ ! -d /app ]; do
    sleep 1
done

# Install dependencies
cd /app

# First start, create the database and run migrations
npx prisma migrate dev
npx prisma migrate

# Build the app
#yarn build

# is dev mode?
if [ "$ENVIRONMENT" == "development" ]; then
    # Start the app in dev mode
    echo "Starting backend in dev mode"
    yarn start:dev
elif [ "$ENVIRONMENT" == "production" ]; then
    # Start the app in prod mode
    echo "Starting backend in prod mode"
    yarn start
else
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
fi