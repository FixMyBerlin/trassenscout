// Script to pull database dumps from production or staging
// Usage: bun get-dump.ts [-s] [-h]
// -s: Use staging database instead of production
// -h: Show help

import { $ } from "bun"
import chalk from "chalk"
import { statSync } from "node:fs"
import { checkDatabaseConnection, showSshTunnelInstructions } from "./db-helpers"

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

// Check SSH connection before attempting dump
console.log(chalk.inverse("🔍 Checking SSH connection..."))
const connected = await checkDatabaseConnection(databaseUrl)
if (!connected) {
  console.error("")
  console.error(chalk.red("❌ Failed to connect to database."))
  console.error("")
  process.exit(1)
}

// Pull database dump in plain SQL format
console.log(chalk.inverse("📥 Pulling database dump..."))

const dockerDbUrl = databaseUrl.replace("@localhost", "@host.docker.internal")
const dumpFile = `${DIR}/data/dump.sql`
const tempDumpFile = `${DIR}/data/dump.sql.tmp`

// Remove temp file if it exists from previous failed run
await $`rm -f ${tempDumpFile}`.quiet()

const MIN_DUMP_SIZE = 3 * 1024 * 1024 // 3 MB minimum for a valid dump

try {
  // Write to temporary file first to avoid truncating the final file on failure
  await $`docker run --rm --entrypoint pg_dump postgres:16-alpine -Fp --no-owner --no-privileges ${dockerDbUrl} | grep -vE 'rdsadmin;|dbmasteruser;' > ${tempDumpFile}`.quiet()

  // Verify the dump file has content (at least 3 MB for a valid dump)
  let size = 0
  try {
    const stats = statSync(tempDumpFile)
    size = stats.size
  } catch {
    // File doesn't exist or can't be accessed
    size = 0
  }

  if (size < MIN_DUMP_SIZE) {
    await $`rm -f ${tempDumpFile}`.quiet()
    console.error("")
    console.error(
      chalk.red(
        `❌ Dump file is too small (${(size / 1024 / 1024).toFixed(2)} MB). Expected at least 3 MB.`,
      ),
    )
    console.error(chalk.red("   pg_dump may have failed silently."))
    console.error("")
    throw new Error("Dump file is too small")
  }

  // Move temp file to final location only on success
  await $`mv ${tempDumpFile} ${dumpFile}`

  // Show file size
  const finalSize = await $`ls -lh ${dumpFile}`.text()
  console.log(`✅ Dump created: ${finalSize.trim()}`)
} catch (error) {
  // Clean up temp file on failure
  await $`rm -f ${tempDumpFile}`.quiet()

  const errorStr = String(error)
  if (errorStr.includes("Connection refused") || errorStr.includes("connection to server")) {
    showSshTunnelInstructions(useStaging)
  }

  // Remove empty or too-small dump.sql if it exists from previous failed run
  try {
    const stats = statSync(dumpFile)
    if (stats.size < MIN_DUMP_SIZE) {
      await $`rm -f ${dumpFile}`.quiet()
    }
  } catch {
    // File doesn't exist, which is fine
  }

  throw error
}
