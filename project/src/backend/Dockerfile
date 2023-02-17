FROM node:18-alpine

# Install dependencies
RUN apk update && apk upgrade \
    && apk add --no-cache --quiet --update \
    	   vim curl bash zsh git

# Set the working directory to /app
WORKDIR /app

# Copy entrypoint script
COPY ./scripts/entrypoint.sh /usr/local/bin/entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the port the application will be running on
EXPOSE 3001

# Start the application
CMD ["entrypoint.sh"]