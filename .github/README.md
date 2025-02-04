# How we work with environment variables and secrets

## In Workflow

- All environment variables and secrets are defined in GitHub:
  - Either on repo level:
    - [Repository secrets](https://github.com/FixMyBerlin/trassenscout/settings/secrets/actions)
    - (We don't use [repository variables](https://github.com/FixMyBerlin/trassenscout/settings/variables/actions) to keep things simpler.)
  - Or on Environment level
    - [Staging](https://github.com/FixMyBerlin/trassenscout/settings/environments/2395297920/edit#environment-secrets)
    - [Production](https://github.com/FixMyBerlin/trassenscout/settings/environments/2395358496/edit#environment-secrets)
- Some variables are dynamically created when feasible to reduce the number of variables in GitHub
- Consider adding things that don't change to the code instead of the environment variables/secrets

## In Docker compose

[The `docker-compose.server.yml`](../docker-compose.server.yml) only uses variables from our `.env` file which we create in [`setup-env`](./workflows/setup-env.yml).

# List of variables and secrets

| Name                     | Path                             | Notes                                   |
| ------------------------ | -------------------------------- | --------------------------------------- |
| `ENVIRONMENT`            | `vars.ENVIRONMENT`               |                                         |
| `APP_ORIGIN`             | `vars.APP_ORIGIN`                |                                         |
| `APP_DOMAIN`             | `vars.APP_DOMAIN`                |                                         |
| `NEXT_PUBLIC_APP_ENV`    | `.env`-variable                  | In `.env` as `vars.ENVIRONMENT`         |
| `NEXT_PUBLIC_APP_ORIGIN` | `.env`-variable                  | In `.env` as `vars.APP_ORIGIN`          |
|                          |                                  |                                         |
| `MAILJET_APIKEY_PUBLIC`  | `secrets.MAILJET_APIKEY_PUBLIC`  |                                         |
| `MAILJET_APIKEY_PRIVATE` | `secrets.MAILJET_APIKEY_PRIVATE` |                                         |
|                          |                                  |                                         |
| `POSTGRES_USER`          | `secrets.POSTGRES_USER`          |                                         |
| `POSTGRES_PASSWORD`      | `secrets.POSTGRES_PASSWORD`      |                                         |
| `POSTGRES_DB`            | `vars.POSTGRES_DB`               |                                         |
| `POSTGRES_HOST`          | `vars.POSTGRES_HOST`             |                                         |
| `DATABASE_URL`           | `.env`-variable                  | In `.env` as composite value            |
|                          |                                  |                                         |
| `SESSION_SECRET_KEY`     | `secrets.SESSION_SECRET_KEY`     | [Required by Blitz][session-secret-key] |
|                          |                                  |                                         |
| `ADMIN_EMAIL`            | `vars.ADMIN_EMAIL`               |                                         |
|                          |                                  |                                         |
| `S3_UPLOAD_KEY`          | `secrets.S3_UPLOAD_KEY`          |                                         |
| `S3_UPLOAD_SECRET`       | `secrets.S3_UPLOAD_SECRET`       |                                         |
| `S3_UPLOAD_ROOTFOLDER`   | `.env`-variable                  | In `.env` as composite value            |
|                          |                                  |                                         |
| `TS_API_KEY`             | `secrets.TS_API_KEY`             |                                         |
|                          |                                  |                                         |
| `AWS_ACCESS_KEY_ID`      | `secrets.AWS_ACCESS_KEY_ID`      | Repository secret                       |
| `AWS_SECRET_ACCESS_KEY`  | `secrets.AWS_SECRET_ACCESS_KEY`  | Repository secret                       |
| `SSH_HOST`               | `secrets.SSH_HOST`               |                                         |
| `SSH_USERNAME`           | `secrets.SSH_USERNAME`           |                                         |
| `SSH_PASSWORD`           | `secrets.SSH_PASSWORD`           |                                         |

[session-secret-key]: https://blitzjs.com/docs/auth-setup#production-deployment-requirements
