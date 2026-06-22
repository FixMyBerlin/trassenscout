# Docker runtime & GDAL — Trassenscout → TanStack Start (TILDA-aligned)

Analysis date: 2026-06-05  
Reference: [`tilda-geo/app`](../../tilda-geo/app), [`tilda-geo/app.Dockerfile`](../../tilda-geo/app.Dockerfile)  
Companion: [`tooling.md`](./tooling.md) §11, [`tech-stack-migration.md`](./tech-stack-migration.md), [`db-migration.md`](./db-migration.md), [`env-check.md`](./env-check.md)

This document compares **Docker images, compose, deploy, and GDAL** between Trassenscout today and the TILDA pattern for a **Bun + TanStack Start (Nitro)** app. It does **not** cover TILDA-only infrastructure (processing, tiles/Martin, cache proxy, monorepo root `.env` layout).

---

## Executive summary

| Area             | Trassenscout today                                      | TILDA (`tilda-geo`)                                             | Target for TS                                             |
| ---------------- | ------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| App base image   | `node:24-trixie-slim` (3-stage)                         | `oven/bun:1` (single stage)                                     | `oven/bun:1`                                              |
| Build            | `npm` + `npx blitz build` → `.next`                     | `bun run build` (Vite) → `.output`                              | Same as TILDA                                             |
| Runtime          | `pm2-runtime` + `next start` on **3000**                | `bun .output/server/index.mjs` on **4000**                      | Nitro Bun server, port **4000**                           |
| GDAL             | `gdal-bin` in **runner** stage only                     | `gdal-bin` + `curl` in app image                                | `gdal-bin` + `curl` (healthcheck)                         |
| Prisma on deploy | `npx blitz prisma migrate deploy`                       | `bunx prisma migrate deploy`                                    | `bunx prisma migrate deploy`                              |
| Local dev        | `blitz dev` on host; compose = `db` (+ `imap-listener`) | `bun run dev` on host; compose = `db` (+ `tiles`)               | `bun run dev` on host; compose = `db` (+ `imap-listener`) |
| App in Docker    | production only                                         | production only (`--profile frontend` exists but not daily dev) | production only                                           |
| Server compose   | Traefik → app **3000**                                  | Traefik → app **4000**                                          | Update ports + healthcheck                                |
| `imap-listener`  | Separate `node:24-trixie-slim` image                    | N/A                                                             | Keep separate image for now (Node)                        |

**GDAL:** install `gdal-bin` from the image distro’s apt repos — same as today. No version pin, no runtime version check. TILDA’s GDAL version gate exists only for an export metadata feature TS does not have.

---

## GDAL

TS uses GDAL in exactly one production path: **`ogr2ogr`** in `src/server/alkis/utils/alkisWfs.ts` to convert GML/XML WFS responses to GeoJSON (`-f GeoJSON /vsistdout/ … -t_srs EPSG:4326`). JSON-capable WFS endpoints skip GDAL entirely.

That is a standard conversion shipped in `gdal-bin` for many years. **Whatever GDAL version Debian provides on the base image is enough** — no minimum version in code, nothing to validate in CI.

|                  | Today                            | After migration                                      |
| ---------------- | -------------------------------- | ---------------------------------------------------- |
| Base image       | `node:24-trixie-slim`            | `oven/bun:1` (Debian Trixie since Bun ≥ 1.3.4)       |
| GDAL install     | `apt install gdal-bin` in runner | same line in app image                               |
| Behaviour change | —                                | none expected (same distro generation, same package) |

**Do not port from TILDA:** `checkGdalVersion()`, `gdal` CLI metadata edits, or the `app.Dockerfile` TODO about vector-edit GDAL versions — those serve TILDA’s export API only.

Dev-only `scripts/alkis-wfs/*` uses `ogr2ogr` on the host; not part of the app image.

---

## App image: today vs target

### Trassenscout today — `docker/app/Dockerfile`

Three-stage **Node/npm/Blitz** build:

| Stage     | Base                  | Role                                                    |
| --------- | --------------------- | ------------------------------------------------------- |
| `deps`    | `node:24-trixie-slim` | `npm install-clean --legacy-peer-deps`                  |
| `builder` | `node:24-trixie-slim` | `blitz prisma generate`, `copyPdfWorker`, `blitz build` |
| `runner`  | `node:24-trixie-slim` | `gdal-bin`, global `pm2`, copy `.next` + `node_modules` |

Runtime CMD:

```dockerfile
CMD npx blitz@2.2.4 prisma migrate deploy && exec pm2-runtime node -- ./node_modules/next/dist/bin/next start -p 3000
```

Characteristics:

- Full `node_modules` in production image (large).
- GDAL only in runner (correct layer for runtime).
- Build args: `NEXT_PUBLIC_APP_ORIGIN`, `NEXT_PUBLIC_APP_ENV`.
- Runs as `USER 1000:1000`.

### TILDA reference — `app.Dockerfile`

Single-stage **Bun + Vite + Nitro (`preset: 'bun'`)**:

