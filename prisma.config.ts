import { config } from "dotenv"
import { defineConfig } from "prisma/config"
import { getDatabaseUrl } from "./src/server/database-url.server"

config()

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
})
