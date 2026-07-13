/**
 * Clears the obsolete `User.hashedPassword` column for users whose sign-in
 * already runs on Better Auth (`account.password` or forced password reset).
 * Run this once the Better Auth cutover is confirmed stable — afterwards a
 * rollback to the Blitz app would lose these users' passwords.
 * See https://github.com/FixMyBerlin/private-issues/issues/3385
 */
import db from "@/src/server/db.server"

const credentialProviderId = "credential"

function hasWriteFlag() {
  return Bun.argv.includes("--write")
}

async function clearLegacyPasswordHashes() {
  const shouldWrite = hasWriteFlag()

  const migratedFilter = {
    hashedPassword: { not: null },
    OR: [
      { accounts: { some: { providerId: credentialProviderId } } },
      { passwordResetRequired: true },
    ],
  }
  const migratedCount = await db.user.count({ where: migratedFilter })
  const unmigratedCount = await db.user.count({
    where: {
      hashedPassword: { not: null },
      accounts: { none: { providerId: credentialProviderId } },
      passwordResetRequired: false,
    },
  })

  console.log(
    [
      `Found ${migratedCount} migrated users with a leftover legacy password hash.`,
      `Found ${unmigratedCount} unmigrated users; their hashes are kept (run migrateBetterAuthAccounts first).`,
      shouldWrite ? "Writing changes." : "Dry run only. Pass --write to clear.",
    ].join("\n"),
  )

  if (!shouldWrite) return

  const { count } = await db.user.updateMany({
    where: migratedFilter,
    data: { hashedPassword: null },
  })
  console.log(`Cleared hashedPassword for ${count} users.`)
}

if (import.meta.main) {
  clearLegacyPasswordHashes()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
    .finally(async () => {
      await db.$disconnect()
    })
}
