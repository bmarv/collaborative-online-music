FROM debian:11.0

WORKDIR /collaborative-online-music
COPY . .

RUN \
    apt-get update && apt-get install --no-install-recommends -y \
    nodejs \
    npm \
    ffmpeg \
    openssl \
    make

RUN \
    npm i 

