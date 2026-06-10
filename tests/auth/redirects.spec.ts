import { authFile } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { dashboardUrl } from "@/tests/_utils/pageAssertions"

const authOnlyPaths = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
]

test.describe("Authenticated users are redirected away from auth pages", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: pageNoise })

  for (const path of authOnlyPaths) {
    test(`redirects ${path} to /dashboard`, async ({ page }) => {
      await page.goto(path)

      await expect(page).toHaveURL(dashboardUrl, { timeout: 30_000 })
      await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 15_000 })
      await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeHidden()
    })
  }
})
