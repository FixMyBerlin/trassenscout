import type { EnvFullSchema, EnvVite } from "./server/envSchema"

declare global {
  interface ImportMetaEnv extends EnvVite {}

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  namespace NodeJS {
    interface ProcessEnv extends EnvFullSchema {}
  }
}

export {}
