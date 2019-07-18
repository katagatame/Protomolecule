# Docker build instructions:
# from root project directory: 
#   * docker build -t pm-docker .
#   * docker run -p 3000:3000 -d pm-docker

# Select the right version of Node for the application
FROM node:12

# Set our working directory
WORKDIR /usr/src/protomolecule

# Copy the package.json and package-lock.json to install deps
COPY package*.json ./

# Copy the app source
COPY . .

# Use npm to install deps
RUN npm i

# Install gulp
# Need to install locally and globally, see here: https://stackoverflow.com/questions/46559549/how-to-run-gulp-task-from-dockerfile
RUN npm i -g gulp
RUN npm i gulp

# Run the gulp installer
RUN gulp default

# Copy the configuration file for the application
COPY ./src/client/user/config/user-config-dev.json /usr/src/protomolecule/bin/client/user/config/user-config.json

# Set our working directory to bin
WORKDIR /usr/src/protomolecule/bin

# Use npm to install deps for the JS project
RUN npm i

# Expose the listening port
EXPOSE 3000

# Start the NPM app
CMD ["node", "protomolecule.js"]