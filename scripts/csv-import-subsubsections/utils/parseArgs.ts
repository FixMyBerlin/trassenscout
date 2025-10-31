import { resolve } from "path"
import { z } from "zod"
import type { Environment } from "./env"

const ConfigSchema = z.object({
  spreadsheetId: z.string().min(1, "spreadsheetId is required"),
  tableId: z.string().min(1, "tableId is required"),
  userId: z.number().int().positive("userId must be a positive integer"),
})

export type Config = z.infer<typeof ConfigSchema>

interface ScriptArgs {
  configName: string
  env: Environment
}

/**
 * Parses and validates command line arguments
 * Returns config name and environment
 */
export async function parseArgs(): Promise<ScriptArgs> {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error("Usage: bun scripts/csv-import-subsubsections/index.ts <config-name> <env>")
    console.error("  config-name: Name of the config file (without .ts extension)")
    console.error("  env: Environment (dev, staging, or production)")
    process.exit(1)
  }

  const configName = args[0]
  const envArg = args[1] as Environment

  if (!configName) {
    console.error("Config name is required")
    process.exit(1)
  }

  if (!["dev", "staging", "production"].includes(envArg)) {
    console.error(`Invalid environment: ${envArg}. Must be one of: dev, staging, production`)
    process.exit(1)
  }

  const env: Environment = envArg

  return { configName, env }
}

/**
 * Loads and validates config from config file
 */
export async function loadConfig(configName: string): Promise<Config> {
  // Get script directory: go up one level from utils/ to the script directory
  const scriptDir = resolve(import.meta.dir, "..")
  const configPath = resolve(scriptDir, "configs", `${configName}.ts`)

  try {
    // Use dynamic import for TypeScript config files
    const configModule = await import(configPath)
    const rawConfig = configModule.default

    // Validate config against schema
    const config = ConfigSchema.parse(rawConfig)
    return config
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error(`❌ Config validation failed for ${configPath}:`)
      error.errors.forEach((err) => {
        const path = err.path.join(".")
        console.error(`  - ${path}: ${err.message}`)
      })
      process.exit(1)
    }
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`Failed to load config from ${configPath}: ${message}`)
    process.exit(1)
  }
}
