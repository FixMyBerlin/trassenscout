# Stage 1: Install dependencies
FROM node:24-trixie-slim AS deps

WORKDIR /app

COPY package* ./

RUN npm install-clean --legacy-peer-deps

# ---

# Stage 2: Build app
FROM node:24-trixie-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_APP_ORIGIN
ARG NEXT_PUBLIC_APP_ENV

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules

# see .dockerignore for what is getting copied
COPY . .

RUN npx blitz@2.2.4 prisma generate
RUN npx blitz@2.2.4 build

# ---

# Stage 3: Laufzeit-Image
FROM node:24-trixie-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gdal-bin && rm -rf /var/lib/apt/lists/*

RUN npm install --global pm2

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.js ./next.config.js
COPY --from=builder --chown=node:node /app/db ./db

ARG NEXT_PUBLIC_APP_ORIGIN
ARG NEXT_PUBLIC_APP_ENV

ENV NEXT_TELEMETRY_DISABLED=1
ENV TZ=Europe/Berlin

# Don't use root user for execution, see https://www.docker.com/blog/understanding-the-docker-user-instruction/
USER 1000:1000

CMD npx blitz@2.2.4 prisma migrate deploy && exec pm2-runtime node -- ./node_modules/next/dist/bin/next start -p 3000
