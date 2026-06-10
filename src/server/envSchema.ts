import { z } from "zod"

const environmentValues = z.enum(["development", "staging", "production"])
const surveyStageValues = z.enum(["part1", "part2", "part3", "end"])
const requiredString = z.string().min(1)

export const envViteSchema = z.object({
  VITE_APP_ENV: environmentValues,
  VITE_APP_ORIGIN: z.url().optional(),
  VITE_IS_TEST: z.enum(["true", "false"]).optional(),
  VITE_PUBLIC_SURVEY_START_STAGE: surveyStageValues.optional(),
})

const envServerSchema = z.object({
  DATABASE_HOST: requiredString,
  DATABASE_USER: requiredString,
  DATABASE_PASSWORD: requiredString,
  SESSION_SECRET_KEY: requiredString,
  ADMIN_EMAIL: requiredString,
  S3_UPLOAD_ROOTFOLDER: z.enum(["upload-production", "upload-staging", "upload-localdev"]),
  S3_UPLOAD_KEY: requiredString,
  S3_UPLOAD_SECRET: requiredString,
  TS_API_KEY: requiredString,
  BREVO_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_BASEURL: z.url().optional(),
  LUCKY_CLOUD_TOKEN: z.string().optional(),
})

const envScriptOnlySchemaPart = z.object({
  DATABASE_PRODUCTION_USER: z.string().optional(),
  DATABASE_PRODUCTION_PASSWORD: z.string().optional(),
  DATABASE_STAGING_USER: z.string().optional(),
  DATABASE_STAGING_PASSWORD: z.string().optional(),
  TS_API_KEY_STAGING: z.string().optional(),
  TS_API_KEY_PRODUCTION: z.string().optional(),
  SEED_ONLY_USERS: z.string().optional(),
})

export const envAppStartupValidationSchema = envViteSchema
  .extend(envServerSchema.shape)
  .refine((env) => env.VITE_APP_ENV === "development" || Boolean(env.BREVO_API_KEY?.trim()), {
    error: "BREVO_API_KEY is required outside development.",
    path: ["BREVO_API_KEY"],
  })

export const envFullSchema = envViteSchema
  .extend(envServerSchema.shape)
  .extend(envScriptOnlySchemaPart.shape)

export type EnvVite = z.infer<typeof envViteSchema>
export type EnvFullSchema = z.infer<typeof envFullSchema>
