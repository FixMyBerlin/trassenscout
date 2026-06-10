import { authFile } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { dashboardUrl, loginUrl } from "@/tests/_utils/pageAssertions"

const adminPaths = [
  "/admin",
  "/admin/projects",
  "/admin/memberships",
  "/admin/surveys",
  "/admin/logEntries",
]

const loggedOutRedirectNoise = [
  ...pageNoise,
  "Failed to load resource: the server responded with a status of 404 (Not Found)",
]

const loggedInRedirectNoise = [
  ...pageNoise,
  "Failed to load resource: the server responded with a status of 404 (Not Found)",
]

test.describe("Admin route guards", () => {
  test.describe("logged-out users", () => {
    test.use({ allowedConsoleErrors: loggedOutRedirectNoise })

    for (const path of adminPaths) {
      test(`redirects logged-out users from ${path} to login`, async ({ page }) => {
        await page.goto(path)
        await expect(page).toHaveURL(loginUrl, { timeout: 30_000 })
      })
    }
  })

  for (const role of ["viewer", "editor", "noProject"] as const) {
    test.describe(`${role} users`, () => {
      test.use({ storageState: authFile(role) })
      test.use({ allowedConsoleErrors: loggedInRedirectNoise })

      for (const path of adminPaths) {
        test(`redirects ${role} users from ${path} to dashboard`, async ({ page }) => {
          await page.goto(path)
          await expect(page).toHaveURL(dashboardUrl, { timeout: 30_000 })
          await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({
            timeout: 30_000,
          })
        })
      }
    })
  }
})
