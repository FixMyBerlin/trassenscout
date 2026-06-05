# Package script naming convention

Comparison of **Trassenscout (TS)** `package.json` scripts vs **TILDA** (`../tilda-geo/app/package.json`), and the target convention for the TS → TILDA stack migration.

Related: [`tooling.md`](./tooling.md) §4 (target `package.json` scripts).

---

## Summary

| Aspect          | Trassenscout (today)                                             | TILDA (target)                                                                                    |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Runner          | `npm run` + shell `&&`                                           | `bun run` + `--parallel` / `--sequential`                                                         |
| Word separator  | Mixed: `:` for groups, camelCase (`copyPdfWorker`)               | **Kebab-case** with `-` for multi-word names                                                      |
| `:` meaning     | Namespace for almost everything (`db:getDump`, `migrate:create`) | **Only** for script groups orchestrated via `*` wildcards (or explicit sub-steps of those groups) |
| Ordering        | Implicit (`&&` order)                                            | Explicit (`1…`, `2…` suffix on child scripts)                                                     |
| Lifecycle hooks | npm-style `predev`, `postdev`, `pretest`                         | Same names where needed; children become `predev:*` under `bun run --sequential predev:*`         |

---

## Target convention (three rules)

### 1. Orchestrate with `bun run --parallel` or `--sequential` and `*`

Use Bun’s built-in runners instead of chaining with `&&` in the parent script.

```json
"check": "bun run --parallel type-check lint-check format-check test-run",
"predev": "bun run --sequential predev:*",
"format": "bun run --parallel format:*"
```

- **`--parallel`**: steps are independent (CI `check`, multi-target format).
- **`--sequential`**: order matters (predev checks, migrate-create pipeline).
- **`*` wildcard**: runs all scripts whose names match the prefix (e.g. `predev:*` → `predev:1docker`, `predev:2migration`, …).

Explicit lists are allowed when you must exclude some siblings (TILDA does this for `check` and `regions`):

```json
"check": "bun run --parallel type-check lint-check format-check test-run",
"regions": "bun run --sequential regions-masks regions-configs"
```

### 2. Use `:` only when there is a parallel or sequential group

The colon is a **group delimiter**, not a general namespace.

| Valid `:` usage                                  | Example                                                |
| ------------------------------------------------ | ------------------------------------------------------ |
| Parent of a `*` group                            | `predev` → `predev:1docker`, `predev:2migration`       |
| Nested step under a grouped workflow             | `migrate-create:1write`, `migrate-create:2format`      |
| Sibling runners referenced by a composite script | `regions:masks:*`, `format:github` under `format:*`    |
| Parallel dev processes                           | `dev` → `dev:vite`, `dev:topic-docs-watch` via `dev:*` |

Do **not** use `:` for standalone scripts that are never part of a `*` (or explicit parallel/sequential) group. Prefer kebab-case with `-` (rule 3).

### 3. Use `-` for multi-word names and logical groups (not `:`)

Top-level and standalone scripts use **kebab-case**:

- `type-check`, `migrate-create`, `db-pull`, `bleach-full`, `test-run`, `test-e2e-ui`
- Domain prefix + action: `db-get-dump`, `alkis-audit`, `env-check`

Think of `-` as replacing spaces in a phrase. Reserve `:` for **children** of an orchestrated group only.

**Numbering:** Prefix ordered steps with `1`, `2`, … immediately after the last `:` segment so sort order matches run order:

```json
"predev:1docker": "...",
"predev:2migration": "...",
"migrate-create:3open": "..."
```

---

## How Trassenscout names scripts today

TS relies on **npm lifecycle** names and **`:` as a universal separator**. Sequential work is done with `&&`, not Bun groups.

### Patterns in TS

