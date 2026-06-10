import { z, type ZodType } from "zod"
import { envFullSchema } from "@/src/server/envSchema"

export const dbPullRemoteEnvSchema = z.object({
  DATABASE_PRODUCTION_USER: z.string().min(1),
  DATABASE_PRODUCTION_PASSWORD: z.string().min(1),
  DATABASE_STAGING_USER: z.string().min(1),
  DATABASE_STAGING_PASSWORD: z.string().min(1),
})

export type DbPullRemoteEnv = z.infer<typeof dbPullRemoteEnvSchema>

export function parseValidatedEnv<T>(schema: ZodType<T>, env: Record<string, unknown>): T {
  const parsed = schema.safeParse(env)

  if (!parsed.success) {
    console.error("Invalid environment configuration", z.prettifyError(parsed.error))
    throw new Error("Invalid environment configuration")
  }

  return parsed.data
}

export function getValidatedEnv<T>(schema: ZodType<T>): T {
  return parseValidatedEnv(schema, process.env)
}

export const csvImportEnvSchema = envFullSchema.pick({
  TS_API_KEY: true,
  TS_API_KEY_STAGING: true,
  TS_API_KEY_PRODUCTION: true,
})
