// Script to pull database dumps from production or staging
// Usage: bun get-dump.ts [-s] [-h]
// -s: Use staging database instead of production
// -h: Show help

import { $ } from "bun"
import chalk from "chalk"
import { showSshTunnelInstructions } from "./db-helpers"

// Parse command line arguments
const args = process.argv.slice(2)
const useStaging = args.includes("-s")
const showHelp = args.includes("-h")

if (showHelp) {
  console.log("Usage: bun get-dump.ts [-s] [-h]")
  console.log("  -s: Use staging database instead of production")
  console.log("  -h: Show this help message")
  console.log("")
  console.log("Note: Bun automatically loads .env.local file")
  console.log("      To use a different env file: bun --env-file=.env.custom get-dump.ts")
  process.exit(0)
}

// Determine which database to use
// Bun automatically loads .env.local, so process.env is already populated
let databaseUrl
if (useStaging) {
  if (!process.env.DATABASE_URL_STAGING) {
    console.log("❌ DATABASE_URL_STAGING is not set.")
    process.exit(1)
  }
  databaseUrl = process.env.DATABASE_URL_STAGING
  console.log("Getting dump from staging database...")
} else {
  if (!process.env.DATABASE_URL_PRODUCTION) {
    console.log("❌ DATABASE_URL_PRODUCTION is not set.")
    process.exit(1)
  }
  databaseUrl = process.env.DATABASE_URL_PRODUCTION
  console.log("Getting dump from production database...")
}

const DIR = import.meta.dir
await $`mkdir -p ${DIR}/data`

// Pull database dump in plain SQL format
console.log(chalk.inverse("📥 Pulling database dump..."))

const dockerDbUrl = databaseUrl.replace("@localhost", "@host.docker.internal")

try {
  await $`docker run --rm --entrypoint pg_dump postgres:16-alpine -Fp --no-owner --no-privileges ${dockerDbUrl} | grep -vE 'rdsadmin;|dbmasteruser;' > ${DIR}/data/dump.sql`.quiet()
} catch (error) {
  const errorStr = String(error)
  if (errorStr.includes("Connection refused") || errorStr.includes("connection to server")) {
    showSshTunnelInstructions(useStaging)
  }
  throw error
}
