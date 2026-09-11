// Shared helper functions for database operations
// Used by both local dev and staging sync processes

import path from "node:path"
import { styleText } from "node:util"
import { $, SQL } from "bun"
import { buildPseudonymEmail, buildPseudonymForUser, isFixMyCityEmail } from "./pseudonymizeUser"

export type RemoteDatabaseTarget = "production" | "staging"

// Helper function to normalize database URL for Bun SQL (runs on host, not in Docker)
// Replaces host.docker.internal with localhost for direct connections from dev machine
function normalizeUrlForBunSql(dbUrl: string): string {
  // Bun SQL runs on the host machine, so host.docker.internal won't work
  // Replace with localhost when connecting to remote databases via SSH tunnels
  return dbUrl.replace("@host.docker.internal", "@localhost")
}

// Helper function to check database connection and SSH tunnel
export async function checkDatabaseConnection(
  targetDbUrl: string,
  remoteTarget?: RemoteDatabaseTarget,
) {
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
      if (remoteTarget) showSshTunnelInstructions(remoteTarget)
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
  const connected = await checkDatabaseConnection(
    targetDbUrl,
    expectedEnv === "development" ? undefined : expectedEnv,
  )
  if (!connected) {
    console.error("")
    console.error(styleText("red", "❌ Failed to connect to database."))
    console.error("")
    process.exit(1)
  }

  console.log(styleText("inverse", `🔍 Verifying database environment...`))

  const normalizedUrl = normalizeUrlForBunSql(targetDbUrl)
  const db = new SQL(normalizedUrl)

  try {
    // Get ENV value from _Meta table
    const metaResult = await db`SELECT value FROM "_Meta" WHERE key = 'ENV'`
    const storedEnv = metaResult[0]?.value

    if (!storedEnv) {
      console.error("")
      console.error(styleText("red", "❌ ENV not found in _Meta table."))
      console.error(styleText("red", "   Where <env> is: development, staging, or production"))
      console.error("")
      process.exit(1)
    }

    console.log(`   Expected environment: ${expectedEnv}`)
    console.log(`   Database environment: ${storedEnv}`)

    // Safety check: abort if production
    if (storedEnv === "production") {
      console.error("")
      console.error(styleText("red", "⚠️  CRITICAL: Connected to PRODUCTION database!"))
      console.error(
        styleText("red", "   Aborting to prevent accidental production database modification."),
      )
      console.error("")
      process.exit(1)
    }

    // Safety check: abort if mismatch
    if (storedEnv !== expectedEnv) {
      console.error("")
      console.error(styleText("red", "⚠️  CRITICAL: Environment mismatch!"))
      console.error(styleText("red", `   Expected: ${expectedEnv}, Database: ${storedEnv}`))
      console.error("")
      process.exit(1)
    }

    console.log(`✅ Environment verified: ${styleText("green", storedEnv)}`)
  } finally {
    db.close()
  }
}

// Helper function to display SSH tunnel instructions for connection errors
export function showSshTunnelInstructions(target: RemoteDatabaseTarget) {
  console.log("")
  console.log(styleText("yellow", "📝 Make sure SSH tunnel is running in a separate terminal:"))
  switch (target) {
    case "production":
      console.log(styleText("yellow", "   ssh trassenscout-production-postgres-tunnel"))
      break
    case "staging":
      console.log(styleText("yellow", "   ssh trassenscout-staging-postgres-tunnel"))
      break
  }
  console.log("")
}

// Function to reset database using pre-restore.sql
export async function resetDatabase(
  targetDbUrl: string,
  sqlDir: string,
  remoteTarget?: RemoteDatabaseTarget,
) {
  console.log(styleText("inverse", "🗑️  Resetting database..."))

  const maintenanceUrl = targetDbUrl
    .replace("@localhost", "@host.docker.internal")
    .replace("/dbmaster", "/template1")
  const preSqlPath = path.resolve(sqlDir, "pre-restore.sql")

  try {
    await $`docker run --rm --volume ${preSqlPath}:/pre.sql:ro --entrypoint psql postgres:16-alpine -v ON_ERROR_STOP=1 --echo-errors ${maintenanceUrl} -f /pre.sql`.quiet()
  } catch (error) {
    const errorStr = String(error)
    if (errorStr.includes("Connection refused") || errorStr.includes("connection to server")) {
      if (remoteTarget) showSshTunnelInstructions(remoteTarget)
    }
    throw error
  }
}