| Step            | Action                                                                |
| --------------- | --------------------------------------------------------------------- |
| Base            | `oven/bun:1`                                                          |
| System packages | `gdal-bin`, `curl`                                                    |
| Deps            | `bun install --frozen-lockfile --ignore-scripts` (no schema yet)      |
| Source          | `COPY app` (monorepo: app lives under `app/`)                         |
| Prisma          | `bun scripts/prisma-generate-placeholder/index.ts`                    |
| Build           | `ARG/ENV VITE_APP_*`, `bun run build` → `.output/`                    |
| User            | `chown` + `USER bun`                                                  |
| CMD             | `bunx prisma migrate deploy && exec bun run .output/server/index.mjs` |

Nitro listens on **4000** (`PORT` / `NITRO_PORT` in compose). Healthcheck uses `curl` against `127.0.0.1:4000`.

TILDA compose also sets `NITRO_BUN_IDLE_TIMEOUT: 120` for long-running export responses. TS has no export API today; consider similar timeout if ALKIS/WFS or large downloads exceed Bun’s default idle window.

### Target — Trassenscout `docker/app/Dockerfile`

Adapt TILDA’s pattern to a **single-repo** layout (no `app/` prefix in `COPY` paths):

```dockerfile
# TanStack Start (Vite + Nitro preset bun)
FROM oven/bun:1 AS base

RUN apt-get update && \
    apt-get install -y --no-install-recommends gdal-bin curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

# Dummy DATABASE_* — no live DB at build time (port from TILDA prisma-generate-placeholder)
RUN bun scripts/prisma-generate-placeholder/index.ts
RUN bun run copyPdfWorker
# react-pdf worker must exist before Vite build (same concern as today)

ARG VITE_APP_ENV
ARG VITE_APP_ORIGIN
ENV VITE_APP_ENV=${VITE_APP_ENV}
ENV VITE_APP_ORIGIN=${VITE_APP_ORIGIN}
RUN bun run build

RUN chown -R bun:bun /app
USER bun

ENV TZ=Europe/Berlin
EXPOSE 4000

CMD ["/bin/sh", "-c", "bunx prisma migrate deploy && exec bun run .output/server/index.mjs"]
```

**Differences from TILDA to keep TS-specific:**

| Item            | Notes                                                                                |
| --------------- | ------------------------------------------------------------------------------------ |
| `COPY . .`      | Repo root is the app (TILDA copies `app/` subtree)                                   |
| `copyPdfWorker` | Still required until `react-pdf` worker is handled in Vite build                     |
| No `patches/`   | Add `COPY patches` only if Bun patches are introduced                                |
| `.dockerignore` | Replace `.next` with `.output`; ensure `bun.lock`, `bunfig.toml` are **not** ignored |

**Drop from current Dockerfile:**

- `pm2`, `pm2-runtime`
- `next.config.js`, `.next` copies
- `npx blitz@*` invocations
- Separate deps/builder/runner stages (Nitro output is self-contained under `.output`)

---

## Compose & deploy

### Local development — `docker-compose.yml`

**Daily dev:** `bun run dev` on the host (Vite HMR), same model as TILDA. Docker is only for dependencies — not for running the app.

| Service         | Image / build                     | Port      | Notes                                     |
| --------------- | --------------------------------- | --------- | ----------------------------------------- |
| `db`            | `postgres:16-alpine`              | 6001→5432 | `ts-db`; started by `predev:check_docker` |
| `imap-listener` | `docker/imap-listener/Dockerfile` | 3100      | Optional; separate Node image             |

`predev` ensures the DB container is up; the app connects to `localhost:6001`. No local `app` service in compose — the production image is for staging/production deploy only.

### Production — `docker-compose.server.yml`

Changes required for TanStack Start:

| Setting                            | Today                           | Target                                                                |
| ---------------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| App port mapping                   | `3000:3000`                     | `4000:4000`                                                           |
| Traefik `loadbalancer.server.port` | `3000`                          | `4000`                                                                |
| App healthcheck                    | none                            | `curl -f http://127.0.0.1:4000/` (copy TILDA)                         |
| `TS_API_WEBHOOK_URL` (setup-env)   | `http://app:3000/api/...`       | `http://app:4000/api/...`                                             |
| Image tag env                      | `${NEXT_PUBLIC_APP_ENV}-latest` | `${VITE_APP_ENV}` or `${ENVIRONMENT}-latest` (align with GitHub vars) |
| Runtime env                        | `DATABASE_URL` via `.env`       | Split `DATABASE_*` per [`db-migration.md`](./db-migration.md)         |

`imap-listener` depends on `app`; webhook URL must track the new internal port.

### CI / ECR — `.github/workflows/deploy-app.yml`

| Step           | Today                     | Target                                               |
| -------------- | ------------------------- | ---------------------------------------------------- |
| Dockerfile     | `./docker/app/Dockerfile` | same path (rewritten content)                        |
| Build args     | `NEXT_PUBLIC_APP_*`       | `VITE_APP_ENV`, `VITE_APP_ORIGIN`                    |
| Diff paths     | `docker/` included        | unchanged                                            |
| Registry cache | GHA only                  | Optional: registry cache like TILDA `deploy-app.yml` |

