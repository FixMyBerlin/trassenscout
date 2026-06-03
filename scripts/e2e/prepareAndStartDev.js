const { execSync, spawn } = require("node:child_process")

const run = (command) => {
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForPostgres = async () => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
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

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Playwright web server setup")
  }

  run("npm run pretest")
  await waitForPostgres()
  run("npx blitz prisma migrate reset --force --skip-seed")
  run("npx blitz db seed")

  const child = spawn("npm", ["run", "dev:e2e:server"], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      IS_TEST: process.env.IS_TEST ?? "true",
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    },
  })

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  process.on("SIGINT", forwardSignal)
  process.on("SIGTERM", forwardSignal)

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 0)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
