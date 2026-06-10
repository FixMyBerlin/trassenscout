# Environment variables and secrets

## Deployment model

- Canonical deploy definitions: [`env/deploy.manifest.json`](./env/deploy.manifest.json).
- [`workflows/setup-env.yml`](./workflows/setup-env.yml) runs [`scripts/verify-env-manifest.ts`](./scripts/verify-env-manifest.ts) and [`scripts/generate-deploy-env.ts`](./scripts/generate-deploy-env.ts), producing `.env.deploy.generated` for upload.
- [`workflows/diff-last-run.yml`](./workflows/diff-last-run.yml) uses Bun scripts under [`scripts/`](./scripts/) for last-run SHA lookup, git diff checks, and environment fingerprint hashing ([`env/fingerprint-scopes.json`](./env/fingerprint-scopes.json)).
- On the host, that file becomes `/srv/trassenscout-{environment}/.env` after rename.
- [`scripts/generate-github-readme.ts`](./scripts/generate-github-readme.ts) refreshes the mapping table below from the manifest.

## GitHub configuration

- All environment variables and secrets are defined in GitHub:
  - Repository secrets: [Actions secrets](https://github.com/FixMyBerlin/trassenscout/settings/secrets/actions)
  - Environment secrets (per deploy target):
    - [Staging](https://github.com/FixMyBerlin/trassenscout/settings/environments/2395297920/edit#environment-secrets)
    - [Production](https://github.com/FixMyBerlin/trassenscout/settings/environments/2395358496/edit#environment-secrets)
- Some values are composed at deploy time (for example `S3_UPLOAD_ROOTFOLDER`) to reduce GitHub configuration surface.
- Prefer values that do not change per environment in code rather than as secrets.

## When checks run

- **CI:** [`.github/workflows/ci.yml`](./workflows/ci.yml) — manifest verification on every PR.
- **Deploy:** [`setup-env.yml`](./workflows/setup-env.yml) — same verification plus generated `.env` for the target environment.
- **Local:** `bun run env-check` after changing the manifest, `.env.example`, or compose / workflow env wiring.

## Consistency / drift

- Manifest defines deploy variables (`name`, source, required/default, description).
- CI fails if manifest keys are missing from `.env.example` or `docker-compose.yml`, or if unmanaged keys appear in compose or setup-env mappings.
- The generated table in this file must match the manifest (regenerate with `bun .github/scripts/generate-github-readme.ts` when needed).
- Deploy generation fails if a required GitHub var/secret is missing for the selected environment.
- Some `.env.example` entries are local-only (for example `DATABASE_PRODUCTION_*`, `DATABASE_STAGING_*`, `VITE_PUBLIC_SURVEY_START_STAGE`); they stay out of the manifest and setup-env mappings.

## Docker compose

[`docker-compose.yml`](../docker-compose.yml) references manifest variables via interpolation or explicit pass-through from the generated `.env` file created in [`setup-env`](./workflows/setup-env.yml). Local dev uses [`docker-compose.override.yml`](../docker-compose.override.yml) (not deployed).

## Source mapping (generated)

<!-- GENERATED_ENV_TABLE_START -->
<!-- This block is GENERATED. Edit .github/env/deploy.manifest.json and run `bun .github/scripts/generate-github-readme.ts`. -->

| Name                   | Source                        | Required | Description                                                  |
| ---------------------- | ----------------------------- | -------- | ------------------------------------------------------------ |
| `VITE_APP_ENV`         | `inputs.ENVIRONMENT`          | yes      | Deployment target (staging\|production).                     |
| `VITE_APP_ORIGIN`      | `vars.APP_ORIGIN`             | yes      | Public app origin for Better Auth and client links.          |
| `APP_DOMAIN`           | `vars.APP_DOMAIN`             | yes      | Traefik host rule for the app container.                     |
| `BREVO_API_KEY`        | `secrets.BREVO_API_KEY`       | no       | Brevo transactional email API key. Sensitive.                |
| `DATABASE_USER`        | `secrets.DATABASE_USER`       | yes      | PostgreSQL username. Sensitive.                              |
| `DATABASE_PASSWORD`    | `secrets.DATABASE_PASSWORD`   | yes      | PostgreSQL password. Sensitive.                              |
| `SESSION_SECRET_KEY`   | `secrets.SESSION_SECRET_KEY`  | yes      | Better Auth session encryption secret. Sensitive.            |
| `ADMIN_EMAIL`          | `vars.ADMIN_EMAIL`            | yes      | Admin notification recipient.                                |
| `S3_UPLOAD_KEY`        | `secrets.S3_UPLOAD_KEY`       | yes      | S3-compatible upload access key. Sensitive.                  |
| `S3_UPLOAD_SECRET`     | `secrets.S3_UPLOAD_SECRET`    | yes      | S3-compatible upload secret key. Sensitive.                  |
| `S3_UPLOAD_ROOTFOLDER` | `upload-{ENVIRONMENT}`        | yes      | S3 key prefix for uploads.                                   |
| `TS_API_KEY`           | `secrets.TS_API_KEY`          | yes      | API key for cron, CSV import, and webhook routes. Sensitive. |
| `OPENAI_API_KEY`       | `secrets.OPENAI_API_KEY`      | no       | OpenAI key for project-record email extraction. Sensitive.   |
| `LANGFUSE_SECRET_KEY`  | `secrets.LANGFUSE_SECRET_KEY` | no       | Langfuse secret key for LLM tracing. Sensitive.              |
| `LANGFUSE_PUBLIC_KEY`  | `secrets.LANGFUSE_PUBLIC_KEY` | no       | Langfuse public key.                                         |
| `LANGFUSE_BASEURL`     | `vars.LANGFUSE_BASEURL`       | no       | Langfuse API base URL.                                       |
| `LUCKY_CLOUD_TOKEN`    | `secrets.LUCKY_CLOUD_TOKEN`   | no       | Lucky Cloud collaboration token. Sensitive.                  |
| `ECR_REGISTRY`         | `vars.ECR_REGISTRY`           | yes      | AWS ECR registry for app and imap-listener images.           |
| `IMAP_HOST`            | `vars.IMAP_HOST`              | yes      | IMAP server hostname.                                        |
| `IMAP_PORT`            | `vars.IMAP_PORT`              | yes      | IMAP server port.                                            |
| `IMAP_USER`            | `vars.IMAP_USER`              | yes      | IMAP mailbox username.                                       |
| `IMAP_PASSWORD`        | `secrets.IMAP_PASSWORD`       | yes      | IMAP mailbox password. Sensitive.                            |

<!-- GENERATED_ENV_TABLE_END -->
