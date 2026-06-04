# Tooling migration: Trassenscout → TILDA pattern

Analysis date: 2026-06-04  
Reference: [`tilda-geo/app`](../../tilda-geo/app)  
Target: Trassenscout on **TanStack Start** (Vite + Nitro), **not** Next.js / Blitz.

Related: [`tech-stack-migration.md`](./tech-stack-migration.md) (full stack). This document focuses on **Bun**, **oxfmt**, **oxlint**, and developer workflow.

---

## Executive summary

| Layer | Trassenscout today | TILDA (`tilda-geo/app`) | Action for TS |
|-------|-------------------|-------------------------|---------------|
| Package manager | **npm** + `package-lock.json` | **Bun** + `bun.lock` + `bunfig.toml` | Adopt Bun fully |
| Formatter | **Prettier** + 3 plugins | **oxfmt** (`oxfmt.config.ts`) | Replace Prettier with oxfmt |
| Linter | **ESLint 8** + `eslint-config-next` | **oxlint** (`oxlint.config.mjs`, `oxlint-tsgolint`) | Replace ESLint with oxlint |
| React Compiler | ESLint plugin (`warn`) | oxlint `jsPlugins` + `babel-plugin-react-compiler` (`error`) | Copy TILDA oxlint override for `*.tsx` |
| ESLint CLI | full stack | **none** | Remove; keep `eslint-plugin-react-compiler` only for oxlint |
| Script runtime | npm for app; **Bun** for some scripts | Bun everywhere | Align all scripts to `bun run` |
| Dead code | `npx knip` (no config) | `knip` + `knip.jsonc` | Add pinned knip + config |
| Package updates | `npx taze` npm scripts | `bun scripts/updatePackages` + weekly predev check | Port update script |
| CI checks | Deploy/cron only — **no PR lint/type/test job** | `ci.yml`: type-check, lint, test-run | Add PR CI like TILDA |
| Git hooks | Husky **pre-push** only (type-check, lint, format) | Husky **pre-commit** (format) + **pre-push** (full check) | Add pre-commit format |

**Align with TILDA:** **oxfmt** + **oxlint** (`oxlint.config.mjs`). Required rule: `typescript/switch-exhaustiveness-check: 'error'`. Reference: [`oxlint.config.mjs`](./oxlint.config.mjs) and [`tilda-geo/app/oxlint.config.mjs`](../../tilda-geo/app/oxlint.config.mjs).

---

## TILDA tooling (reference)

### Bun

**`package.json` engines:**

```json
"engines": {
  "bun": ">=1.3.9",
  "node": ">=24.0.0"
}
```

**`bunfig.toml`** — delay fresh package releases (supply-chain hygiene):

```toml
[install]
minimumReleaseAge = 432000  # 5 days
minimumReleaseAgeExcludes = ["@types/bun", "typescript"]
```

**Patterns:**

- All scripts invoked via `bun run …`
- Env: `bun --env-file=../.env run …` (monorepo root `.env`; TS can use repo-root `.env` directly)
- `bleach` / `bleach-full`: remove `node_modules`, lockfile, build output; `bun install`
- `postinstall`: Prisma generate placeholder script
- `prepare`: `cd .. && husky app/.husky` (monorepo layout)
- Docker: `oven/bun:1`, `bun install --frozen-lockfile`, `bun run build`, Nitro `.output`

### oxfmt

**Package:** `oxfmt@^0.49.0`  
**Config:** `oxfmt.config.ts`

| Option | TILDA value | Trassenscout target |
|--------|-------------|---------------------|
| `useTabs` | `false` | `false` |
| `tabWidth` | `2` | `2` |
| `printWidth` | `100` | `100` |
| `singleQuote` | `true` | **`false`** (keep current double quotes — do not match TILDA) |
| `jsxSingleQuote` | `false` | `false` |
| `semi` | `false` |
| `trailingComma` | `'all'` |
| `arrowParens` | `'always'` |
| `endOfLine` | `'lf'` |
| `sortImports.newlinesBetween` | `false` |
| `sortTailwindcss.stylesheet` | `src/components/shared/layouts/global.css` |
| `sortTailwindcss.functions` | `['twMerge', 'twJoin']` |
| `sortPackageJson` | `true` |

**`ignorePatterns`:** generated route tree, large geojson/static data.

**Scripts:** `NODE_OPTIONS='--disable-warning=ExperimentalWarning' oxfmt --write …`  
Used in `format`, `migrate-create:2format`, codegen follow-ups (topic-docs, etc.).

