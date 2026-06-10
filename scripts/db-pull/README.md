# About

Unified database tooling for local development and staging synchronization using [Bun Shell](https://bun.com/docs/runtime/shell). All scripts use shared helper functions and follow the same process flow with data anonymization.

## Prerequisites

- [Bun](https://bun.sh) installed on your system
- Docker running for database operations
- Set db-pull credentials in [`.env`](../../.env): `DATABASE_PRODUCTION_USER` / `DATABASE_PRODUCTION_PASSWORD` and the staging equivalents (see [`.env.example`](../../.env.example))
- Setup SSH tunnels for production and staging (`trassenscout-production-postgres-tunnel`, `trassenscout-staging-postgres-tunnel` in `~/.ssh/config`)

## Remote connection

db-pull reaches production/staging through those SSH tunnels. From the script's side the database is on tunnel `localhost` at a target-specific port (production `5434`, staging `5433`), database name `dbmaster`. [`remote-database-url.ts`](./remote-database-url.ts) builds the URL from those fixed defaults plus your tunnel credentials in `.env`.

## Local Development

Pull production or staging data to your local development environment:

```sh
# FIRST: Pull fresh data from PRODUCTION
# Terminal 1:
ssh trassenscout-production-postgres-tunnel
# Terminal 2:
bun run db-get-dump
# Now exit in Terminal 1:
exit

# OR: Pull fresh data from STAGING
# Terminal 1:
ssh trassenscout-staging-postgres-tunnel
# Terminal 2:
bun run db-get-dump-staging
# Now exit in Terminal 1:
exit

# THEN: Replace LOCAL data
bun run db-restore-local
```

## Staging Environment

Restore production data to the staging environment with anonymization, from your development machine:

```sh
# FIRST: Pull fresh data from PRODUCTION
# Terminal 1:
ssh trassenscout-production-postgres-tunnel
# Terminal 2:
bun run db-get-dump
# Now exit in Terminal 1:
exit

# THEN: Replace STAGING data
# Terminal 1:
ssh trassenscout-staging-postgres-tunnel
# Terminal 2:
bun run db-restore-staging
# Now migrate and exit in Terminal 1:
cd ./trassenscout-staging && docker compose restart app
exit
```

**What the scripts do:**

1. **Verify environment**: Checks `_Meta` table to ensure connected to correct database (prevents accidental production modification)
2. **Reset database**: Use `pre-restore.sql` to reset target database
3. **Restore data**: Restore dump to target database
4. **Anonymize data**: Use `post-restore.sql` to anonymize emails
5. Local: **Run migrations**: Execute `bun prisma migrate deploy`
6. Local: **Seed users**: Execute `SEED_ONLY_USERS=1 bun prisma db seed`
