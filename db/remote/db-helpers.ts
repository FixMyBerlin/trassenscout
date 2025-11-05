// Shared helper functions for database operations
// Used by both local dev and staging sync processes

import { $, SQL } from "bun"
import chalk from "chalk"
import path from "node:path"

// Helper function to normalize database URL for Bun SQL (runs on host, not in Docker)
// Replaces host.docker.internal with localhost for direct connections from dev machine
function normalizeUrlForBunSql(dbUrl: string): string {
  // Bun SQL runs on the host machine, so host.docker.internal won't work
  // Replace with localhost when connecting to remote databases via SSH tunnels
  return dbUrl.replace("@host.docker.internal", "@localhost")
}

// Helper function to check database connection and SSH tunnel
export async function checkDatabaseConnection(targetDbUrl: string) {
  const normalizedUrl = normalizeUrlForBunSql(targetDbUrl)
  const db = new SQL(normalizedUrl)

  try {
    // Try a simple query to test connection
    await db`SELECT 1`
    db.close()
    return true
  } catch (error) {
    db.close()
    const errorStr = String(error)
    if (
      errorStr.includes("Connection refused") ||
      errorStr.includes("connection to server") ||
      errorStr.includes("Connection closed")
    ) {
      showSshTunnelInstructions(targetDbUrl)
    }
    return false
  }
}

// Helper function to verify database environment from _Meta table
export async function verifyDatabaseEnvironment(
  targetDbUrl: string,
  expectedEnv: "development" | "staging" | "production",
) {
  // First check if we can connect to the database (SSH tunnel check)
  const connected = await checkDatabaseConnection(targetDbUrl)
  if (!connected) {
    console.error("")
    console.error(chalk.red("❌ Failed to connect to database."))
    console.error("")
    process.exit(1)
  }

  console.log(chalk.inverse(`🔍 Verifying database environment...`))

  const normalizedUrl = normalizeUrlForBunSql(targetDbUrl)
  const db = new SQL(normalizedUrl)

  try {
    // Get ENV value from _Meta table
    const metaResult = await db`SELECT value FROM "_Meta" WHERE key = 'ENV'`
    const storedEnv = metaResult[0]?.value

    if (!storedEnv) {
      console.error("")
      console.error(chalk.red("❌ ENV not found in _Meta table."))
      console.error(chalk.red("   Where <env> is: development, staging, or production"))
      console.error("")
      process.exit(1)
    }

    console.log(`   Expected environment: ${expectedEnv}`)
    console.log(`   Database environment: ${storedEnv}`)

    // Safety check: abort if production
    if (storedEnv === "production") {
      console.error("")
      console.error(chalk.red("⚠️  CRITICAL: Connected to PRODUCTION database!"))
      console.error(
        chalk.red("   Aborting to prevent accidental production database modification."),
      )
      console.error("")
      process.exit(1)
    }

    // Safety check: abort if mismatch
    if (storedEnv !== expectedEnv) {
      console.error("")
      console.error(chalk.red("⚠️  CRITICAL: Environment mismatch!"))
      console.error(chalk.red(`   Expected: ${expectedEnv}, Database: ${storedEnv}`))
      console.error("")
      process.exit(1)
    }

    console.log(`✅ Environment verified: ${chalk.green(storedEnv)}`)
  } finally {
    db.close()
  }
}

// Helper function to display SSH tunnel instructions for connection errors
export function showSshTunnelInstructions(targetDbUrlOrStaging: string | boolean) {
  console.log("")
  console.log(chalk.yellow("📝 Make sure SSH tunnel is running in a separate terminal:"))
  if (typeof targetDbUrlOrStaging === "boolean") {
    console.log(
      chalk.yellow(
        `   ssh trassenscout-${targetDbUrlOrStaging ? "staging" : "production"}-postgres-tunnel`,
      ),
    )
  } else {
    const targetDbUrl = targetDbUrlOrStaging
    if (targetDbUrl.includes("staging") || targetDbUrl.includes("5433")) {
      console.log(chalk.yellow("   ssh trassenscout-staging-postgres-tunnel"))
    } else {
      console.log(chalk.yellow("   ssh trassenscout-production-postgres-tunnel"))
    }
  }
  console.log("")
}

