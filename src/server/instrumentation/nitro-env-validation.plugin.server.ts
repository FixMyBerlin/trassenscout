import { z } from "zod"
import { envAppStartupValidationSchema } from "../envSchema"

function getStartupEnv() {
  return process.env
}

export default function nitroEnvValidationPlugin() {
  const parsed = envAppStartupValidationSchema.safeParse(getStartupEnv())

  if (!parsed.success) {
    console.error("Invalid environment configuration", z.prettifyError(parsed.error))
    throw new Error("Invalid environment configuration")
  }
}