### oxlint

**Packages:** `oxlint@^1.66.0`, `oxlint-tsgolint@^0.23.0`, `eslint-plugin-react-compiler` (jsPlugin only)  
**Config:** `oxlint.config.mjs` (ESM, `defineConfig` from `oxlint`)

```js
import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'react'],
  options: { typeAware: true },
  ignorePatterns: ['src/routeTree.gen.ts', '.output/**'],
  rules: {
    'typescript/switch-exhaustiveness-check': 'error', // required
    // optional: TILDA keeps these type-aware rules off initially — see TILDA config
    'typescript/no-floating-promises': 'off',
    // …
  },
  overrides: [
    { files: ['tests/**'], rules: { 'react/rules-of-hooks': 'off' } },
    { files: ['**/*.test.ts', '**/*.test.tsx'], rules: { 'typescript/no-non-null-assertion': 'off' } },
    {
      files: ['**/*.tsx'],
      jsPlugins: [{ name: 'react-compiler-js', specifier: 'eslint-plugin-react-compiler' }],
      rules: { 'react-compiler-js/react-compiler': 'error' },
    },
  ],
})
```

**Lint scripts:**

```bash
oxlint --fix -c oxlint.config.mjs
oxlint -c oxlint.config.mjs   # lint:check (no --fix)
```

**Inline suppressions:** `// oxlint-disable-next-line rule-id -- reason` (see TILDA codebase).

**No** `@biomejs/biome`, **no** `eslint` package, **no** `eslint.config.ts`.

### `check` script

```bash
bun run --parallel type-check lint format test-run
```

Format is a **check** (oxfmt rewrites tree; CI assumes clean tree or format is idempotent). TILDA pre-push runs `check` + deploy type-check variant.

### Editor / DX

TILDA monorepo `.vscode/settings.json` (pattern):

- Default formatter: **Oxc VS Code** (`oxc.oxc-vscode`) → oxfmt
- `prettier.enable: false`
- Recommended extension: `oxc.oxc-vscode` (oxfmt + oxlint diagnostics)
- No Biome extension (Biome removed from TILDA app)

---

## Trassenscout tooling (today)

### Package manager

- **npm** + `package-lock.json`
- `engines` not declared
- Bun used ad hoc: `db/remote/*`, `scripts/alkis-wfs/*`, `scripts/ask-stop-docker.ts`
- Nested **`imap-listener/`**: own `package.json`, npm-style `tsc` + `node`

### Prettier

**`.prettierrc`:**

| Option | TS value | TILDA (oxfmt) |
|--------|----------|---------------|
| `semi` | `false` | `false` ✓ |
| `singleQuote` | **`false`** | `true` (TILDA only — **TS keeps `false`**) |
| `printWidth` | `100` | `100` ✓ |
| `arrowParens` | `always` | `always` ✓ |
| Plugins | organize-imports, tailwindcss | built into oxfmt |
| `tailwindFunctions` | `twMerge`, `clsx`, `twJoin` | `twMerge`, `twJoin` |
| `tailwindAttributes` | `positionClasses`, `classNameOverwrites` | not configured |

**`.prettierignore`:** migrations, `.next`, lockfiles, etc.

**`prettier-plugin-prisma`:** in `package.json` but **not** listed in `.prettierrc` plugins — Prisma files use VS Code Prisma formatter instead.

### ESLint

**`.eslintrc.json`:**

- Extends: `next/core-web-vitals`, `prettier`
- React Compiler: **`warn`** (TILDA: **`error`** via dedicated ESLint 10 config)
- Custom `no-unused-expressions` rule
- Runs on all `.js,.ts,.tsx` with Next-specific rules

### Scripts

| Script | TS | Notes |
|--------|-----|-------|
| `lint` | `eslint --fix …` | Next + broad ESLint |
| `format` | `prettier … --write --experimental-cli` | glob `**/*.{js,jsx,ts,tsx,css,scss,html,md}` |
| `check` | sequential: migrate:check → type-check → lint → format → test | TILDA runs parallel, no migrate in check |
| `updatePackages:*` | `npx taze` + `npm install` | Same taze flags as TILDA (`--maturity-period 5`) |

### Git hooks

**`.husky/pre-push`:** `npm run type-check`, `lint`, `format` (tests disabled)

No pre-commit hook.

### CI

