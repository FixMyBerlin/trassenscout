import { execSync } from "node:child_process"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, ".env.test") })

const run = (command: string) => {
  execSync(command, {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      IS_TEST: process.env.IS_TEST ?? "true",
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    },
  })
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForPostgres = async () => {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      execSync("docker exec ts-test-db pg_isready -U postgres", {
        stdio: "ignore",
        env: process.env,
      })
      return
    } catch {
      await wait(1000)
    }
  }

  throw new Error("Timed out waiting for ts-test-db to become ready")
}

async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Playwright global setup")
  }

  run("npm run pretest")
  await waitForPostgres()
  run("npx blitz prisma migrate deploy")
  run("npx blitz db seed")
}

export default globalSetup
