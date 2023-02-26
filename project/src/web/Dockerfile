FROM node:18-alpine

# Install dependencies
RUN apk update && apk upgrade \
    && apk add --no-cache --quiet --update \
    	   vim curl bash zsh git

# Set the working directory to /app
WORKDIR /app

# Copy package.json and lock file
COPY ./app/package*.json ./app/yarn.lock ./

# Install dependencies
RUN yarn install

# Copy .git folder
COPY ./app/.git ./app/.gitignore ./

# Copy the current directory contents into the container at /app
COPY ./app ./

# Copy entrypoint script
COPY ./scripts/entrypoint.sh /usr/local/bin/entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the port the application will be running on
EXPOSE 3003

# Start the application
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