No workflow equivalent to TILDA `ci.yml` (type-check / lint / test on PR). Only deploy, cron, env setup.

### VS Code

- Prettier default formatter, ESLint fix on save
- Extensions recommend Prettier + ESLint
- Target: Oxc formatter + oxlint (drop Prettier/ESLint extensions as defaults)

---

## Copy from TILDA → adapt for TS

Assume greenfield TanStack Start layout (`src/routes/`, `vite.config.ts`, `prisma/`). Ignore Next/Blitz paths.

### 1. Files to add (copy & trim)

| File | Source | TS changes |
|------|--------|------------|
| `bunfig.toml` | Copy as-is | Same 5-day `minimumReleaseAge` |
| `oxfmt.config.ts` | Copy structure | Paths below |
| `oxlint.config.mjs` | Copy from TILDA / [`_migration/oxlint.config.mjs`](./oxlint.config.mjs) | Add `.next/**`, `src/core/templates/**` to `ignorePatterns` |
| `knip.jsonc` | New, TILDA-shaped | TS entry points / ignores |
| `scripts/updatePackages/index.ts` | Copy | Drop monorepo-specific bits if any |

### 2. `oxfmt.config.ts` — TS-specific values

```ts
import { defineConfig } from 'oxfmt'

export default defineConfig({
  singleQuote: false, // keep Trassenscout convention (Prettier today); TILDA uses true
  // …other style keys as TILDA except quotes…
  sortTailwindcss: {
    stylesheet: 'src/app/_components/layouts/global.css', // or new Start layout path, e.g. src/components/layouts/global.css
    functions: ['twMerge', 'twJoin', 'clsx'], // keep clsx (TS Prettier had it)
  },
  ignorePatterns: [
    'src/routeTree.gen.ts',
    // keep generated / vendor / large assets
    'public/pdf.worker.min.mjs',
  ],
  overrides: [
    // Add only if TS has long single-line locale files like TILDA translations/*.const.ts
  ],
})
```

**Decisions:**

| Topic | Recommendation |
|-------|----------------|
| `singleQuote` | **`false`** — keep existing double-quote style; no mass quote flip |
| `tailwindAttributes` | oxfmt has no direct Prettier `tailwindAttributes` equivalent — verify `positionClasses` / `classNameOverwrites` after first format run; add oxfmt override or rename to `className` if sort breaks |
| Prisma SQL migrations | Point `migrate-create:2format` at `./prisma/migrations` (was `db/migrations`) |
| Monorepo format scripts | **Skip** TILDA’s `format:github`, `format:docs`, `format:topic-docs`, `format:processing` unless TS becomes a monorepo |

### 3. `oxlint.config.mjs` — TS-specific

Start from [`_migration/oxlint.config.mjs`](./oxlint.config.mjs) (mirrors TILDA with TS ignores).

| Item | Action |
|------|--------|
| **Required** | `'typescript/switch-exhaustiveness-check': 'error'` |
| **Optional** | All other `rules` / `overrides` from TILDA — enable type-aware rules later |
| **ignorePatterns** | `src/routeTree.gen.ts`, `.output/**`, `.next/**`, `src/core/templates/**` |
| **React Compiler** | Keep TILDA `jsPlugins` block for `**/*.tsx` |

### 4. `package.json` scripts (target)

```json
{
  "type": "module",
  "engines": { "bun": ">=1.3.9", "node": ">=24.0.0" },
  "scripts": {
    "dev": "bun --env-file=.env run --parallel dev:*",
    "dev:vite": "FORCE_COLOR=1 vite dev --host 127.0.0.1 --port 6173",
    "build": "vite build",
    "preview": "cd .output && NITRO_PORT=6173 NITRO_HOST=127.0.0.1 bun --env-file=.env ./server/index.mjs",
    "bleach": "rm -rf node_modules/ .output/ && bun install",
    "bleach-full": "rm bun.lock && bun run bleach",
    "type-check": "tsc --noEmit",
    "lint": "oxlint --fix -c oxlint.config.mjs",
    "lint:check": "oxlint -c oxlint.config.mjs",
    "format": "NODE_OPTIONS='--disable-warning=ExperimentalWarning' oxfmt --write .",
    "check": "bun run --parallel type-check lint format test-run",
    "test-run": "vitest run --passWithNoTests",
    "migrate-create": "bun run --sequential migrate-create:*",
    "migrate-create:1write": "bun --env-file=.env prisma migrate dev --create-only",
    "migrate-create:2format": "NODE_OPTIONS='--disable-warning=ExperimentalWarning' oxfmt --write ./prisma/migrations",
    "update": "bun scripts/updatePackages/index.ts",
    "cleanup-knip": "knip",
    "prepare": "husky"
  }
}
```

