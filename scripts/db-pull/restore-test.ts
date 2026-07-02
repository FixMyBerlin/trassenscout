// Script to TEST that a production backup from the Scaleway object storage can
// actually be restored. This verifies the daily backups which
// have never been tested before.
//
// It downloads a daily pg_dump backup (plain SQL, gzipped) from the
// `ionos-backups` bucket, spins up a throwaway PostgreSQL 16 container and
// restores the dump into it. This proves the backup file is intact and
// restorable WITHOUT touching production or staging.
//
// NOTE: The restored data is NOT anonymized – this is a restore-integrity test
// only. It stays on your machine inside a container bound to localhost.
//
// Usage: bun scripts/db-pull/restore-test.ts [YYYY-MM-DD] [--remove] [-h]
//   YYYY-MM-DD  Restore the backup of a specific day (default: latest available)
//   --remove    Remove the test container when done (default: keep for inspection)
//   -h          Show this help message
//
// Required env (Bun auto-loads .env):
//   SCW_ACCESS_KEY   Scaleway object storage access key
//   SCW_SECRET_KEY   Scaleway object storage secret key
// Optional env (defaults shown):
//   BACKUP_BUCKET=ionos-backups
//   BACKUP_ENDPOINT=https://s3.fr-par.scw.cloud
//   BACKUP_REGION=fr-par

import { statSync } from "node:fs"
import { styleText } from "node:util"
import { $ } from "bun"
import { getValidatedEnv, scwBackupEnvSchema } from "@/scripts/shared/env"

const DIR = import.meta.dir

const CONTAINER = "ts-backup-restore-test"
const PORT = 6005
// Pinned to 16-alpine on purpose: the backups are dumped by pg_dump 16.14, so we
// restore into the matching major version (the default postgres:alpine is 17).
const IMAGE = "postgres:16-alpine"
const DB = "dbmaster"
const PASSWORD = "password"
const BACKUP_FILE_NAME = "trassenscout-production.sql.gz"

function printHelp() {
  console.log("Usage: bun scripts/db-pull/restore-test.ts [YYYY-MM-DD] [--remove] [-h]")
  console.log("  YYYY-MM-DD  Restore the backup of a specific day (default: latest available)")
  console.log("  --remove    Remove the test container when done (default: keep for inspection)")
  console.log("  -h          Show this help message")
  console.log("")
  console.log("Note: Bun automatically loads .env")
  console.log(
    "      To use a different env file: bun --env-file=.env.custom scripts/db-pull/restore-test.ts",
  )
}

