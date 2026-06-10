import type { DbPullRemoteEnv } from "@/scripts/shared/env"

function buildDatabaseUrl(config: {
  host: string
  port: string
  user: string
  password: string
  name: string
}) {
  return `postgresql://${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.name}`
}

export function getProductionDatabaseUrl(env: DbPullRemoteEnv) {
  return buildDatabaseUrl({
    host: "localhost",
    port: "5434",
    name: "dbmaster",
    user: env.DATABASE_PRODUCTION_USER,
    password: env.DATABASE_PRODUCTION_PASSWORD,
  })
}

export function getStagingDatabaseUrl(env: DbPullRemoteEnv) {
  return buildDatabaseUrl({
    host: "localhost",
    port: "5433",
    name: "dbmaster",
    user: env.DATABASE_STAGING_USER,
    password: env.DATABASE_STAGING_PASSWORD,
  })
}
