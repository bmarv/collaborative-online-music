FROM debian:11.0

WORKDIR /collaborative-online-music
COPY . .
EXPOSE 3000

RUN \
    apt-get update && apt-get install --no-install-recommends -y \
    nodejs \
    npm \
    ffmpeg \
    openssl \
    make

RUN \
    npm i \
    && make configure-and-sign-ssl-cert

RUN \
    npm run dev
