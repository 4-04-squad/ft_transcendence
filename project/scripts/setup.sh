#!/usr/bin/env bash

# This script is used to clone the project and install dependencies.

# Ask if pull the latest changes if the repository is already cloned
if [ -f "./src/backend/app/package.json" ]; then
    read -p "Do you want to pull the latest changes from the backend repository? [y/n] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd ./src/backend/app && git pull
    fi
elif [ ! -f "./src/web/app/package.json" ]; then
  # Clone backend
  rm -rf ./src/web/app && \
       git clone https://github.com/4-04-squad/web.git ./src/web/app
else
  echo "Project already initialized."
  exit 1
fi

if [ -f "./src/web/app/package.json" ]; then
    read -p "Do you want to pull the latest changes from the web repository? [y/n] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd ./src/web/app && git pull
    fi
elif [ ! -f "./src/web/app/package.json" ]; then
  # Clone frontend
  rm -rf ./src/backend/app && \
      git clone https://github.com/4-04-squad/backend.git ./src/backend/app
else
  echo "Project already initialized."
  exit 1
fi