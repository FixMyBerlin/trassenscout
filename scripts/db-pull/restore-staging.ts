// Script to restore database dump to staging environment

import { styleText } from "node:util"
import { dbPullRemoteEnvSchema, getValidatedEnv } from "@/scripts/shared/env"
import {
  anonymizeData,
  checkDumpFile,
  resetDatabase,
  restoreDump,
  verifyDatabaseEnvironment,
} from "./db-helpers"
import { getStagingDatabaseUrl } from "./remote-database-url"

export async function main() {
  console.log("🔄 Starting staging database restore...")

  const DIR = import.meta.dir

  const env = getValidatedEnv(dbPullRemoteEnvSchema)
  const targetDbUrl = getStagingDatabaseUrl(env)
  const sqlDir = `${DIR}/sql`

  await verifyDatabaseEnvironment(targetDbUrl, "staging")

  const dumpPath = await checkDumpFile(sqlDir)

  await resetDatabase(targetDbUrl, sqlDir, "staging")
  await restoreDump(targetDbUrl, dumpPath, "staging")
  await anonymizeData(targetDbUrl, "staging")

  console.log("")
  console.log(styleText("green", "✅ Staging restore completed successfully!"))
  console.log("")
  console.log(styleText("yellow", "📝 Next steps on the staging server:"))
  console.log(styleText("yellow", "   cd ./trassenscout-staging && docker compose restart app"))
  console.log("")
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