| Pattern              | Examples                                                       | Issue vs target                                                            |
| -------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `domain:action`      | `migrate:create`, `migrate:check`, `db:getDump`, `alkis:audit` | `:` used without a `*` group; should be `migrate-create`, `db-get-dump`, … |
| Deep nesting         | `migrate:create:openMigration`                                 | Third level with `:`; target is flat group `migrate-create:3open`          |
| camelCase            | `copyPdfWorker`, `openTypes`, `mailpreview`                    | Inconsistent; target `copy-pdf-worker` or fold into `predev:*`             |
| Underscores          | `predev:check_docker`                                          | Target `predev:1docker` (numbered step)                                    |
| `npm run` chains     | `check`, `predev`, `seed`, `migrate:create`                    | Target `bun run --parallel` / `--sequential`                               |
| npm `pre*` / `post*` | `predev`, `postdev`, `pretest`, `posttest`                     | Keep hook names; move logic into `predev:*` where possible                 |
| Variant with `:`     | `bleach:full`, `updatePackages:major`                          | Target `bleach-full`, `update-packages-major`                              |
| Test variants        | `test:watch`, `test:ui`                                        | Target `test-watch`, `test-ui` (unless grouped under `test:*`)             |

### TS script inventory (grouped by domain)

| Script                                                                                          | Command style           |
| ----------------------------------------------------------------------------------------------- | ----------------------- |
| `start`, `dev`, `build`, `debug`, `studio`, `release`, `prepare`, `knip`                        | Single command          |
| `predev`, `postdev`, `prebuild`                                                                 | Lifecycle / chain       |
| `predev:check_docker`                                                                           | Sub-step with `:`       |
| `codegen`, `copyPdfWorker`                                                                      | Standalone camelCase    |
| `migrate`, `migrate:create`, `migrate:create:openMigration`, `migrate:check`, `migrate:compare` | DB migrate family       |
| `db:getDump`, `db:getDump:staging`, `db:restore:local`, `db:restore:staging`                    | DB remote ops           |
| `alkis:audit`, `alkis:update-config`                                                            | ALKIS tooling           |
| `check`, `type-check`, `lint`, `format`, `test`                                                 | Quality gate            |
| `pretest`, `posttest`, `test:watch`, `test:ui`                                                  | Test + docker lifecycle |
| `seed`                                                                                          | Chain                   |
| `bleach`, `bleach:full`                                                                         | Cleanup                 |
| `updatePackages:major`, `updatePackages:minor`                                                  | Deps                    |
| `mailpreview`, `openTypes`                                                                      | Misc camelCase          |

`imap-listener/package.json` is a small satellite: only `dev:build` uses `:` (watch build alongside `dev`). When aligned, either `dev-build` as standalone or `dev` + `dev:1build` under `dev:*` if the main app gains a parallel dev group.

---

## How TILDA names scripts (reference)

TILDA is the reference implementation for the migration. It already follows rules 1–3 in most places.

### Orchestration examples (TILDA)

```json
"dev": "bun --env-file=../.env run --parallel dev:*",
"predev": "bun --env-file=../.env run --sequential predev:*",
"check": "bun run --parallel type-check lint:check format:check test-run",
"format": "bun run --parallel format:*",
"migrate-create": "bun run --sequential migrate-create:*",
"env-check": "bun run --parallel env-check:*"
```

### Kebab-case top-level names (TILDA)

`db-pull`, `migrate-create`, `migrate-check`, `bleach-full`, `type-check`, `test-run`, `test-e2e-ui`, `topic-docs-build`, `static-datasets-update`, `mapbox-styles-update`, …

### `:` as group children (TILDA)

| Parent           | Children                                                                   |
| ---------------- | -------------------------------------------------------------------------- |
| `dev`            | `dev:vite`, `dev:topic-docs-watch`                                         |
| `predev`         | `predev:1docker`, `predev:2migration`, …                                   |
| `migrate-create` | `migrate-create:1write`, `migrate-create:2format`, `migrate-create:3open`  |
| `format`         | `format:main`, `format:github`, `format:docs`, …                           |
| `regions`        | `regions:masks`, `regions:configs` → each with `regions:masks:1prepare`, … |
| `env-check`      | `env-check:verify-manifest`; `env-check:docs:*`                            |

### TILDA exceptions / legacy to tighten when porting TS

These use `:` but are **not** driven by a parent `*` script. When applying rule 3 strictly, prefer `-`:

| Current (TILDA)                   | Stricter target                                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `lint:check`                      | `lint-check`                                                                                                               |
| `format:check`                    | `format-check` (already used inside `check`)                                                                               |
| `db-pull:pull`, `db-pull:restore` | `db-pull-pull`, `db-pull-restore` **or** `db-pull` + `db-pull:1pull` if `db-pull` becomes `bun run --sequential db-pull:*` |

