FROM node:18-bullseye-slim

WORKDIR /app

RUN npm install --global pm2

COPY package.json package-lock.json ./
RUN npm install-clean --legacy-peer-deps

# see .dockerignore for what is getting copied
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_APP_ORIGIN
ARG NEXT_PUBLIC_APP_ENV

RUN npx blitz prisma generate && npx blitz build

EXPOSE 3000

CMD npx blitz prisma migrate deploy && exec pm2-runtime node -- ./node_modules/next/dist/bin/next start -p 3000
