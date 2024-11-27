FROM node:18-bullseye-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install-clean --legacy-peer-deps

# see .dockerignore for what is getting copied
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_APP_ORIGIN
ARG NEXT_PUBLIC_APP_ENV

RUN npx blitz@2.1.3 prisma generate
RUN npx blitz@2.1.3 build

RUN npm install --global pm2

CMD npx blitz@2.1.3 prisma migrate deploy && exec pm2-runtime node -- ./node_modules/next/dist/bin/next start -p 3000
