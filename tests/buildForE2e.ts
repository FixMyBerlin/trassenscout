import { loadE2eEnv } from "../scripts/shared/e2eEnv"

// CI e2e runs against the production build; VITE_* from .env.test are inlined at build time.
async function main() {
  const child = Bun.spawn(["bun", "run", "build"], {
    env: await loadE2eEnv(),
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  })
  process.exit(await child.exited)
}

if (import.meta.main) {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
