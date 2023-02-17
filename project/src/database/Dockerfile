FROM postgres:15-alpine

# Install dependencies
RUN apk update && apk upgrade \
    && apk add --no-cache --quiet --update \
    	   vim curl bash zsh git

# Expose the port the database will be running on
EXPOSE 5432

# Start the database
CMD ["postgres"]