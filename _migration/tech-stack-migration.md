# Trassenscout → TILDA-aligned tech stack migration

Analysis date: 2026-06-04  
Reference target: [`tilda-geo/app`](../../tilda-geo/app) (`tilda-geo` v2)

This document compares **Trassenscout** (Blitz/Next 14, npm) with **TILDA Geo** (TanStack Start, Bun) and lists intended migrations, packages to drop when a TILDA replacement exists, and what should remain.

---

## Executive summary

Trassenscout is a large **Blitz 2** app on **Next.js 14** with **Blitz Auth**, **Blitz RPC**, **Prisma 5**, and **npm**. The target stack follows **TILDA Geo** for app framework, runtime, and **lint/format** (**TanStack Start**, **better-auth**, **Prisma 7**, **Bun**, **oxfmt**, **oxlint**).

| Concern | Trassenscout target | TILDA Geo (`tilda-geo/app`) |
|---------|---------------------|-----------------------------|
| **Format** | **oxfmt** (`oxfmt.config.ts`) | oxfmt |
| **Lint** | **oxlint** (`oxlint.config.mjs`) | oxlint |
| **ESLint CLI** | **none** | **none** (React Compiler via oxlint `jsPlugins` only) |

The migration is not a dependency swap only—it implies rewrites of routing, data fetching, auth, build/deploy, and most `src/server/**` boundaries.

---

## Platform & tooling migrations

| From (Trassenscout) | To (TILDA pattern) | Notes |
|---------------------|-------------------|--------|
| **Blitz 2** (`blitz`, `@blitzjs/*`) | **TanStack Start** (`@tanstack/react-start`, Vite, Nitro) | Blitz codegen, RPC, and auth conventions go away. |
| **Next.js 14** App Router | **TanStack Router** + Start file routes | ~200+ RPC call sites; App Router layouts → route tree. |
| **Webpack** (Next/Blitz) | **Vite** (`vite`, `@vitejs/plugin-react`) | Drop `next.config.js` pdfjs `devtool` hacks; re-validate `react-pdf` under Vite. |
| **npm** + `package-lock.json` | **Bun** + `bun.lock` | Scripts already use `bun` for some DB/ALKIS tasks; align all scripts and CI/Docker. |
| **ESLint 8** + `eslint-config-next` + `eslint-config-prettier` | **oxlint** (`oxlint`, `oxlint-tsgolint`, `oxlint.config.mjs`) | No `eslint` package / no `eslint.config.ts`. React Compiler: **`eslint-plugin-react-compiler`** loaded as oxlint **`jsPlugins`** on `**/*.tsx` (see TILDA). Build-time: **`babel-plugin-react-compiler`** in Vite. |
| **Prettier** + plugins (`organize-imports`, `prisma`, `tailwindcss`) | **oxfmt** (`oxfmt`, `oxfmt.config.ts`) | Formatting only; import sort / Tailwind class sort via oxfmt options (mirror TILDA’s `oxfmt.config.ts` patterns). |
| **Husky** (repo root) | **Husky** (`prepare`: `cd .. && husky app/.husky`) | Same idea; hook paths may move with monorepo layout. |
| **`npx taze`** (`updatePackages:*`) | **`bun scripts/updatePackages`** | TILDA has a dedicated update script. |
| **`npx knip`** | **`knip`** (devDependency, `cleanup-knip`) | Add as devDep; stop ad-hoc `npx`. |
| **`blitz codegen`** | **TanStack Router plugin** (`@tanstack/router-plugin`, generated `routeTree`) | Route types come from router codegen, not Blitz. |
| **`@next/env`** in Vitest | **Vite `loadEnv`** | See `tilda-geo/app/vitest.config.ts`. |
| **`@next/bundle-analyzer`** | Vite / Rolldown analysis (as needed) | No direct Next analyzer. |
| **Node Docker build** (`npx blitz build`) | **Bun + Vite build** → Nitro `.output` | TILDA `preview` runs Nitro server from `.output`. |
| **Prisma 5** (`prisma-client-js`, `db/schema.prisma`) | **Prisma 7** (`prisma-client`, `prisma.config.ts`, `prisma/schema.prisma`, `@prisma/adapter-pg`, `pg`) | Multi-schema, ESM client output, Bun runtime—major migration. |
| **React 18** | **React 19** | Align with TILDA; enable React Compiler via Babel plugin. |
| **TypeScript 5.9** | **TypeScript 6.x** | TILDA uses `6.0.3`; plan strictness (`strict: false` in TILDA today). |
| **Zod 3** | **Zod 4** | Breaking changes across server + forms. |
| **Blitz Auth** + `secure-password` | **better-auth** | Different session model; password/OAuth flows need redesign. |
| **Blitz RPC** (`useMutation` / `useQuery` from `@blitzjs/rpc`) | **TanStack Query** + **`createServerFn`** (`.functions.ts`) | TILDA: `src/server/**/*.functions.ts`. |
| **react-hook-form** + `@hookform/*` | **@tanstack/react-form** | TS already depends on `@tanstack/react-form`; forms layer is mostly RHF today. |
| **Next API routes** / `pages/api/rpc` | Start **server routes** + server functions | Public/export APIs may stay as HTTP routes. |
| **`next-router-mock`** | TanStack Router test utilities / integration tests | Remove once routing tests are rewritten. |
| **`react-remark`** | **react-markdown** + **remark-gfm** / **remark-breaks** | TILDA markdown stack. |
| **`csv-writer`** | **`@json2csv/plainjs`** | TILDA CSV export pattern. |
| **PostCSS + `autoprefixer`** (dep only) | **PostCSS** with `@tailwindcss/postcss` only | TS lists `autoprefixer` but `postcss.config.js` does not use it—safe to drop. |
| **Tailwind via Next** | **Tailwind 4** + **`@tailwindcss/vite`** | TILDA wires Tailwind in `vite.config.ts`. |
| **`imap-listener`** (nested npm + `tsc` + Node) | **Bun** subpackage (or merge into main repo scripts) | Align runtime with monorepo. |

