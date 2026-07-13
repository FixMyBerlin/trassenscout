import { expect, test } from "@/tests/_fixtures/test"

const publicPages = [
  { path: "/", heading: "Trassenscout findet Wege" },
  { path: "/datenschutz", heading: "Datenschutzerklärung" },
  { path: "/kontakt", heading: "Kontakt" },
  { path: "/auth/login", heading: "In Account einloggen" },
  { path: "/auth/signup", heading: "Account registrieren" },
  { path: "/auth/forgot-password", heading: "Passwort vergessen" },
  { path: "/auth/reset-password", heading: "Neues Passwort vergeben" },
] as const

test.describe("Public and auth smoke", () => {
  for (const publicPage of publicPages) {
    test(`renders ${publicPage.path}`, async ({ page }) => {
      await page.goto(publicPage.path)

      await expect(
        page.getByRole("heading", { name: publicPage.heading, exact: true }),
      ).toBeVisible({
        timeout: 30_000,
      })
    })
  }

  test("legal pages are marked noindex", async ({ page }) => {
    for (const path of ["/datenschutz", "/kontakt"] as const) {
      await page.goto(path)
      await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1)
    }
  })
})
