# About

Unified database tooling for local development and staging synchronization using [Bun Shell](https://bun.com/docs/runtime/shell). All scripts use shared helper functions and follow the same process flow with data anonymization.

## Prerequisites

- [Bun](https://bun.sh) installed on your system
- Docker running for database operations
- Configure [`.env.local`](../../.env.local) based on [`.env.local.example`](../../.env.local.example)
- `DATABASE_URLˆ_STAGING` - Staging database URL
- Setup SSH tunnels for production and staging

## Local Development

Pull production or staging data to your local development environment:

```sh
# FIRST: Pull fresh data from PRODUCTION
# Terminal 1:
ssh trassenscout-production-postgres-tunnel
# Terminal 2:
npm run db:getDump
# Now exit in Terminal 1:
exit

# OR: Pull fresh data from STAGING
# Terminal 1:
ssh trassenscout-staging-postgres-tunnel
# Terminal 2:
npm run db:getDump:staging
# Now exit in Terminal 1:
exit

# THEN: Replace LOCAL data
npm run db:restore:local
```

## Staging Environment

Restore production data to the staging environment with anonymization, from your development machine:

```sh
# FIRST: Pull fresh data from PRODUCTION
# Terminal 1:
ssh trassenscout-production-postgres-tunnel
# Terminal 2:
npm run db:getDump
# Now exit in Terminal 1:
exit

# THEN: Replace STAGING data
# Terminal 1:
ssh trassenscout-staging-postgres-tunnel
# Terminal 2:
npm run db:restore:staging
# Now migrate and exit in Terminal 1:
cd ./trassenscout-staging && docker compose restart app
exit
```

## Test a Scaleway backup (issue #3264)

Verify that a daily production backup from the Scaleway object storage
(`ionos-backups` bucket) can actually be restored. The script downloads a
backup, spins up a **throwaway** PostgreSQL 16 container (`ts-backup-restore-test`
on port `6005`, pinned to `postgres:16-alpine` to match the dump's pg_dump 16.14)
and restores the dump into it. **Production and staging are never touched.**

```sh
# Restore the latest available backup into a throwaway container
npm run db:testBackup

# Or a specific day; remove the container afterwards
bun db/remote/test-backup-restore.ts 2026-06-29 --remove
```

Requires `SCW_ACCESS_KEY` / `SCW_SECRET_KEY` in `.env.local` and a running Docker
daemon. On success it reports the table count, key row counts and `_Meta.ENV`
(should be `production`), and keeps the container running so you can inspect the
restored data. The restored data is **not** anonymized – keep the container local.

**What the scripts do:**

1. **Verify environment**: Checks `_Meta` table to ensure connected to correct database (prevents accidental production modification)
2. **Reset database**: Use `pre-restore.sql` to reset target database
3. **Restore data**: Restore dump to target database
4. **Anonymize data**: Use `post-restore.sql` to anonymize emails
5. Local: **Run migrations**: Execute `blitz prisma migrate deploy`
6. Local: **Seed users**: Execute `blitz db seed`
