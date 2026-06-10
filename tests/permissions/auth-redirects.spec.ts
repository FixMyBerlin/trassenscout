import { expect, test } from "@/tests/_fixtures/test"
import { loginUrl } from "@/tests/_utils/pageAssertions"

const protectedPaths = ["/dashboard", "/support", "/user/edit", "/admin", "/rs23"]

const redirectNoise = [
  "Failed to fetch RSC payload",
  "Failed to load resource: the server responded with a status of 404 (Not Found)",
]

test.describe("Logged-out users are redirected to login", () => {
  test.use({ allowedConsoleErrors: redirectNoise })

  for (const path of protectedPaths) {
    test(`redirects ${path} to /auth/login`, async ({ page }) => {
      await page.goto(path)

      await expect(page).toHaveURL(loginUrl, { timeout: 30_000 })
      await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeVisible({
        timeout: 30_000,
      })
    })
  }
})
