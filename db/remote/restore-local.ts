// Script to restore database dump to local development environment
// Uses existing dump.sql file and applies anonymization

import {
  anonymizeData,
  checkDumpFile,
  resetDatabase,
  restoreDump,
  runMigrations,
  runSeed,
  verifyDatabaseEnvironment,
} from "./db-helpers"

console.log("🔄 Starting local database restore...")

// Get script directory
const DIR = import.meta.dir

// Bun automatically loads .env.local, so process.env is already populated
if (!process.env.DATABASE_URL) {
  console.log("❌ DATABASE_URL is not set in .env.local")
  console.log("   Note: Bun automatically loads .env.local file")
  console.log("   To use a different env file: bun --env-file=.env.custom restore-local.ts")
  process.exit(1)
}

// Set variables for helper functions
const targetDbUrl = process.env.DATABASE_URL
const sqlDir = `${DIR}/sql`

// Verify we're connected to the right database
await verifyDatabaseEnvironment(targetDbUrl, "development")

const dumpPath = await checkDumpFile(sqlDir)

await resetDatabase(targetDbUrl, sqlDir)

await restoreDump(targetDbUrl, dumpPath)

await anonymizeData(targetDbUrl)

await runMigrations()
await runSeed()

console.log("✅ Local database restore completed successfully!")
console.log("📧 All emails have been anonymized (except @fixmycity.de addresses)")
console.log("👥 Test users have been seeded for local development")