Port **6173** keeps muscle memory from current TS dev server; TILDA uses 5173 — either is fine.

### 5. DevDependencies to add / remove

**Add:**

```json
"oxfmt": "^0.49.0",
"oxlint": "^1.66.0",
"oxlint-tsgolint": "^0.23.0",
"eslint-plugin-react-compiler": "19.0.0-beta-ebf51a3-20250411",
"knip": "6.13.1",
"bun-types": "^1.3.14"
```

**Remove (after migration):**

- `prettier`, `prettier-plugin-*`
- `eslint`, `eslint-config-next`, `eslint-config-prettier`, `@typescript-eslint/*`
- `@biomejs/biome` / `biome.json` if introduced during a pilot

**Keep temporarily:** old ESLint until oxlint passes on full tree; migrate `eslint-disable` → `oxlint-disable`.

### 6. `tsconfig.json` alignment

Follow TILDA Start template (when scaffolding):

| Option | TILDA | TS today | Target |
|--------|-------|----------|--------|
| `paths["@/*"]` | `./src/*` | repo root `./*` | `./src/*` |
| `jsx` | `react-jsx` | `preserve` (Next) | `react-jsx` |
| `types` | `vite/client`, `bun-types`, `web` | `bun-types` | add `vite/client`, `web` |
| `strict` | `false` (+ `strictNullChecks`) | `true` | team choice; TILDA is looser |
| Next plugin | — | `plugins: [{ name: "next" }]` | remove |
| `include` | + `vite.config.ts`, `oxlint.config.mjs` | + `next-env.d.ts`, `.next/types` | Start set |

### 7. `vitest.config.ts`

Replace `@next/env` `loadEnvConfig` with Vite `loadEnv('test', repoRoot, 'VITE_')` (copy TILDA pattern). Update aliases to `@` → `./src`.

### 8. Husky

| Hook | TILDA | TS target |
|------|-------|-----------|
| pre-commit | `cd ./app && bun run format` | `bun run format` |
| pre-push | topic-docs + env docs + `check` + deploy type-check | `bun run check` (+ TS-specific stale-artifact checks if any) |

Drop `npm run` from hooks.

### 9. VS Code

Replace `.vscode/settings.json` / `extensions.json` with Oxc-focused settings (single-app repo):

```json
{
  "prettier.enable": false,
  "oxc.fmt.configPath": "oxfmt.config.ts",
  "oxc.lint.configPath": "oxlint.config.mjs",
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "[prisma]": { "editor.defaultFormatter": "Prisma.prisma" }
}
```

Extensions: `oxc.oxc-vscode`; remove Prettier / ESLint as defaults.

### 10. CI (new)

Add `.github/workflows/ci.yml` modeled on TILDA:

- `oven-sh/setup-bun@v2`
- `bun install --frozen-lockfile`
- `bun run type-check`
- `bun run lint`
- `bun run test-run` with `VITE_APP_ENV` / `VITE_APP_ORIGIN`

No Next build in PR CI unless you add a separate deploy pipeline job.

### 11. Docker

Replace `docker/app/Dockerfile` Node/npm/blitz pattern with TILDA `app.Dockerfile` pattern:

- Base `oven/bun:1`
- Copy `package.json`, `bun.lock`, `bunfig.toml`
- `bun install --frozen-lockfile --ignore-scripts` + explicit prisma generate
- `bun run build` → `.output`
- CMD: `prisma migrate deploy && bun .output/server/index.mjs`

Build args: `VITE_APP_*` instead of `NEXT_PUBLIC_*`.

### 12. `imap-listener/`

Separate npm package today. Options:

- **A)** Merge into main repo scripts with Bun (preferred long-term)
- **B)** Subpackage with own `bun.lock` / `bunfig.toml` and same oxfmt/oxlint configs

Not blocking app tooling migration.

---

## oxlint alignment checklist

| Item | TILDA | Trassenscout target |
|------|-------|---------------------|
| Config file | `oxlint.config.mjs` | `oxlint.config.mjs` (repo root) |
| Required rule | `typescript/switch-exhaustiveness-check: error` | same |
| Type-aware | `options.typeAware: true` + `oxlint-tsgolint` | same |
| React Compiler | `jsPlugins` + `eslint-plugin-react-compiler` on `*.tsx` | same |
| ESLint CLI | absent | absent |
| Biome | removed | do not add |

