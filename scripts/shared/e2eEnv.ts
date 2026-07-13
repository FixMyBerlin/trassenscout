import { readFileSync } from "node:fs"
import path from "node:path"
import { parse } from "dotenv"
import { z } from "zod"
import {
  envAppStartupValidationSchema,
  envViteSchema,
  vitePlaywrightEnabledE2eSchema,
} from "@/src/server/envSchema"
import { parseValidatedEnv } from "./env"

const testEnvPath = path.resolve(process.cwd(), ".env.test")

export const e2eEnvSchema = envAppStartupValidationSchema.safeExtend({
  VITE_PLAYWRIGHT_ENABLED: vitePlaywrightEnabledE2eSchema,
  VITE_APP_ORIGIN: z.url(),
})

export type E2eEnv = z.infer<typeof e2eEnvSchema>

export const testSetupEnvSchema = envViteSchema
  .pick({ VITE_APP_ENV: true, VITE_PLAYWRIGHT_ENABLED: true })
  .extend({
    DATABASE_HOST: z.string().min(1),
    DATABASE_USER: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    VITE_PLAYWRIGHT_ENABLED: vitePlaywrightEnabledE2eSchema,
  })

export function loadMergedTestEnvSync(): NodeJS.ProcessEnv {
  const fileEnv = parse(readFileSync(testEnvPath, "utf-8"))
  return { ...process.env, ...fileEnv }
}

export async function loadMergedTestEnv(): Promise<NodeJS.ProcessEnv> {
  const fileEnv = parse(await Bun.file(testEnvPath).text())
  return { ...process.env, ...fileEnv }
}

export function loadE2eEnvSync(): NodeJS.ProcessEnv & E2eEnv {
  const merged = loadMergedTestEnvSync()
  parseValidatedEnv(e2eEnvSchema, merged)
  return merged as NodeJS.ProcessEnv & E2eEnv
}

export async function loadE2eEnv(): Promise<NodeJS.ProcessEnv & E2eEnv> {
  const merged = await loadMergedTestEnv()
  parseValidatedEnv(e2eEnvSchema, merged)
  return merged as NodeJS.ProcessEnv & E2eEnv
}

export function toSpawnEnv(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined),
  )
}
