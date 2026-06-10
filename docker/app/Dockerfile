FROM oven/bun:1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends gdal-bin curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ARG VITE_APP_ORIGIN
ARG VITE_APP_ENV

ENV VITE_APP_ORIGIN=${VITE_APP_ORIGIN}
ENV VITE_APP_ENV=${VITE_APP_ENV}
ENV TZ=Europe/Berlin

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

RUN bun run postinstall
RUN bun run build

RUN chown -R bun:bun /app
USER bun

EXPOSE 4000

CMD ["/bin/sh", "-c", "bunx prisma migrate deploy && exec bun .output/server/index.mjs"]
