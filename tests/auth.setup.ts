import { expect, test as setup } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { authFile, seedPassword, seedUsers } from "./_fixtures/auth"

const loginPath = "/auth/login"

const authenticateRole = async (
  browser: Parameters<Parameters<typeof setup>[1]>[0]["browser"],
  role: keyof typeof seedUsers
) => {
  const storageStatePath = authFile(role)
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true })

  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(loginPath)

  const emailField = page.getByLabel("E-Mail-Adresse")
  const passwordField = page.getByLabel("Passwort")
  const submitButton = page.getByRole("button", { name: "Anmelden" })

  await expect(emailField).toBeEnabled()
  await expect(passwordField).toBeEnabled()
  await expect(submitButton).toBeEnabled()

  await emailField.fill(seedUsers[role])
  await passwordField.fill(seedPassword)
  await submitButton.click()

  await page.waitForURL("**/dashboard", { timeout: 30_000 })
  await expect(page).toHaveURL(/\/dashboard$/)

  const cookies = await context.cookies()
  expect(cookies.some((cookie) => cookie.name === "rsv-builder_sSessionToken")).toBeTruthy()

  await context.storageState({ path: storageStatePath })
  await context.close()
}

for (const role of Object.keys(seedUsers) as Array<keyof typeof seedUsers>) {
  setup(`authenticate ${role}`, async ({ browser }) => {
    await authenticateRole(browser, role)
  })
}
