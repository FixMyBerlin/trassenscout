import { APIError } from "better-auth"
import { createAuthMiddleware } from "better-auth/api"
import db from "@/src/server/db.server"
import {
  PASSWORD_RESET_REQUIRED_CODE,
  passwordResetRequiredMessage,
} from "./authPasswordReset.const"
import { clearPasswordResetRequired, isPasswordResetRequired } from "./authPasswordReset.server"
import { SecurePassword } from "./securePassword.server"

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

export const authAfterHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email") return

  const newSession = ctx.context.newSession
  if (!newSession) return

  const body = ctx.body as { password?: string }
  const password = body.password?.trim()
  if (!password) return

  const userId = Number(newSession.user.id)
  if (!Number.isInteger(userId)) return

  const account = await db.account.findFirst({
    where: { userId, providerId: credentialProviderId },
    select: { id: true, password: true },
  })
  if (!account?.password) return

  const verifyResult = await SecurePassword.verify(account.password, password)
  if (verifyResult !== SecurePassword.VALID_NEEDS_REHASH) return

  const newHash = await SecurePassword.hash(password)
  await db.$transaction([
    db.account.update({
      where: { id: account.id },
      data: { password: newHash },
    }),
    db.user.update({
      where: { id: userId },
      data: { passwordHashMigratedAt: new Date() },
    }),
  ])
})

export async function handlePasswordResetCompleted(userId: number) {
  await clearPasswordResetRequired(userId)
}
