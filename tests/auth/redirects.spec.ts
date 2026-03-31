import { authFile } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const authOnlyPages = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"]

test.describe("Authenticated users are redirected away from auth pages", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("viewer") })
  test.use({
    allowedConsoleErrors: [
      "webglcontextcreationerror",
      "Failed to initialize WebGL",
    ],
  })

  for (const path of authOnlyPages) {
    test(`redirects ${path} to /dashboard`, async ({ page }) => {
      await page.goto(path)

      await page.waitForURL("**/dashboard")
      await expect(page).toHaveURL(/\/dashboard$/)
      await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 15_000 })
      await expect(page.getByRole("heading", { name: "Meine Projekte" })).toBeVisible({ timeout: 15_000 })
    })
  }
})
