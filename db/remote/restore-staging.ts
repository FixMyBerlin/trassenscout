// Script to restore database dump to staging environment
// Uses existing dump.sql file and applies anonymization

import { chalk } from "blitz"
import {
  anonymizeData,
  checkDumpFile,
  resetDatabase,
  restoreDump,
  verifyDatabaseEnvironment,
} from "./db-helpers"

console.log("🔄 Starting staging database restore...")

// Get script directory
const DIR = import.meta.dir

// Bun automatically loads .env.local, so process.env is already populated
if (!process.env.DATABASE_URL_STAGING) {
  console.log("❌ DATABASE_URL_STAGING is not set in .env.local")
  console.log("   Note: Bun automatically loads .env.local file")
  console.log("   To use a different env file: bun --env-file=.env.custom restore-staging.ts")
  process.exit(1)
}

// Set variables for helper functions
const targetDbUrl = process.env.DATABASE_URL_STAGING!
const sqlDir = `${DIR}/sql`

// Verify we're connected to the right database
await verifyDatabaseEnvironment(targetDbUrl, "staging")

const dumpPath = await checkDumpFile(sqlDir)

await resetDatabase(targetDbUrl, sqlDir)

await restoreDump(targetDbUrl, dumpPath)

await anonymizeData(targetDbUrl)

console.log("✅ Staging database restore completed successfully!")
console.log("📧 All emails have been anonymized (except @fixmycity.de addresses)")
console.log(chalk.inverse("⚠️  Note: Run migrations on staging manually if needed"))
console.log(chalk.inverse("     Use the open ssh connection on staging"))
console.log(chalk.inverse("     Restart blitz to trigger the migrations:"))
console.log(chalk.inverse("       cd ./trassenscout-staging && docker compose restart app"))
