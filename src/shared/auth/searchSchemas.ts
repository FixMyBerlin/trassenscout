import { z } from "zod"

export const authCallbackSearchSchema = z.object({
  callbackURL: z.string().optional(),
  inviteToken: z.string().optional(),
})

export type AuthCallbackSearch = z.infer<typeof authCallbackSearchSchema>

export const resetPasswordSearchSchema = z.object({
  error: z.string().optional(),
  token: z.string().optional(),
})

export type ResetPasswordSearch = z.infer<typeof resetPasswordSearchSchema>

export const forgotPasswordSearchSchema = z.object({
  email: z.string().optional(),
})

export type ForgotPasswordSearch = z.infer<typeof forgotPasswordSearchSchema>

export const accessDeniedSearchSchema = z.object({
  from: z.string().optional(),
})
