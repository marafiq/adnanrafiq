# Fetch the base node image
# syntax=docker/dockerfile:1

FROM node:18
EXPOSE 3000
# Set working directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Run docusaurus on container start
CMD [ "npm", "start" ]