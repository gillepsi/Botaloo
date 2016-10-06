FROM node:wheezy

ENV DEBIAN_FRONTEND noninteractive

# Install app external dependencies
RUN \
    apt-get update \
        --quiet \
#    && apt-get -qq update \
    && apt-get install \
            --yes \
            --no-install-recommends \
            --no-install-suggests \
#        -y nodejs npm \
        libav-tools \
        git-core \

# Debian installs 'node' as 'nodejs'
#    && update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10 \

# Create app directory
    && mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app module dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]