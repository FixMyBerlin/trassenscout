import { authFile } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const dashboardPages = [
  { path: "/dashboard", heading: "Meine Projekte" },
  { path: "/support", heading: "Support & Dokumentation" },
  { path: "/user/edit", heading: "Profil bearbeiten" },
] as const

test.describe("Logged-in general smoke", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: pageNoise })

  for (const dashboardPage of dashboardPages) {
    test(`renders ${dashboardPage.path}`, async ({ page }) => {
      await page.goto(dashboardPage.path)

      await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 30_000 })
      if (dashboardPage.path === "/support") {
        await expect(page.getByRole("heading", { name: dashboardPage.heading })).toBeVisible({
          timeout: 15_000,
        })
      } else {
        await expect(page.getByText(dashboardPage.heading, { exact: true })).toBeVisible({
          timeout: 15_000,
        })
      }
    })
  }
})
