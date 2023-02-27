#!/usr/bin/env bash

# This script is used to clone the project and install dependencies.

# Ask if pull the latest changes if the repository is already cloned
if [ -f "./src/backend/app/package.json" ]; then
    echo "Updating backend repository.."
    cd ./src/backend/app && git pull
    cd ../../..
elif [ ! -f "./src/backend/app/package.json" ]; then
  # Clone backend
  rm -rf ./src/backend/app && \
       git clone https://github.com/4-04-squad/backend.git ./src/backend/app
else
  echo "Project already initialized."
  exit 1
fi

if [ -f "./src/web/app/package.json" ]; then
    echo "Updating frontend repository.."
    cd ./src/web/app && git pull
    cd ../../..
elif [ ! -f "./src/web/app/package.json" ]; then
  # Clone frontend
  rm -rf ./src/web/app && \
      git clone https://github.com/4-04-squad/web.git ./src/web/app
else
  echo "Project already initialized."
  exit 1
fi