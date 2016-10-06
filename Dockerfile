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
        autoconf \
        automake \
        build-essential \
        libass-dev \
        libgpac-dev \
        libtheora-dev \
        libtool \
        libvorbis-dev \
        libmp3lame-dev \
        pkg-config \
        git-core

# Yasm
RUN git clone git://github.com/yasm/yasm.git \
    && cd yasm \
    && ./autogen.sh \
    && ./configure \
    && make -j`getconf _NPROCESSORS_ONLN` \
    && make install \
    && make distclean \
    && cd /tmp \
    && rm -rf /tmp/yasm

# libopus
RUN git clone git://git.opus-codec.org/opus.git \
    && cd opus \
    && ./autogen.sh \
    && ./configure --disable-shared \
    && make -j`getconf _NPROCESSORS_ONLN` \
    && make install \
    && make distclean \
    && cd /tmp \
    && rm -rf /tmp/opus

## libvpx
RUN git clone https://chromium.googlesource.com/webm/libvpx \
    && cd libvpx \
    && ./configure --disable-shared \
    && make -j`getconf _NPROCESSORS_ONLN` \
    && make install \
    && make clean \
    && cd /tmp \
    && rm -rf /tmp/libvpx

# AAC
RUN     wget -O fdk-aac.tar.gz https://github.com/mstorsjo/fdk-aac/tarball/master \
	&& tar xzvf fdk-aac.tar.gz \
	&& cd mstorsjo-fdk-aac* \
	&& autoreconf -fiv \
	&& ./configure --disable-shared \
	&& make \
	&& make install

# ffmpeg
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