### Lint & format (align with TILDA)

| Tool | Config | Notes |
|------|--------|--------|
| **oxfmt** | `oxfmt.config.ts` | Copy style from TILDA; TS-specific `ignorePatterns` / Tailwind stylesheet path |
| **oxlint** | **`oxlint.config.mjs`** | ESM config via `defineConfig` from `oxlint` |

**Required rule (both repos):**

```js
'typescript/switch-exhaustiveness-check': 'error',
```

**Optional:** all other `rules` / `overrides` from [`tilda-geo/app/oxlint.config.mjs`](../../tilda-geo/app/oxlint.config.mjs) — see also [`_migration/oxlint.config.mjs`](./oxlint.config.mjs) (TS starter with `.next/**`, `src/core/templates/**` ignores).

**TILDA `package.json` scripts:**

```json
"lint": "oxlint --fix -c oxlint.config.mjs",
"lint:check": "oxlint -c oxlint.config.mjs"
```

**DevDependencies (TILDA):** `oxlint`, `oxlint-tsgolint`, `eslint-plugin-react-compiler` (jsPlugin only — **not** the `eslint` package).

**Do not add:** `@biomejs/biome`, `eslint`, `eslint-config-next`, Prettier.

---

## Application architecture migrations

| Area | Trassenscout | Target (TILDA) |
|------|--------------|----------------|
| Entry / dev server | `blitz dev` (port 6173) | `bun run dev` → Vite (5173) + parallel watchers |
| Server boundary | `src/server/**/mutations`, `queries` + Blitz resolver | `src/server/**/*.functions.ts` with `createServerFn` |
| Client data | `useMutation`, `useQuery` (Blitz RPC) | `useQuery` / `useMutation` (TanStack Query) |
| Auth config | `blitz-auth-config.ts`, `blitz-server.ts`, `blitz-client.ts` | `better-auth` server + client plugins |
| DB path | `db/schema.prisma`, `db/migrations` | `prisma/schema.prisma`, `prisma/migrations` |
| Path alias | `@/*` → repo root | `@/*` → `./src/*` (and `@/scripts/*` if needed) |
| Env prefix | `NEXT_PUBLIC_*` | `VITE_*` (and shared root `.env` in TILDA) |
| Email preview | `NEXT_PUBLIC_APP_ORIGIN` + `email dev` | `VITE_APP_ORIGIN` + `email dev --dir src/emails` |
| PDF worker | `copyPdfWorker` → `public/` | Revisit under Vite static assets / `public/` |
| Instrumentation | Next `instrumentation.ts` + `@vercel/otel` | Re-map to Nitro/OTel pattern (TILDA-specific choice) |

---

## Packages to remove (when TILDA replacement exists)

Remove after the corresponding migration is done—not before.

