import { loadE2eEnv } from "../scripts/shared/e2eEnv"
import { ensureTestDbRunning, resetAndSeedTestDb } from "../scripts/test/docker"

async function main() {
  const env = await loadE2eEnv()

  await ensureTestDbRunning()
  await resetAndSeedTestDb()

  const child = Bun.spawn(["bun", "vite", "dev", "--host", "127.0.0.1", "--port", "4000"], {
    env,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  })

  const forwardSignal = (signal: NodeJS.Signals) => {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  process.on("SIGINT", forwardSignal)
  process.on("SIGTERM", forwardSignal)

  const exitCode = await child.exited
  process.exit(exitCode)
}

if (import.meta.main) {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
