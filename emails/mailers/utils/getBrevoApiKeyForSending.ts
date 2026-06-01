import { z } from "zod"

const mailDeliveryEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]),
  BREVO_API_KEY: z.string().optional(),
})

export const getBrevoApiKeyForSending = () => {
  const env = mailDeliveryEnvSchema.parse(process.env)

  if (env.NEXT_PUBLIC_APP_ENV === "development") {
    return env.BREVO_API_KEY || ""
  }

  const apiKey = env.BREVO_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("Missing BREVO_API_KEY for transactional email delivery.")
  }

  return apiKey
}
