FROM node:wheezy

ENV DEBIAN_FRONTEND noninteractive

# Install app external dependencies
RUN \
    apt-get update \
        --quiet \
    && apt-get install \
            --yes \
            --no-install-recommends \
            --no-install-suggests \
        libav-tools \
        git-core

# FFMPEG - Source https://github.com/cookkkie/mee6/blob/master/voice-bot/Dockerfile
RUN git clone git://source.ffmpeg.org/ffmpeg.git \
    && cd ffmpeg \
    && ./configure \
        --disable-debug \
        --enable-small \
	--enable-nonfree \
        --extra-libs=-ldl \
        --enable-libass \
        --enable-libopus \
 	--enable-libfdk-aac \
  	--enable-libfreetype \
  	--enable-libmp3lame \
        --enable-libtheora \
        --enable-libvorbis \
        --enable-libvpx \
	--enable-openssl \

    && make -j`getconf _NPROCESSORS_ONLN` \
    && make install \
    && make distclean \
    && cd /tmp \
    && rm -rf /tmp/ffmpeg    

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app module dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]