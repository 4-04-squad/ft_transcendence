#!/usr/bin/env bash

# This script is used to clone the project and install dependencies.

# Clone backend
# Check if the repository is already cloned
if [ ! -d "../src/backend/app/package.json" ]; then
    rm -rf ../src/backend/app && \
     git clone https://github.com/4-04-squad/backend.git ../src/backend/app
fi

# Clone frontend
# Check if the repository is already cloned
if [ ! -d "../src/web/app/package.json" ]; then
    rm -rf ../src/web/app && \
     git clone https://github.com/4-04-squad/web.git ../src/web/app
fi