# About

Helper script to pull the production database for local development. Handles data anonymization.

## Initial Setup

1.  Configure [`.env.local`](../../.env.local) based on [`.env.local.example`](../../.env.local.example)
2.  Setup SSH tunnels for production and staging

## Run

```sh
ssh trassenscout-production-postgres-tunnel # for staging: `ssh trassenscout-staging-postgres-tunnel` – run in separate terminal
npm run db:getDump # or npm run db:getDump:staging
npm run db:restoreDump
```
