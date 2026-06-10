import fs from "node:fs"
import path from "node:path"
import { expect, test as setup } from "@playwright/test"
import type { Browser } from "@playwright/test"
import { authFile, seedRoles, seedUsers } from "./_fixtures/auth"
import { dashboardUrl } from "./_utils/pageAssertions"
import { signInSeedRole } from "./_utils/signInViaApi"

const authenticateRole = async (
  browser: Browser,
  baseURL: string | undefined,
  role: keyof typeof seedUsers,
) => {
  const storageStatePath = authFile(role)
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true })

  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()

  await signInSeedRole(page, role)
  await page.goto("/dashboard")

  await expect(page).toHaveURL(dashboardUrl, { timeout: 30_000 })
  await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({
    timeout: 30_000,
  })

  await context.storageState({ path: storageStatePath })
  await context.close()
}

// Serial: parallel sign-ins against one dev server race on session/SSR and corrupt storage state files.
setup.describe.configure({ mode: "serial" })

for (const role of seedRoles) {
  setup(`authenticate ${role}`, async ({ browser, baseURL }) => {
    setup.setTimeout(60_000)
    await authenticateRole(browser, baseURL, role)
  })
}
