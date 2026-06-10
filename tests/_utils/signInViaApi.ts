import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"
import { seedPassword, seedUsers } from "../_fixtures/auth"

export async function signInViaApi(page: Page, email: string, password = seedPassword) {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password, rememberMe: true },
  })
  expect(response.ok()).toBeTruthy()
}

export async function signInSeedRole(page: Page, role: keyof typeof seedUsers) {
  await signInViaApi(page, seedUsers[role])
}
