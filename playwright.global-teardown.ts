import { execSync } from "node:child_process"

async function globalTeardown() {
  if (process.env.E2E_KEEP_DB === "1") {
    return
  }

  execSync("npm run test:db:stop", {
    stdio: "inherit",
    env: process.env,
  })
}

export default globalTeardown
