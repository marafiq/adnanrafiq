# Fetch the base node image
# syntax=docker/dockerfile:1

FROM node:24
EXPOSE 3000
# Set working directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies straight from the lockfile we just copied,
# so the image is reproducible instead of re-resolving on every build.
RUN npm ci

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Run docusaurus on container start
CMD [ "npm", "start" ]