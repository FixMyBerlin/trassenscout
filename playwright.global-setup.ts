import { loadE2eEnvSync } from "./scripts/shared/e2eEnv"
import { assertE2eServerEnv } from "./tests/_utils/assertE2eServerEnv"

async function globalSetup() {
  const env = loadE2eEnvSync()
  const baseURL = env.VITE_APP_ORIGIN
  await assertE2eServerEnv(baseURL)
}

export default globalSetup
