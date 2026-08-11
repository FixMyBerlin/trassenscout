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

# Install and run as the same user — bunfig's globalStore links node_modules into $HOME/.bun,
# so a root install + bun runtime fails with EACCES. Don't add a `USER root` layer below.
RUN chown bun:bun /app
USER bun

COPY --chown=bun:bun package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY --chown=bun:bun . .

RUN bun run postinstall
RUN bun run build

EXPOSE 4000

CMD ["/bin/sh", "-c", "bunx --no-install prisma migrate deploy && exec bun .output/server/index.mjs"]
