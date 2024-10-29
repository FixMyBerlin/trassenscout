FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install-clean --legacy-peer-deps

# see .dockerignore for what is getting copied
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_APP_ORIGIN
ARG NEXT_PUBLIC_APP_ENV

RUN npx blitz prisma generate && npx blitz build

RUN npm install --global pm2

CMD npx blitz prisma migrate deploy && exec pm2-runtime node -- ./node_modules/next/dist/bin/next start -p 3000
