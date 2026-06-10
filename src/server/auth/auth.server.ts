import type { BetterAuthOptions } from "better-auth"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { customSession } from "better-auth/plugins/custom-session"
import { forgotPasswordMailToUser } from "@/emails/mailers/forgotPasswordMailToUser"
import { UserRoleEnum } from "@/src/prisma/generated/client"
import {
  authAfterHook,
  authBeforeHook,
  handlePasswordResetCompleted,
} from "@/src/server/auth/authHooks.server"
import { SecurePassword } from "@/src/server/auth/securePassword.server"
import db from "@/src/server/db.server"

function getTrustedOrigins() {
  const origin = process.env.VITE_APP_ORIGIN
  return origin ? [origin] : []
}

function customSessionWithRole(options?: BetterAuthOptions) {
  return customSession(({ user, session }) => {
    type UserWithAdditionalFields = typeof user & {
      role?: UserRoleEnum
      additionalFields?: {
        role?: UserRoleEnum
      }
    }
    const userWithFields = user as UserWithAdditionalFields
    const role = userWithFields.additionalFields?.role ?? userWithFields.role ?? UserRoleEnum.USER

    return Promise.resolve({
      user: {
        ...user,
        additionalFields: {
          ...userWithFields.additionalFields,
          role,
        },
      },
      session,
      role,
    })
  }, options)
}

const options = {
  appName: "Trassenscout",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.VITE_APP_ORIGIN,
  secret: process.env.SESSION_SECRET_KEY,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 100,
    password: {
      hash: (password) => SecurePassword.hash(password.trim()),
      verify: async ({ hash, password }) => {
        const result = await SecurePassword.verify(hash, password.trim())
        return result === SecurePassword.VALID || result === SecurePassword.VALID_NEEDS_REHASH
      },
    },
    sendResetPassword: async ({ user, token }) => {
      await (await forgotPasswordMailToUser({ to: user.email, token })).send()
    },
    revokeSessionsOnPasswordReset: true,
    onPasswordReset: async ({ user }) => {
      await handlePasswordResetCompleted(Number(user.id))
    },
  },
  user: {
    modelName: "user",
    fields: {
      email: "email",
      emailVerified: "emailVerified",
      image: "image",
      name: "name",
    },
    additionalFields: {
      firstName: {
        type: "string",
        input: true,
        required: true,
      },
      lastName: {
        type: "string",
        input: true,
        required: true,
      },
      phone: {
        type: "string",
        input: true,
        required: false,
      },
      institution: {
        type: "string",
        input: true,
        required: false,
      },
      role: {
        type: "string",
        input: false,
      },
      passwordResetRequired: {
        type: "boolean",
        input: false,
      },
      passwordHashMigratedAt: {
        type: "date",
        input: false,
        required: false,
      },
    },
  },
  session: {
    modelName: "authSession",
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: getTrustedOrigins(),
  rateLimit: {
    enabled: process.env.VITE_IS_TEST !== "true",
    window: 60,
    max: 10,
    storage: "memory",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 5 },
    },
  },
  hooks: {
    before: authBeforeHook,
    after: authAfterHook,
  },
  account: {
    modelName: "account",
    accountLinking: {
      enabled: false,
    },
  },
  verification: {
    modelName: "verification",
  },
  advanced: {
    cookiePrefix: "trassenscout",
    database: {
      // Prisma uses autoincrement Int ids on user/session/account tables.
      generateId: "serial",
    },
  },
} satisfies BetterAuthOptions

export const auth = betterAuth({
  ...options,
  plugins: [customSessionWithRole(options)],
})
