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
# First, pull a fresh dump
# Terminal 1:
ssh trassenscout-production-postgres-tunnel
# Terminal 2:
npm run db:getDump
# Now exit in Terminal 1:
exit

# OR, to use staging…
# Terminal 1:
ssh trassenscout-staging-postgres-tunnel
# Terminal 2:
npm run db:getDump:staging
# Now exit in Terminal 1:
exit

# Then run…
npm run db:restore:local
```

## Staging Environment

Restore production data to the staging environment with anonymization, from your development machine:

```sh
# First, pull a fresh dump (run this manually when needed)
# Terminal 1:
ssh trassenscout-production-postgres-tunnel
# Terminal 2:
npm run db:getDump
# Now exit in Terminal 1:
exit

# Then restore to staging (uses existing dump.sql)
# Terminal 1:
ssh trassenscout-staging-postgres-tunnel
# Terminal 2:
npm run db:restore:staging
# Now migrate and exit in Terminal 1:
cd ./trassenscout-staging && docker compose restart app
exit
```

**What the scripts do:**

1. **Verify environment**: Checks `_Meta` table to ensure connected to correct database (prevents accidental production modification)
2. **Reset database**: Use `pre-restore.sql` to reset target database
3. **Restore data**: Restore dump to target database
4. **Anonymize data**: Use `post-restore.sql` to anonymize emails
5. Local: **Run migrations**: Execute `blitz prisma migrate deploy`
6. Local: **Seed users**: Execute `blitz db seed`
