// Script to restore database dump to local development environment

import { getDatabaseUrl } from "@/src/server/database-url.server"
import {
  anonymizeData,
  checkDumpFile,
  resetDatabase,
  restoreDump,
  runMigrations,
  runSeed,
  verifyDatabaseEnvironment,
} from "./db-helpers"

export async function main() {
  console.log("🔄 Starting local database restore...")

  const DIR = import.meta.dir

  let targetDbUrl: string
  try {
    targetDbUrl = getDatabaseUrl()
  } catch {
    console.log("❌ DATABASE_HOST, DATABASE_USER, and DATABASE_PASSWORD are not set in .env")
    console.log("   Note: Bun automatically loads .env")
    console.log("   To use a different env file: bun --env-file=.env.custom restore-local.ts")
    process.exit(1)
  }
  const sqlDir = `${DIR}/sql`

  await verifyDatabaseEnvironment(targetDbUrl, "development")

  const dumpPath = await checkDumpFile(sqlDir)

  await resetDatabase(targetDbUrl, sqlDir)
  await restoreDump(targetDbUrl, dumpPath)
  await anonymizeData(targetDbUrl, "development")
  await runMigrations()
  await runSeed()

  console.log("✅ DONE")
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
