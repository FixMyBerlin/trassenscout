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
// Usage: bun db/remote/test-backup-restore.ts [YYYY-MM-DD] [--remove] [-h]
//   YYYY-MM-DD  Restore the backup of a specific day (default: latest available)
//   --remove    Remove the test container when done (default: keep for inspection)
//   -h          Show this help message
//
// Required env (Bun auto-loads .env.local):
//   SCW_ACCESS_KEY   Scaleway object storage access key
//   SCW_SECRET_KEY   Scaleway object storage secret key
// Optional env (defaults shown):
//   BACKUP_BUCKET=ionos-backups
//   BACKUP_ENDPOINT=https://s3.fr-par.scw.cloud
//   BACKUP_REGION=fr-par

import { $ } from "bun"
import { statSync } from "node:fs"
import { styleText } from "node:util"

const DIR = import.meta.dir

// --- Config ---------------------------------------------------------------
const CONTAINER = "ts-backup-restore-test"
const PORT = 6005
// Pinned to 16-alpine on purpose: the backups are dumped by pg_dump 16.14, so we
// restore into the matching major version (the default postgres:alpine is 17).
const IMAGE = "postgres:16-alpine"
const DB = "dbmaster"
const PASSWORD = "password"
const BACKUP_FILE_NAME = "trassenscout-production.sql.gz"

const bucket = process.env.BACKUP_BUCKET || "ionos-backups"
const endpoint = process.env.BACKUP_ENDPOINT || "https://s3.fr-par.scw.cloud"
const region = process.env.BACKUP_REGION || "fr-par"

// --- Args -----------------------------------------------------------------
const args = process.argv.slice(2)
if (args.includes("-h") || args.includes("--help")) {
  console.log("Usage: bun db/remote/test-backup-restore.ts [YYYY-MM-DD] [--remove] [-h]")
  console.log("  YYYY-MM-DD  Restore the backup of a specific day (default: latest available)")
  console.log("  --remove    Remove the test container when done (default: keep for inspection)")
  console.log("  -h          Show this help message")
  process.exit(0)
}
const removeWhenDone = args.includes("--remove")
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))

// --- Pre-flight -----------------------------------------------------------
if (!process.env.SCW_ACCESS_KEY || !process.env.SCW_SECRET_KEY) {
  console.error(styleText("red", "❌ SCW_ACCESS_KEY / SCW_SECRET_KEY are not set in .env.local"))
  process.exit(1)
}
// The aws CLI talks to Scaleway's S3-compatible endpoint using these creds.
process.env.AWS_ACCESS_KEY_ID = process.env.SCW_ACCESS_KEY
process.env.AWS_SECRET_ACCESS_KEY = process.env.SCW_SECRET_KEY
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

// --- 1. Determine which backup object to restore --------------------------
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
    .sort() // keys are YYYY/MM/DD/... so lexicographic === chronological
  if (keys.length === 0) {
    console.error(styleText("red", `❌ No '${BACKUP_FILE_NAME}' objects found in bucket.`))
    process.exit(1)
  }
  key = keys[keys.length - 1]!
}
console.log(`📦 Backup: s3://${bucket}/${key}`)

// --- 2. Download the backup -----------------------------------------------
console.log(styleText("inverse", "📥 Downloading backup ..."))
const gzPath = `${DIR}/data/backup.sql.gz`
await $`mkdir -p ${DIR}/data`
await $`aws s3 cp s3://${bucket}/${key} ${gzPath} --endpoint-url ${endpoint}`.quiet()
const sizeMb = (statSync(gzPath).size / 1024 / 1024).toFixed(2)
console.log(`✅ Downloaded ${sizeMb} MB`)

// --- 3. (Re)create the throwaway container --------------------------------
const existing = (await $`docker ps -aq --filter name=^${CONTAINER}$`.text()).trim()
if (existing) {
  console.log(`♻️  Removing existing '${CONTAINER}' container for a clean test ...`)
  await $`docker rm -f ${CONTAINER}`.quiet()
}
console.log(styleText("inverse", `🐘 Starting ${IMAGE} container '${CONTAINER}' on port ${PORT} ...`))
await $`docker run -d --name ${CONTAINER} -e POSTGRES_PASSWORD=${PASSWORD} -p ${PORT}:5432 ${IMAGE}`.quiet()

// Wait until Postgres is ready (max ~30s). We probe via TCP (-h 127.0.0.1)
// on purpose: during initdb the official image runs a temporary server that
// only listens on the unix socket, so a plain pg_isready would report ready
// too early. The temporary server has no TCP listener, so probing 127.0.0.1
// only succeeds once the real server is up.
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

// --- 4. Restore the dump into a fresh database ----------------------------
// The dump contains `CREATE SCHEMA public;` without a prior DROP, so we drop the
// default public schema first, otherwise the restore aborts on ON_ERROR_STOP.
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

// --- 5. Verify the result -------------------------------------------------
console.log(styleText("inverse", "🔬 Verifying restored data ..."))
const q = (sql: string) =>
  $`docker exec ${CONTAINER} psql -U postgres -d ${DB} -tAc ${sql}`.text().then((s) => s.trim())

const tableCount = Number(
  await q("SELECT count(*) FROM information_schema.tables WHERE table_schema='public'"),
)
const env = await q(`SELECT value FROM "_Meta" WHERE key='ENV'`)
const userCount = Number(await q('SELECT count(*) FROM public."User"'))
const projectCount = Number(await q('SELECT count(*) FROM public."Project"'))

if (tableCount === 0) {
  console.error(styleText("red", "❌ Restore produced zero tables. Backup is not usable."))
  process.exit(1)
}

console.log("")
console.log(styleText("green", "✅ BACKUP RESTORE TEST PASSED"))
console.log(`   Backup:   s3://${bucket}/${key} (${sizeMb} MB)`)
console.log(`   Tables:   ${tableCount}`)
console.log(`   _Meta.ENV: ${env}${env === "production" ? " ✓ (live production backup)" : ""}`)
console.log(`   Rows:     User=${userCount}, Project=${projectCount}`)
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
