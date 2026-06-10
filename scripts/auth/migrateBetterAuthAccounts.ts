import db from "@/src/server/db.server"

const credentialProviderId = "credential"
const activeUserWindowMonths = 5

function hasWriteFlag() {
  return Bun.argv.includes("--write")
}

function getActiveUserCutoffDate() {
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - activeUserWindowMonths)
  return cutoffDate
}

async function getUsersWithLegacyPasswords() {
  return db.user.findMany({
    where: {
      hashedPassword: { not: null },
    },
    select: {
      email: true,
      hashedPassword: true,
      id: true,
      passwordHashMigratedAt: true,
      sessions: {
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
        take: 1,
      },
    },
  })
}

async function migrateBetterAuthAccounts() {
  const shouldWrite = hasWriteFlag()
  const activeUserCutoffDate = getActiveUserCutoffDate()
  const users = await getUsersWithLegacyPasswords()

  const activeUsers = users.filter((user) =>
    user.sessions.some((session) => session.updatedAt >= activeUserCutoffDate),
  )
  const inactiveUsers = users.length - activeUsers.length

  console.log(
    [
      `Found ${users.length} users with legacy password hashes.`,
      `${activeUsers.length} active users will keep password sign-in.`,
      `${inactiveUsers} inactive users will require password reset.`,
      shouldWrite ? "Writing changes." : "Dry run only. Pass --write to migrate.",
    ].join("\n"),
  )

  if (!shouldWrite) return

  const migratedAt = new Date()
  for (const user of users) {
    if (!user.hashedPassword) continue

    const isActive = user.sessions.some((session) => session.updatedAt >= activeUserCutoffDate)

    await db.$transaction([
      db.account.upsert({
        where: {
          providerId_accountId: {
            accountId: String(user.id),
            providerId: credentialProviderId,
          },
        },
        create: {
          accountId: String(user.id),
          password: isActive ? user.hashedPassword : null,
          providerId: credentialProviderId,
          userId: user.id,
        },
        update: {
          password: isActive ? user.hashedPassword : null,
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: {
          passwordHashMigratedAt: isActive
            ? (user.passwordHashMigratedAt ?? migratedAt)
            : user.passwordHashMigratedAt,
          passwordResetRequired: !isActive,
        },
      }),
    ])
  }
}

if (import.meta.main) {
  migrateBetterAuthAccounts()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
    .finally(async () => {
      await db.$disconnect()
    })
}