// Function to restore dump to database (accepts a dump file path)
export async function restoreDump(
  targetDbUrl: string,
  dumpFilePath: string,
  remoteTarget?: RemoteDatabaseTarget,
) {
  console.log(styleText("inverse", "📥 Restoring dump..."))

  const dockerDbUrl = targetDbUrl.replace("@localhost", "@host.docker.internal")

  try {
    await $`docker run --rm --volume ${dumpFilePath}:/dump.sql:ro --entrypoint psql postgres:16-alpine -v ON_ERROR_STOP=1 --echo-errors ${dockerDbUrl} -f /dump.sql`.quiet()
  } catch (error) {
    const errorStr = String(error)
    if (errorStr.includes("Connection refused") || errorStr.includes("connection to server")) {
      if (remoteTarget) showSshTunnelInstructions(remoteTarget)
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

// Function to anonymize data using Bun's native SQL API.
// Pseudonymizes non-FixMyCity users (name/email/phone/image/password), matches Invite emails
// to their inviter's new pseudonym where possible, and scrubs all standing credentials
// (sessions, verifications, tokens, admin API tokens, OAuth tokens). FixMyCity users keep
// their real name/email/password so staging stays loginable with prod credentials.
export async function anonymizeData(targetDbUrl: string, expectedEnv: "development" | "staging") {
  console.log(styleText("inverse", "🔒 Anonymizing data..."))

  const normalizedUrl = normalizeUrlForBunSql(targetDbUrl)
  const db = new SQL(normalizedUrl)

  try {
    const summary = await db.begin(async (tx) => {
      // Update _Meta.ENV to match the target environment (critical for verification)
      await tx`
        INSERT INTO "_Meta" (key, value)
        VALUES ('ENV', ${expectedEnv})
        ON CONFLICT (key) DO UPDATE SET value = ${expectedEnv}
      `

      // Snapshot original emails before rewriting them, so Invite rows can still be matched
      // to the User they belong to (and reuse that user's new pseudonym email).
      const originalUsers = await tx<{ id: number; email: string }[]>`
        SELECT id, email FROM public."User"
      `
      const originalEmailToUserId = new Map<string, number>()
      for (const row of originalUsers) {
        originalEmailToUserId.set(row.email.toLowerCase(), row.id)
      }

      const nonFmcUsers = originalUsers.filter((row) => !isFixMyCityEmail(row.email))
      const nonFmcUserIds = nonFmcUsers.map((row) => row.id)
      const pseudonymByUserId = new Map(
        nonFmcUsers.map((row) => [row.id, buildPseudonymForUser(row.id)] as const),
      )

      for (const [userId, pseudo] of pseudonymByUserId) {
        await tx`
          UPDATE public."User"
          SET
            "firstName" = ${pseudo.firstName},
            "lastName" = ${pseudo.lastName},
            "name" = ${`${pseudo.firstName} ${pseudo.lastName}`},
            "email" = ${pseudo.email},
            "phone" = NULL,
            "image" = NULL,
            "hashedPassword" = NULL
          WHERE id = ${userId}
        `
      }

      // Invites with a non-FMC email: reuse the matching user's new pseudonym email when the
      // (pre-update) email matches a User row, otherwise derive a standalone pseudonym email.
      const invites = await tx<{ id: number; email: string }[]>`
        SELECT id, email FROM public."Invite"
      `
      let invitesScrubbed = 0
      for (const invite of invites) {
        if (isFixMyCityEmail(invite.email)) continue
        const matchedUserId = originalEmailToUserId.get(invite.email.toLowerCase())
        const matchedPseudonym =
          matchedUserId !== undefined ? pseudonymByUserId.get(matchedUserId) : undefined
        const pseudoEmail = matchedPseudonym
          ? matchedPseudonym.email
          : buildPseudonymEmail(invite.email)
        await tx`UPDATE public."Invite" SET email = ${pseudoEmail} WHERE id = ${invite.id}`
        invitesScrubbed += 1
      }

      // Account: OAuth tokens are cleared for everyone; the login password is only cleared
      // for non-FMC users so FMC staff keep staging access with their prod password.
      const oauthCleared = await tx<{ id: number }[]>`
        UPDATE public."Account"
        SET
          "accessToken" = NULL,
          "refreshToken" = NULL,
          "idToken" = NULL,
          "accessTokenExpiresAt" = NULL,
          "refreshTokenExpiresAt" = NULL
        RETURNING id
      `
      let passwordsCleared = 0
      if (nonFmcUserIds.length > 0) {
        const cleared = await tx<{ id: number }[]>`
          UPDATE public."Account"
          SET "password" = NULL
          WHERE "userId" IN ${tx(nonFmcUserIds)}
          RETURNING id
        `
        passwordsCleared = cleared.length
      }

      // Credential scrub: every standing session/verification/token is dropped outright.
      // (No MCP token reseeding here - that's an app-level concern, not this scrub's job.)
      const deletedSessions = await tx<{ id: number }[]>`DELETE FROM public."Session" RETURNING id`
      const deletedAuthSessions = await tx<{ id: number }[]>`
        DELETE FROM public."AuthSession" RETURNING id
      `
      const deletedVerifications = await tx<{ id: number }[]>`
        DELETE FROM public."Verification" RETURNING id
      `
      const deletedTokens = await tx<{ id: number }[]>`DELETE FROM public."Token" RETURNING id`
      const deletedAdminApiTokens = await tx<{ id: string }[]>`
        DELETE FROM public."AdminApiToken" RETURNING id
      `

      return {
        usersPseudonymized: nonFmcUsers.length,
        invitesScrubbed,
        accountsOauthCleared: oauthCleared.length,
        accountsPasswordCleared: passwordsCleared,
        sessionsDeleted: deletedSessions.length,
        authSessionsDeleted: deletedAuthSessions.length,
        verificationsDeleted: deletedVerifications.length,
        tokensDeleted: deletedTokens.length,
        adminApiTokensDeleted: deletedAdminApiTokens.length,
      }
    })

    console.log("✅ Data anonymization completed")
    console.log(`✅ Updated _Meta.ENV to: ${expectedEnv}`)
    console.log(`   Users pseudonymized: ${summary.usersPseudonymized}`)
    console.log(`   Invites scrubbed: ${summary.invitesScrubbed}`)
    console.log(
      `   Account OAuth tokens cleared: ${summary.accountsOauthCleared} (passwords cleared: ${summary.accountsPasswordCleared})`,
    )
    console.log(`   Session rows deleted: ${summary.sessionsDeleted}`)
    console.log(`   AuthSession rows deleted: ${summary.authSessionsDeleted}`)
    console.log(`   Verification rows deleted: ${summary.verificationsDeleted}`)
    console.log(`   Token rows deleted: ${summary.tokensDeleted}`)
    console.log(`   AdminApiToken rows deleted: ${summary.adminApiTokensDeleted}`)
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

// Function to run migrations (uses DATABASE_* from environment via prisma.config.ts)
export async function runMigrations() {
  console.log(styleText("inverse", "🔄 Running migrations..."))

  await $`bun prisma migrate deploy`
}

// Function to run seeding (local only)
export async function runSeed() {
  console.log(styleText("inverse", "🌱 Seeding database..."))

  await $`SEED_ONLY_USERS=1 bun prisma db seed`
}

// Function to pull production dump
export async function pullProductionDump(sqlDir: string, tempDir: string) {
  console.log(styleText("inverse", "📥 Pulling production database dump using get-dump.ts..."))
  await $`bun ${sqlDir}/../get-dump.ts`
  await $`cp ${sqlDir}/../data/dump.sql ${tempDir}/dump.sql`.quiet()
  const size = await $`ls -lh ${tempDir}/dump.sql`.text()
  console.log(`📊 Production dump created: ${size.trim()}`)
}
