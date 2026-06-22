import type { Browser } from "@playwright/test"
import { expect, test as setup } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { authFile, seedPassword, seedRoles, seedUsers } from "./_fixtures/auth"

const loginPath = "/auth/login"

const authenticateRole = async (browser: Browser, role: keyof typeof seedUsers) => {
  const storageStatePath = authFile(role)
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true })

  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(loginPath)

  const emailField = page.getByLabel("E-Mail-Adresse")
  const passwordField = page.getByLabel("Passwort")
  const submitButton = page.getByRole("button", { name: "Anmelden" })

  await expect(emailField).toBeEnabled({ timeout: 30_000 })
  await expect(passwordField).toBeEnabled({ timeout: 30_000 })
  await expect(submitButton).toBeEnabled({ timeout: 30_000 })

  let loginFieldsFilled = false
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await emailField.fill(seedUsers[role])
    await passwordField.fill(seedPassword)
    const currentEmail = await emailField.inputValue()
    const currentPassword = await passwordField.inputValue()
    if (currentEmail === seedUsers[role] && currentPassword === seedPassword) {
      loginFieldsFilled = true
      break
    }
    await page.waitForTimeout(150)
  }

  expect(loginFieldsFilled).toBeTruthy()
  await submitButton.click()

  await expect
    .poll(
      async () => {
        const cookies = await context.cookies()
        return cookies.some(
          (cookie: { name: string }) => cookie.name === "rsv-builder_sSessionToken",
        )
      },
      { timeout: 30_000 },
    )
    .toBeTruthy()

  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({
    timeout: 30_000,
  })

  await context.storageState({ path: storageStatePath })
  await context.close()
}

for (const role of seedRoles) {
  setup(`authenticate ${role}`, async ({ browser }) => {
    setup.setTimeout(60_000)
    await authenticateRole(browser, role)
  })
}