// Function to reset database using pre-restore.sql
export async function resetDatabase(targetDbUrl: string, sqlDir: string) {
  console.log(chalk.inverse("🗑️  Resetting database..."))

  const maintenanceUrl = targetDbUrl
    .replace("@localhost", "@host.docker.internal")
    .replace("/dbmaster", "/template1")
  const preSqlPath = path.resolve(sqlDir, "pre-restore.sql")

  try {
    await $`docker run --rm --volume ${preSqlPath}:/pre.sql:ro --entrypoint psql postgres:16-alpine -v ON_ERROR_STOP=1 --echo-errors ${maintenanceUrl} -f /pre.sql`.quiet()
  } catch (error) {
    const errorStr = String(error)
    if (errorStr.includes("Connection refused") || errorStr.includes("connection to server")) {
      showSshTunnelInstructions(targetDbUrl)
    }
    throw error
  }
}

// Function to restore dump to database (accepts a dump file path)
export async function restoreDump(targetDbUrl: string, dumpFilePath: string) {
  console.log(chalk.inverse("📥 Restoring dump..."))

  const dockerDbUrl = targetDbUrl.replace("@localhost", "@host.docker.internal")

  try {
    await $`docker run --rm --volume ${dumpFilePath}:/dump.sql:ro --entrypoint psql postgres:16-alpine -v ON_ERROR_STOP=1 --echo-errors ${dockerDbUrl} -f /dump.sql`.quiet()
  } catch (error) {
    const errorStr = String(error)
    if (errorStr.includes("Connection refused") || errorStr.includes("connection to server")) {
      showSshTunnelInstructions(targetDbUrl)
    }
    throw error
  }

  // Verify tables were created
  const dockerDbUrl2 = targetDbUrl.replace("@localhost", "@host.docker.internal")
  const countResult =
    await $`docker run --rm --entrypoint psql postgres:16-alpine -t -A -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'" ${dockerDbUrl2}`.text()
  const cnt = Number(countResult.trim()) || 0
  if (cnt === 0) {
    console.error("❌ Restore produced zero public tables. Aborting.")
    process.exit(1)
  }
}

// Function to anonymize data using Bun's native SQL API
export async function anonymizeData(targetDbUrl: string, expectedEnv: "development" | "staging") {
  console.log(chalk.inverse("🔒 Anonymizing data..."))

  const normalizedUrl = normalizeUrlForBunSql(targetDbUrl)
  const db = new SQL(normalizedUrl)

  try {
    // Update _Meta.ENV to match the target environment (critical for verification)
    await db`
      INSERT INTO "_Meta" (key, value)
      VALUES ('ENV', ${expectedEnv})
      ON CONFLICT (key) DO UPDATE SET value = ${expectedEnv}
    `

    await db`
      UPDATE public."User"
      SET email = email || '.invalid'
      WHERE
        email NOT LIKE '%.invalid' AND
        email NOT LIKE '%@fixmycity.de'
    `

    await db`
      UPDATE public."Invite"
      SET email = email || '.invalid'
      WHERE
        email NOT LIKE '%.invalid' AND
        email NOT LIKE '%@fixmycity.de'
    `

    console.log("✅ Data anonymization completed")
    console.log(`✅ Updated _Meta.ENV to: ${expectedEnv}`)
  } finally {
    db.close()
  }
}

// Verify an existing dump file and return its path
export async function checkDumpFile(sqlDir: string) {
  const dumpFile = path.resolve(sqlDir, "../data/dump.sql")

  try {
    await $`test -f ${dumpFile}`.quiet()
  } catch {
    console.error("❌ No existing dump.sql found. Run get-dump.ts first.")
    process.exit(1)
  }

  return dumpFile
}

// Function to run migrations (uses DATABASE_URL from environment)
export async function runMigrations() {
  console.log(chalk.inverse("🔄 Running migrations..."))

  await $`blitz prisma migrate dev`
}

// Function to run seeding (local only)
export async function runSeed() {
  console.log(chalk.inverse("🌱 Seeding database..."))

  await $`SEED_ONLY_USERS=1 blitz db seed`
}

// Function to pull production dump
export async function pullProductionDump(sqlDir: string, tempDir: string) {
  console.log(chalk.inverse("📥 Pulling production database dump using get-dump.ts..."))
  await $`bun ${sqlDir}/../get-dump.ts`
  await $`cp ${sqlDir}/../data/dump.sql ${tempDir}/dump.sql`.quiet()
  const size = await $`ls -lh ${tempDir}/dump.sql`.text()
  console.log(`📊 Production dump created: ${size.trim()}`)
}
