import { authFile } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const dashboardPages = [
  { path: "/dashboard", heading: "Meine Projekte", title: /Meine Projekte/ },
  { path: "/support", heading: "Support & Dokumentation", title: /Support & Dokumentation/ },
  { path: "/user/edit", heading: "Profil bearbeiten", title: /Profil bearbeiten/ },
] as const

test.describe("Logged-in general smoke", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("viewer") })
  test.use({
    allowedConsoleErrors: [
      "webglcontextcreationerror",
      "Failed to initialize WebGL",
    ],
  })

  for (const dashboardPage of dashboardPages) {
    test(`renders ${dashboardPage.path}`, async ({ page }) => {
      await page.goto(dashboardPage.path)

      await expect(page).toHaveTitle(dashboardPage.title)
      await expect(page.getByRole("heading", { name: dashboardPage.heading })).toBeVisible({ timeout: 15_000 })
    })
  }
})
