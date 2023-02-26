#!/usr/bin/env bash

# This script is used to run the application in a docker container.

# Wait for the app to be mounted
while [ ! -d /app ]; do
    sleep 1
done

# Install dependencies
cd /app && yarn install

# First start, create the database and run migrations
if [ ! -f /app/.setup ]; then
    npx prisma migrate dev --name init
else # Subsequent starts, run migrations only
    npx prisma migrate
fi


# Build the app
#yarn build

# is dev mode?
if [ "$ENVIRONMENT" = "development" ]; then
    # Start the app in dev mode
    echo "Starting backend in dev mode"
    yarn start:dev
else
    # Start the app in prod mode
    echo "Starting backend in prod mode"
    yarn start
fi