#!/usr/bin/env bash

# This script is used to run the application in a docker container.

# Wait for the app to be mounted
while [ ! -d /app ]; do
    sleep 1
done

# Install dependencies
cd /app && yarn install

# if first start, create the database and run migrations
if [ ! -f /app/.setup ]; then
    npx prisma migrate dev --name init
fi


# Build the app
#yarn build

# Start the app
yarn start:dev