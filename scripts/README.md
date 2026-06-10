# Scripts

Bun-native TypeScript utilities for local development, database sync, and maintenance. Invoked via `bun scripts/...` or `bun run <script>` from [`package.json`](../package.json).

## Conventions

| Pattern        | Use                                                                           |
| -------------- | ----------------------------------------------------------------------------- |
| Entry          | `if (import.meta.main) { await main() }`; export `main` when useful for tests |
| Paths          | `import.meta.dir`                                                             |
| Shell          | `$` from `bun` (docker, prisma, file ops)                                     |
| TTY subprocess | `Bun.spawn` when stdin/stdout must be inherited                               |
| Files          | `Bun.file`, `Bun.write` — avoid sync `node:fs`                                |
| Env            | Bun auto-loads `.env`; validated subsets via [`shared/env.ts`](shared/env.ts) |

## Index

| Folder                                                         | Purpose                                                              |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`predev/`](predev/)                                           | Steps run before `bun run dev` (docker, migrations, package updates) |
| [`db-pull/`](db-pull/)                                         | Remote dump + local/staging restore                                  |
| [`prisma-generate-placeholder/`](prisma-generate-placeholder/) | `postinstall` Prisma generate without a live DB                      |
| [`alkis-wfs/`](alkis-wfs/)                                     | WFS audit and config regeneration                                    |
| [`csv-import/`](csv-import/)                                   | Google Sheets → API import (manual)                                  |
| [`updatePackages/`](updatePackages/)                           | Interactive `taze` updates                                           |
| [`test/`](test/)                                               | Test DB docker lifecycle                                             |
| [`generate-favicons/`](generate-favicons/)                     | Favicon assets from SVG                                              |
| [`ask-stop-docker.ts`](ask-stop-docker.ts)                     | `postdev` prompt to stop compose                                     |
