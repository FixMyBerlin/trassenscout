import "@/src/components/shared/zodDeLocale"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../prisma/generated/client"
import { getDatabaseUrl } from "./database-url.server"

type DbClient = PrismaClient & {
  $reset(): Promise<void>
}

declare global {
  // oxlint-disable-next-line no-var -- Global Prisma singleton needs var declaration merging.
  var __prisma: DbClient | undefined
}

function createClient() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  })
  return new PrismaClient({ adapter })
}

async function resetDatabase(client: PrismaClient) {
  const tables = await client.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `

  if (tables.length === 0) return

  const tableNames = tables.map(({ tablename }) => `"public"."${tablename}"`).join(", ")
  await client.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`)
}

const db = (globalThis.__prisma ?? createClient()) as DbClient

db.$reset = async () => {
  await resetDatabase(db)
}

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db
}

export default db