### Framework & Next/Blitz

- `blitz`
- `@blitzjs/next`
- `@blitzjs/auth`
- `@blitzjs/rpc`
- `next`
- `eslint-config-next`
- `@next/bundle-analyzer`
- `next-router-mock`

### Lint & format (full ESLint + Prettier removal)

- `eslint`, `eslint-config-next`, `eslint-config-prettier`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- `.eslintrc.json` / `eslint.config.ts` — delete; **no ESLint CLI**
- `prettier`, `prettier-plugin-organize-imports`, `prettier-plugin-prisma`, `prettier-plugin-tailwindcss`
- `@biomejs/biome` / `biome.json` — TILDA migrated to **oxlint**; do not add Biome

### Forms & auth (replaced by TanStack + better-auth)

- `react-hook-form`
- `@hookform/error-message`
- `@hookform/resolvers`
- `secure-password`

### Build / tooling orphans

- `autoprefixer` (unused in PostCSS config)
- `@testing-library/react-hooks` (deprecated; use `@testing-library/react` only)
- `server-only` (revisit Start/server-fn boundaries)
- `zod-prisma` (optional dev generator; commented out in schema today)

### Markdown / CSV (after code migration)

- `react-remark` → `react-markdown` + remark plugins
- `csv-writer` → `@json2csv/plainjs`

---

## Packages to keep (TypeScript core & shared domain)

These stay through the migration (versions will bump to match TILDA where noted).

### TypeScript & types (critical)

- `typescript`
- `@types/node`, `@types/react`, `@types/react-dom` (React 19 types after upgrade)
- `@types/bun` / `bun-types`
- `@total-typescript/ts-reset`
- `@types/geojson`, `@types/papaparse`, `@types/dompurify`, `@types/uuid`, etc. (drop types for removed packages)

### Testing

- `vitest`, `@vitejs/plugin-react`, `@vitest/ui` (align major with TILDA 4.x when ready)
- `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`
- `@playwright/test`
- `jsdom`

### Database & validation

- `@prisma/client`, `prisma` (upgrade to v7 + adapter)
- `zod` (upgrade to v4)
- `pg` (add with Prisma adapter, as in TILDA)

### UI & styling (shared with TILDA)

- `react`, `react-dom`
- `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwind-merge`
- `@headlessui/react`, `@heroicons/react`, `lucide-react`
- `clsx` (TILDA often uses `es-toolkit` / `twMerge`—optional convergence later)

### Maps & geo (core product)

- `maplibre-gl`, `react-map-gl`
- `terra-draw`, `terra-draw-maplibre-gl-adapter`
- `pmtiles`
- `@turf/turf` and granular `@turf/*` packages in use

### State, URLs, utilities

- `zustand`
- `nuqs`
- `date-fns`, `@date-fns/tz`
- `dompurify`, `tiny-invariant`, `adler-32`
- `papaparse` (+ `@types/papaparse`)

### Forms (already partially aligned)

- `@tanstack/react-form` (expand to replace RHF)

### Email & ops

- `@getbrevo/brevo`
- `react-email`, `@react-email/components`, `@react-email/render` (bump toward TILDA 6.x)
- `preview-email`, `@types/preview-email`
- `husky`, `@clack/prompts`
- `sharp`

### AWS (keep; TILDA holds SDK in devDependencies for scripts—decide dep vs devDep)

- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`

### i18n

- `react-intl` (bump 7 → 10 like TILDA)

---

## Trassenscout-specific — keep unless product drops feature

No direct TILDA equivalent; do **not** remove just because TILDA lacks them.

| Package | Role |
|---------|------|
| `@ai-sdk/openai`, `ai` | AI summaries / extraction |
| `langfuse`, `langfuse-vercel` | LLM tracing |
| `@vercel/otel`, OpenTelemetry packages | Observability |
| `react-pdf`, `pdfjs-dist` (worker copy script) | PDF viewing |
| `recharts` | Survey/analysis charts |
| `react-datasheet-grid` | Spreadsheet-style grids |
| `@better-upload/client`, `@better-upload/server` | S3 presigned uploads (TILDA uses different upload server fns) |
| `react-dropzone` | File drop UX |
| `@iframe-resizer/react` | Embedded iframes |
| `@socialgouv/matomo-next` | Analytics |
| `react-number-format` | Formatted numeric inputs |
| `@radix-ui/react-progress` | Progress UI |
| `exifr` | Image EXIF |
| `datum-diff` | Coordinate/datum helpers |
| `ua-parser-js` | User-agent parsing |
| `uuid` | IDs (may converge with `cuid` from better-auth over time) |
| `@mapgrab/map-interface`, `@mapgrab/playwright` | Map E2E helpers |
| `@fontsource/red-hat-text` | Brand typography |
| `@iframe-resizer/react` | Embed resizing |
| `react-intl` messages / catalog | Product copy |
| `imapflow` (in `imap-listener/`) | Email ingestion service |

Optional convergence later (not required for platform migration):

- `clsx` → patterns with `tailwind-merge` / `es-toolkit`
- Upload stack → TILDA-style `uploads.functions.ts` without `@better-upload` if you rewrite presign flow

---

## DevDependencies to add

| Package | Purpose |
|---------|---------|
| **`oxfmt`** | Formatting (import sort, Tailwind sort, `sortPackageJson`, etc.) |
| **`oxlint`**, **`oxlint-tsgolint`** | Linting (`typeAware: true`); config **`oxlint.config.mjs`** |
| **`eslint-plugin-react-compiler`** | React Compiler rule via oxlint `jsPlugins` on `**/*.tsx` only (not a separate ESLint run) |
| `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-query`, plugins | App framework (from TILDA) |
| `@tanstack/router-plugin`, `@tanstack/devtools-vite` | Router codegen & DX |
| `vite`, `nitro` | Build & SSR output |
| `@tailwindcss/vite` | Tailwind in Vite |
| `better-auth` | Authentication |
| `@prisma/adapter-pg`, `pg` | Prisma 7 + Postgres |
| `babel-plugin-react-compiler` | React Compiler at build time (Vite) |
| `knip` | Dead code |
| `dotenv` | Script env loading |
| `bun-types` | Bun typings in app |

**Explicitly not adding:** `eslint`, `@biomejs/biome`, `@typescript-eslint/*`, `eslint-config-*`.

---

## Migration phases (suggested order)

1. **Tooling**: Bun, **oxfmt**, **oxlint**, knip; remove ESLint + Prettier; keep app on Blitz temporarily if needed.
2. **Prisma 7**: schema path, client generator, migrations, `adapter-pg`.
3. **Greenfield Start app** or parallel app shell: Vite + Router + Query.
4. **Auth**: better-auth + session migration plan for existing users/passwords.
5. **Server layer**: port RPC modules to `*.functions.ts` + Query hooks (batch by domain: auth → projects → uploads → …).
6. **Routes**: App Router pages → file routes; modals and parallel routes redesigned.
7. **Forms**: RHF → TanStack Form per feature area.
8. **Remove Blitz/Next** and delete packages listed in [Packages to remove](#packages-to-remove-when-tilda-replacement-exists).
9. **Docker/CI**: Bun install, `vite build`, Nitro deploy; drop `blitz build`.
10. **`imap-listener`**: Bunify and align env with main app.

---

## Quick reference: script mapping

| Trassenscout | TILDA (target) |
|--------------|----------------|
| `npm run dev` | `bun run dev` |
| `npm run build` | `bun run build` |
| `npm run check` | `bun run check` (parallel type-check, lint, format, test-run) |
| `npm run lint` / `format` | `oxlint --fix -c oxlint.config.mjs` / `oxfmt --write` |
| `npm run migrate` | `bun run migrate` |
| `blitz prisma studio` | `bun run studio` |
| `npm run bleach` | `bun run bleach` |

---

## Repo layout after migration

```
trassenscout/
  _migration/           # this folder
  prisma/               # was db/
  src/
    routes/             # TanStack Router
    server/**/*.functions.ts
  vite.config.ts
  oxfmt.config.ts
  oxlint.config.mjs     # ESM; no biome.json, no eslint.config.ts
  bun.lock
```

---

## Open decisions

- **Type-aware oxlint rules**: TILDA keeps many `typescript/*` rules **off** initially; enable incrementally after `oxlint-tsgolint` + `typeAware: true` is stable on the TS tree.
- **Auth**: migrate `secure-password` hashes to better-auth-compatible storage (one-time migration script).
- **AI/OTel**: keep Vercel-specific packages or standardize on TILDA/hosting observability.
- **Uploads**: keep `@better-upload` vs rewrite to TILDA presign/server-fn pattern.

---

*Generated from `package.json`, configs, and usage scans in Trassenscout and `tilda-geo/app`.*
