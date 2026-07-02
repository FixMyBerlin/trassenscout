# Production cutover runbook — TanStack Start migration

Repeat of the staging cutover (2026-07-02). All CI/workflow fixes are already on `develop` — only these environment-specific steps are needed.

Which vars/secrets each GitHub environment needs is defined in [`.github/env/deploy.manifest.json`](../.github/env/deploy.manifest.json) (docs: [`.github/README.md`](../.github/README.md)).

## Steps

1. **GitHub production environment:** add secrets `DATABASE_USER` and `DATABASE_PASSWORD` (strong, URL-safe, store in password manager). Keep the old `POSTGRES_*` secrets until after the cutover — `main` still uses them.

2. **Create the DB role on the production server** (before deploying — the DB volume only has the `postgres` role, and the app connects as `DATABASE_USER`):

   ```bash
   cd /srv/trassenscout-production
   docker compose exec db psql -U postgres -d postgres \
     -c "CREATE ROLE <DATABASE_USER> LOGIN SUPERUSER PASSWORD '<DATABASE_PASSWORD>';"
   ```

   SUPERUSER is needed because existing objects are owned by `postgres` and `prisma migrate deploy` must alter them.

3. **Deploy:** merge `develop` into `main` and push — this triggers "Deploy Production" (~10–15 min). Pick a low-traffic moment: short downtime, all users are logged out.

4. **Check:** `docker compose ps -a` on the server — `app` must be Up, not Restarting. Logs should show migrations applied and `Listening on: http://localhost:4000/`.

5. **Better Auth backfill (once)** — without it every login fails with "Credential account not found":

   ```bash
   docker compose exec app bun scripts/auth/migrateBetterAuthAccounts.ts          # dry run
   docker compose exec app bun scripts/auth/migrateBetterAuthAccounts.ts --write
   ```

   Users active in the last 5 months keep their password; older accounts must use "forgot password".

6. **Verify:** site loads, login with an existing account works, projects/surveys/uploads/admin click-through, next daily-cron run is green.

## Troubleshooting

| Symptom                               | Fix                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| Plain-text `404 page not found`       | app container down — check `docker compose logs app`                                       |
| `P1000: Authentication failed ...`    | role password ≠ secret — `ALTER USER <DATABASE_USER> WITH PASSWORD '...'` as `-U postgres` |
| `role "..." does not exist`           | step 2 skipped                                                                             |
| Login: "Credential account not found" | step 5 not run                                                                             |

## Cleanup (per environment, once it deploys from migrated code)

Staging: now. Production: only after the cutover.

- Secrets: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `MAILJET_APIKEY_PUBLIC`, `MAILJET_APIKEY_PRIVATE`
- Variables: `POSTGRES_DB`, `POSTGRES_HOST`, `TS_API_WEBHOOK_URL`

## Follow-ups (staging first)

- Least privilege: transfer object ownership to the `DATABASE_USER` role, then `ALTER ROLE ... NOSUPERUSER`.
- Remove the `5432`/`3100` `ports:` mappings from `docker-compose.yml` — not needed on servers, and 3100 is currently internet-reachable.
- Restore the evaluations-page feature (live on production, missing from `develop`) before the cutover.
