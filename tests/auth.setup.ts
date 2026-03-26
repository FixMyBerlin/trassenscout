import { expect, test as setup } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { authFile, seedUserButtons, seedUsers } from "./_fixtures/auth"

const loginPath = "/auth/login"

for (const role of Object.keys(seedUsers)) {
  setup(`authenticate ${role}`, async ({ page }) => {
    const storageStatePath = authFile(role as keyof typeof seedUsers)
    fs.mkdirSync(path.dirname(storageStatePath), { recursive: true })

    await page.goto(loginPath)
    await page.getByRole("button", { name: seedUserButtons[role as keyof typeof seedUsers] }).click()

    await expect
      .poll(async () => {
        const cookies = await page.context().cookies()
        return cookies.some((cookie) => cookie.name.startsWith("rsv-builder"))
      })
      .toBe(true)

    await page.context().storageState({ path: storageStatePath })
  })
}
