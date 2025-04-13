FROM node:23-alpine

RUN apk add --no-cache \
    chromium=~135.0.7049.52-r0

LABEL org.opencontainers.image.source=https://github.com/potatoenergy/pt-ai
LABEL org.opencontainers.image.description="A Simple ChatBot for Pony Town"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

VOLUME ["/app/logs", "/app/plugins"]

ENV CHROMIUM_PATH=/usr/bin/chromium

CMD ["npm", "run", "dev"]