export async function main() {
  const args = process.argv.slice(2)
  if (args.includes("-h") || args.includes("--help")) {
    printHelp()
    return
  }

  const removeWhenDone = args.includes("--remove")
  const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))

  const scwEnv = getValidatedEnv(scwBackupEnvSchema)
  const bucket = process.env.BACKUP_BUCKET || "ionos-backups"
  const endpoint = process.env.BACKUP_ENDPOINT || "https://s3.fr-par.scw.cloud"
  const region = process.env.BACKUP_REGION || "fr-par"

  // The aws CLI talks to Scaleway's S3-compatible endpoint using these creds.
  process.env.AWS_ACCESS_KEY_ID = scwEnv.SCW_ACCESS_KEY
  process.env.AWS_SECRET_ACCESS_KEY = scwEnv.SCW_SECRET_KEY
  process.env.AWS_DEFAULT_REGION = region

  for (const [bin, hint] of [
    ["docker", "Docker is required and must be running."],
    ["aws", "The aws CLI is required (used for the Scaleway S3 endpoint)."],
  ]) {
    try {
      await $`which ${bin}`.quiet()
    } catch {
      console.error(styleText("red", `❌ '${bin}' not found. ${hint}`))
      process.exit(1)
    }
  }

  let key: string
  if (dateArg) {
    const [y, m, d] = dateArg.split("-")
    key = `${y}/${m}/${d}/${BACKUP_FILE_NAME}`
    try {
      await $`aws s3 ls s3://${bucket}/${key} --endpoint-url ${endpoint}`.quiet()
    } catch {
      console.error(styleText("red", `❌ No backup found at s3://${bucket}/${key}`))
      process.exit(1)
    }
  } else {
    console.log(styleText("inverse", `🔍 Finding latest backup in s3://${bucket} ...`))
    const listing = await $`aws s3 ls s3://${bucket} --recursive --endpoint-url ${endpoint}`.text()
    const keys = listing
      .split("\n")
      .map((line) => line.trim().split(/\s+/).slice(3).join(" "))
      .filter((k) => k.endsWith(`/${BACKUP_FILE_NAME}`))
      .sort()
    if (keys.length === 0) {
      console.error(styleText("red", `❌ No '${BACKUP_FILE_NAME}' objects found in bucket.`))
      process.exit(1)
    }
    key = keys[keys.length - 1]!
  }
  console.log(`📦 Backup: s3://${bucket}/${key}`)

  console.log(styleText("inverse", "📥 Downloading backup ..."))
  const gzPath = `${DIR}/data/backup.sql.gz`
  await $`mkdir -p ${DIR}/data`
  await $`aws s3 cp s3://${bucket}/${key} ${gzPath} --endpoint-url ${endpoint}`.quiet()
  const sizeMb = (statSync(gzPath).size / 1024 / 1024).toFixed(2)
  console.log(`✅ Downloaded ${sizeMb} MB`)

  const existing = (await $`docker ps -aq --filter name=^${CONTAINER}$`.text()).trim()
  if (existing) {
    console.log(`♻️  Removing existing '${CONTAINER}' container for a clean test ...`)
    await $`docker rm -f ${CONTAINER}`.quiet()
  }
  console.log(
    styleText("inverse", `🐘 Starting ${IMAGE} container '${CONTAINER}' on port ${PORT} ...`),
  )
  await $`docker run -d --name ${CONTAINER} -e POSTGRES_PASSWORD=${PASSWORD} -p ${PORT}:5432 ${IMAGE}`.quiet()

  let ready = false
  for (let i = 0; i < 30; i++) {
    try {
      await $`docker exec ${CONTAINER} pg_isready -h 127.0.0.1 -U postgres -q`.quiet()
      ready = true
      break
    } catch {
      await Bun.sleep(1000)
    }
  }
  if (!ready) {
    console.error(styleText("red", "❌ Postgres did not become ready in time."))
    process.exit(1)
  }

  console.log(styleText("inverse", "🗑️  Preparing fresh database ..."))
  await $`docker exec ${CONTAINER} psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c ${`DROP DATABASE IF EXISTS ${DB};`} -c ${`CREATE DATABASE ${DB};`}`.quiet()
  await $`docker exec ${CONTAINER} psql -U postgres -d ${DB} -v ON_ERROR_STOP=1 -c ${"DROP SCHEMA IF EXISTS public CASCADE;"}`.quiet()

  console.log(styleText("inverse", "📥 Restoring dump (this is the actual test) ..."))
  try {
    await $`gzip -dc ${gzPath} | docker exec -i ${CONTAINER} psql -U postgres -d ${DB} -v ON_ERROR_STOP=1 --quiet`.quiet()
  } catch (error) {
    console.error("")
    console.error(styleText("red", "❌ RESTORE FAILED – the backup could not be restored cleanly."))
    console.error(styleText("red", String((error as { stderr?: Buffer })?.stderr ?? error)))
    console.error(styleText("yellow", `   Container '${CONTAINER}' was kept for inspection.`))
    process.exit(1)
  }

  console.log(styleText("inverse", "🔬 Verifying restored data ..."))
  const q = (sql: string) =>
    $`docker exec ${CONTAINER} psql -U postgres -d ${DB} -tAc ${sql}`.text().then((s) => s.trim())

  const schemaExists =
    (await q("SELECT count(*) FROM information_schema.schemata WHERE schema_name='public'")) !== "0"
  if (!schemaExists) {
    console.error(styleText("red", `❌ Schema 'public' does not exist in database '${DB}'.`))
    process.exit(1)
  }

  const tableCount = Number(
    await q(
      "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
    ),
  )
  if (tableCount === 0) {
    console.error(
      styleText("red", `❌ Schema 'public' in '${DB}' contains no tables. Backup is not usable.`),
    )
    process.exit(1)
  }

  const tableList = (
    await q(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name",
    )
  )
    .split("\n")
    .filter(Boolean)
  const env = await q(`SELECT value FROM "_Meta" WHERE key='ENV'`)
  const userCount = Number(await q('SELECT count(*) FROM public."User"'))
  const projectCount = Number(await q('SELECT count(*) FROM public."Project"'))

  console.log("")
  console.log(styleText("green", "✅ BACKUP RESTORE TEST PASSED"))
  console.log(`   Backup:   s3://${bucket}/${key} (${sizeMb} MB)`)
  console.log(`   Schema:   public exists with ${tableCount} tables (in database '${DB}')`)
  console.log(`   _Meta.ENV: ${env}${env === "production" ? " ✓ (live production backup)" : ""}`)
  console.log(`   Rows:     User=${userCount}, Project=${projectCount}`)
  console.log("")
  console.log(`   Tables in public schema (${tableList.length}):`)
  for (const t of tableList) console.log(`     - ${t}`)
  console.log("")
  console.log(
    styleText("inverse", `🔌 Connect: postgresql://postgres:${PASSWORD}@localhost:${PORT}/${DB}`),
  )
  console.log(`   psql:    docker exec -it ${CONTAINER} psql -U postgres -d ${DB}`)

  if (removeWhenDone) {
    console.log(`🧹 Removing container '${CONTAINER}' ...`)
    await $`docker rm -f ${CONTAINER}`.quiet()
  } else {
    console.log(`   Cleanup: docker rm -f ${CONTAINER}`)
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
