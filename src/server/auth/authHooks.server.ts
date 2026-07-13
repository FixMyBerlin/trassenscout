import { APIError } from "better-auth"
import { createAuthMiddleware } from "better-auth/api"
import db from "@/src/server/db.server"
import {
  PASSWORD_RESET_REQUIRED_CODE,
  passwordResetRequiredMessage,
} from "./authPasswordReset.const"
import { clearPasswordResetRequired, isPasswordResetRequired } from "./authPasswordReset.server"
import { hashPassword, isLegacyHashFormat, verifyPassword } from "./passwordHashing.server"

const credentialProviderId = "credential"

export const authBeforeHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email") return

  const body = ctx.body as { email?: string }
  const email = body.email?.trim()
  if (!email) return

  if (await isPasswordResetRequired(email)) {
    throw APIError.from("FORBIDDEN", {
      code: PASSWORD_RESET_REQUIRED_CODE,
      message: passwordResetRequiredMessage,
    })
  }
})

/**
 * Rewrites a legacy (base64-encoded) hash as a plain PHC string and clears the
 * obsolete `User.hashedPassword` copy. Runs after a successful sign-in, the
 * only time the plaintext password is available.
 */
export async function rehashLegacyPassword(userId: number, password: string) {
  const account = await db.account.findFirst({
    where: { userId, providerId: credentialProviderId },
    select: { id: true, password: true },
  })
  if (!account?.password) return
  if (!isLegacyHashFormat(account.password)) return

  const isValid = await verifyPassword(account.password, password)
  if (!isValid) return

  const newHash = await hashPassword(password)
  await db.$transaction([
    db.account.update({
      where: { id: account.id },
      data: { password: newHash },
    }),
    db.user.update({
      where: { id: userId },
      data: { passwordHashMigratedAt: new Date(), hashedPassword: null },
    }),
  ])
}

export const authAfterHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email") return

  const newSession = ctx.context.newSession
  if (!newSession) return

  const body = ctx.body as { password?: string }
  const password = body.password?.trim()
  if (!password) return

  const userId = Number(newSession.user.id)
  if (!Number.isInteger(userId)) return

  await rehashLegacyPassword(userId, password)
})

export async function handlePasswordResetCompleted(userId: number) {
  await clearPasswordResetRequired(userId)
}
