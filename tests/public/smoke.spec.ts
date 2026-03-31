import { expect, test } from "@/tests/_fixtures/test"

const publicPages = [
  { path: "/", heading: "Trassenscout findet Wege", title: /Trassenscout/ },
  { path: "/datenschutz", heading: "Datenschutzerklärung", title: /Datenschutzerklärung/ },
  { path: "/kontakt", heading: "Kontakt", title: /Kontakt/ },
  { path: "/auth/login", heading: "In Account einloggen", title: /Anmelden/ },
  { path: "/auth/signup", heading: "Account registrieren", title: /Anmelden/ },
  { path: "/auth/forgot-password", heading: "Passwort vergessen", title: /Passwort vergessen/ },
  { path: "/auth/reset-password", heading: "Neues Passwort vergeben", title: /Passwort vergessen/ },
] as const

test.describe("Public and auth smoke", () => {
  for (const publicPage of publicPages) {
    test(`renders ${publicPage.path}`, async ({ page }) => {
      await page.goto(publicPage.path)

      await expect(page).toHaveTitle(publicPage.title)
      await expect(page.getByRole("heading", { name: publicPage.heading })).toBeVisible()
    })
  }
})
