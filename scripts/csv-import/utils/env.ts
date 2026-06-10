import { getValidatedEnv, csvImportEnvSchema } from "@/scripts/shared/env"

export type Environment = "dev" | "staging" | "production"

export const apiUrls = {
  dev: "http://127.0.0.1:4000",
  staging: "https://staging.trassenscout.de",
  production: "https://trassenscout.de",
} as const

export function getApiKeyForEnv(env: Environment): string {
  const keys = getValidatedEnv(csvImportEnvSchema)
  const key =
    env === "dev"
      ? keys.TS_API_KEY
      : env === "staging"
        ? keys.TS_API_KEY_STAGING
        : keys.TS_API_KEY_PRODUCTION
  if (!key) {
    throw new Error(`API key for environment ${env} is not set in .env`)
  }
  return key
}
