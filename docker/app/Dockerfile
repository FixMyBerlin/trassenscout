FROM node:22-bullseye-slim

WORKDIR /app

COPY package* ./

RUN npm install-clean --legacy-peer-deps

# see .dockerignore for what is getting copied
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV TZ=Europe/Berlin

ARG NEXT_PUBLIC_APP_ORIGIN
ARG NEXT_PUBLIC_APP_ENV

RUN npx blitz@2.2.2 prisma generate
RUN npx blitz@2.2.2 build

RUN npm install --global pm2

CMD npx blitz@2.2.2 prisma migrate deploy && exec pm2-runtime node -- ./node_modules/next/dist/bin/next start -p 3000
