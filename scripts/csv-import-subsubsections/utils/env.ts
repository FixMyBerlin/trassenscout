export type Environment = "dev" | "staging" | "production"

export const apiUrls = {
  dev: "http://localhost:6173",
  staging: "https://staging.trassenscout.de",
  production: "https://trassenscout.de",
}

export function getApiKeyForEnv(env: Environment): string {
  const key =
    env === "dev"
      ? process.env.TS_API_KEY
      : env === "staging"
        ? process.env.TS_API_KEY_STAGING
        : process.env.TS_API_KEY_PRODUCTION
  if (!key) {
    throw new Error(`API key for environment ${env} is not set in environment variables`)
  }
  return key
}