---

## TS-specific items (no TILDA equivalent)

These need conscious choices during tooling migration — not copy-paste from TILDA.

| Item | Notes |
|------|-------|
| **Quote style** | Keep **`singleQuote: false`** in `oxfmt.config.ts` (same as `.prettierrc` today). Do not adopt TILDA’s `singleQuote: true`. |
| **`clsx` in Tailwind sort** | Keep in `sortTailwindcss.functions`. |
| **`tailwindAttributes`** | Prettier-only today — validate oxfmt behavior on `positionClasses` / `classNameOverwrites`. |
| **`src/core/templates/*`** | Keep ignored from lint if templates remain generated. |
| **`check` includes migrate** | TS runs `migrate:check` in check; TILDA does not. Keep if desired (needs DB in CI or skip in CI). |
| **Strict TypeScript** | TS `strict: true` vs TILDA `strict: false` — tooling independent; decide separately. |
| **React Compiler severity** | `error` via oxlint on `*.tsx` + Babel plugin in Vite (TILDA pattern). |
| **eslint-disable comments** | Rename to `oxlint-disable` / `oxlint-disable-next-line` when switching linter. |
| **PDF worker** | `copyPdfWorker` script — keep; add generated worker to oxfmt ignore if needed. |
| **No PR CI today** | Adding TILDA-style CI is a net improvement, not a port. |
| **EditorConfig** | TS `.editorconfig` already matches (2 spaces, LF) — keep. |

---

## What TS does **not** need from TILDA

| TILDA feature | Reason to skip |
|---------------|----------------|
| `format:github`, `format:docs`, `format:topic-docs`, `format:processing` | Monorepo siblings |
| `predev:topic-docs`, topic-docs watch/build | TS product feature |
| `type-check-deploy` + static-datasets link/unlink | TILDA deploy/type-check workaround |
| `prepare`: `cd .. && husky app/.husky` | TS is single-app repo |
| `biome.json` / `@biomejs/biome` | TILDA migrated to oxlint |
| `eslint` / `eslint.config.ts` | No ESLint CLI in TILDA |
| `eslint-config-next` | No Next.js |
| Prettier stack | Replaced by oxfmt |
| Blitz codegen in scripts | Replaced by TanStack Router plugin |
| `@next/env` in Vitest | Replaced by Vite `loadEnv` |

---

## Suggested migration order (tooling only)

1. Add `bunfig.toml`, install Bun locally, generate `bun.lock` (can run alongside npm briefly).
2. Add `oxfmt.config.ts`, `oxlint.config.mjs` (from [`_migration/oxlint.config.mjs`](./oxlint.config.mjs)) — do **not** delete Prettier yet.
3. Add devDependencies (`oxfmt`, `oxlint`, `oxlint-tsgolint`, `eslint-plugin-react-compiler`); wire `format`, `lint`, `lint:check`, `check`.
4. Run `bun run format` once (expect large diff); fix Tailwind edge cases.
5. Run `bun run lint`; fix issues; migrate `eslint-disable` → `oxlint-disable`.
6. Update VS Code settings + Husky; add pre-commit format.
7. Add `ci.yml`; switch Docker to Bun build.
8. Remove Prettier + ESLint stack + `package-lock.json`.
9. Add `knip.jsonc` + `cleanup-knip` when Start entry graph is stable.

Tooling migration can start **before** TanStack Start scaffold; land oxfmt/oxlint on the current tree first, then adjust `ignorePatterns` when routes move to `src/routes/`.

---

## Quick reference

| Task | Trassenscout today | Target (TILDA pattern) |
|------|-------------------|------------------------|
| Install | `npm install` | `bun install` |
| Dev | `npm run dev` | `bun run dev` |
| Format | `npm run format` (Prettier) | `bun run format` (oxfmt) |
| Lint | `npm run lint` (ESLint+Next) | `bun run lint` (`oxlint --fix -c oxlint.config.mjs`) |
| Check | `npm run check` | `bun run check` |
| Update deps | `npm run updatePackages:major` | `bun run update` |

---

*Generated from `package.json`, config files, Husky, CI, Docker, and VS Code settings in Trassenscout and `tilda-geo/app`.*