`setup-env.yml` must emit `VITE_APP_*` (and/or `ENVIRONMENT`) instead of `NEXT_PUBLIC_*` in generated `.env` (see [`env-check.md`](./env-check.md) for manifest-driven generation and drift checks).

### `imap-listener` — `docker/imap-listener/Dockerfile`

Stays on **`node:24-trixie-slim`** + `npm ci` + `tsc` for now ([`tech-stack-migration.md`](./tech-stack-migration.md) § imap-listener).

Not blocking app migration. Later: Bun compile or merge into main repo scripts.

No GDAL in imap-listener image.

---

## Developer workflow (Docker-related scripts)

| Script                 | Trassenscout today                            | TILDA                                                       | Target                                             |
| ---------------------- | --------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `predev:check_docker`  | `docker compose up -d` if `ts-db` not running | `predev:1docker` → starts compose `db` (+ `tiles` in TILDA) | Keep: ensure `ts-db` is running                    |
| `postdev`              | `bun scripts/ask-stop-docker.ts`              | —                                                           | Keep optional stop prompt                          |
| `pretest` / `posttest` | Ephemeral `postgres:16-alpine` on 6002        | TILDA uses compose db                                       | Unchanged ([`db-migration.md`](./db-migration.md)) |

---

## `.dockerignore` (today)

```
.husky
.next          → change to .output
integrations
test
.env
.editorconfig
imap-listener
node_modules
```

After migration, confirm `public/` (PDF worker), `prisma/` or `db/`, and `emails/` are included in build context as needed.

---

## Smoke test (after TanStack scaffold)

```bash
docker build -f docker/app/Dockerfile \
  --build-arg VITE_APP_ENV=development \
  --build-arg VITE_APP_ORIGIN=http://localhost:4000 \
  -t trassenscout-app:test .
```

- [ ] Container starts; `prisma migrate deploy` then Nitro on **4000**
- [ ] Traefik / imap-listener webhook on `app:4000`
- [ ] Optional: manual ALKIS WFS smoke against a GML endpoint (same as staging today)

---

## What TS does **not** need from TILDA Docker

| TILDA artifact                                | Reason                                                  |
| --------------------------------------------- | ------------------------------------------------------- |
| `processing.Dockerfile`                       | Separate data pipeline                                  |
| `docker-compose.network.yml` / Martin / tiles | No vector tile server in TS                             |
| PostGIS `ghcr.io/baosystems/postgis:17-3.5`   | TS Prisma data mostly non-spatial; optional parity only |
| `NITRO_BUN_IDLE_TIMEOUT`                      | Only if long SSE/export endpoints appear                |
| GDAL version checks / metadata `gdal` CLI     | TILDA export-only; TS has no equivalent                 |
| Monorepo `bun --env-file=../.env`             | TS `.env` at repo root                                  |
| `COMPOSE_DEV_CONTAINER_PREFIX`                | Nice-to-have for multi-checkout; not required           |
| Compose `app` profile / dockerized local app  | Daily dev is `bun run dev` on host (same as TILDA)      |
| `cleanup-docker` script                       | Optional disk hygiene; not required for migration       |

---

## Suggested migration order (Docker only)

1. Land TanStack Start + `bun run build` → `.output` on host (blocking).
2. Add `scripts/prisma-generate-placeholder/` ([`db-migration.md`](./db-migration.md)).
3. Rewrite `docker/app/Dockerfile` to Bun/Nitro pattern (`gdal-bin` apt line unchanged in spirit).
4. Update `deploy-app.yml` build args (`VITE_APP_*`).
5. Update `docker-compose.server.yml` (port 4000, healthcheck, env names).
6. Update `setup-env.yml` (manifest + `generate-deploy-env`; see [`env-check.md`](./env-check.md)).
7. Deploy staging; smoke app + optional ALKIS WFS.
8. Later (non-blocking): imap-listener Bun migration.

Docker migration is **step 7** in [`tooling.md`](./tooling.md) suggested order — after Bun lockfile and build work, alongside CI.

---

## Quick reference

| Task            | Trassenscout today                 | Target (TILDA pattern)               |
| --------------- | ---------------------------------- | ------------------------------------ |
| App image       | `node:24-trixie-slim`, Blitz/Next  | `oven/bun:1`, Nitro `.output`        |
| App port        | 3000                               | 4000                                 |
| GDAL            | `gdal-bin` in runner               | `gdal-bin` in app image              |
| ALKIS           | `ogr2ogr` at runtime               | unchanged requirement                |
| Local dev       | `blitz dev` on host + compose `db` | `bun run dev` on host + compose `db` |
| Deploy migrate  | `blitz prisma migrate deploy`      | `bunx prisma migrate deploy`         |
| Process manager | pm2                                | none (`exec bun run .output/...`)    |

---

_Generated from `docker/`, compose files, deploy workflows, `src/server/alkis/utils/alkisWfs.ts`, and TILDA `app.Dockerfile`._
