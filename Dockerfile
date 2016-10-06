FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive

# Install app external dependencies
RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y nodejs npm
RUN apt-get install libav-tools

# Debian installs 'node' as 'nodejs'
RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app module dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]