Document these so new TS scripts do not copy the looser `lint:check` pattern unless the repo standardizes on it everywhere.

---

## Migration map: TS → target names

Suggested renames when rewriting `package.json` (commands abbreviated; see `tooling.md` for full bodies).

| Trassenscout (today)                              | Target name                               | Orchestration                                                            |
| ------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `predev` (chain)                                  | `predev`                                  | `bun run --sequential predev:*`                                          |
| `predev:check_docker`                             | `predev:1docker`                          | child of `predev:*`                                                      |
| `codegen`                                         | `predev:2codegen` or standalone `codegen` | child if always part of predev                                           |
| `copyPdfWorker`                                   | `predev:3copy-pdf-worker`                 | child                                                                    |
| `check`                                           | `check`                                   | `bun run --parallel migrate-check type-check lint format-check test-run` |
| `migrate:create` + `migrate:create:openMigration` | `migrate-create`                          | `bun run --sequential migrate-create:*`                                  |
|                                                   | `migrate-create:1write`                   | was create-only prisma                                                   |
|                                                   | `migrate-create:2format`                  | oxfmt migrations (new)                                                   |
|                                                   | `migrate-create:3open`                    | was `openMigration`                                                      |
| `migrate:check`                                   | `migrate-check`                           | standalone                                                               |
| `migrate:compare`                                 | `migrate-compare`                         | standalone                                                               |
| `db:getDump`                                      | `db-get-dump`                             | standalone                                                               |
| `db:getDump:staging`                              | `db-get-dump-staging`                     | standalone variant                                                       |
| `db:restore:local`                                | `db-restore-local`                        | standalone                                                               |
| `db:restore:staging`                              | `db-restore-staging`                      | standalone                                                               |
| `alkis:audit`                                     | `alkis-audit`                             | standalone                                                               |
| `alkis:update-config`                             | `alkis-update-config`                     | standalone                                                               |
| `bleach:full`                                     | `bleach-full`                             | standalone                                                               |
| `updatePackages:major`                            | `update-packages-major`                   | or single `update` script like TILDA                                     |
| `updatePackages:minor`                            | `update-packages-minor`                   |                                                                          |
| `test:watch`                                      | `test-watch`                              | standalone                                                               |
| `test:ui`                                         | `test-ui`                                 | standalone                                                               |
| `lint` (fix) / check variant                      | `lint` + `lint-check`                     | mirror TILDA                                                             |
| `format` (write) / check                          | `format` + `format-check`                 | `format` → `bun run --parallel format:*` if split by path                |
| `knip`                                            | `cleanup-knip`                            | match TILDA naming                                                       |

Lifecycle hooks (`prebuild`, `postdev`, `pretest`, `posttest`) can stay as npm/Bun lifecycle names; prefer moving repeatable steps into numbered `pretest:*` only if you introduce `bun run --sequential pretest:*`.

---

## Naming cheat sheet

```
# Standalone script (no group)
db-get-dump
migrate-check
type-check

# Group parent + wildcard children
"predev": "bun run --sequential predev:*"
"predev:1docker": "..."
"predev:2codegen": "..."

# Parallel group
"check": "bun run --parallel type-check lint-check format-check test-run"

# Nested group (orchestrated sub-pipeline)
"regions": "bun run --sequential regions-masks regions-configs"
"regions-masks": "bun run --sequential regions-masks:*"
"regions-masks:1prepare": "..."
```

**Do**

- `bun run --sequential migrate-create:*`
- `migrate-create`, `db-pull`, `bleach-full`
- Numbered children: `predev:1docker`

**Avoid**

- `npm run foo && npm run bar` for CI/check pipelines
- `migrate:create:openMigration` (colon as path separator for every level)
- `db:getDump:staging` (use `-` for variants unless under a `db-get-dump:*` group)
- `updatePackages:major` (camelCase + colon)

---

## Package manager note

TS today uses **npm** in script bodies (`npm run …`). Target is **bun** everywhere (`bun run`, `bun --env-file=…`), consistent with TILDA and `engines.bun` in the migrated `package.json`.

After rename, grep the repo for old script names (`migrate:create`, `db:getDump`, docs, CI, Husky) and update call sites.
