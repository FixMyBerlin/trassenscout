import db from "@/src/server/db.server"
function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

export async function isPasswordResetRequired(email: string) {
  const user = await db.user.findUnique({
    where: { email: normalizeEmail(email) },
    select: { passwordResetRequired: true },
  })

  return user?.passwordResetRequired ?? false
}

export async function clearPasswordResetRequired(userId: number) {
  // The reset stored a fresh hash in `account.password`, so the legacy
  // `hashedPassword` copy is obsolete and must not linger.
  await db.user.update({
    where: { id: userId },
    data: { passwordResetRequired: false, hashedPassword: null },
  })
}
