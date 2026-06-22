import { expect, test } from "@/tests/_fixtures/test"

const protectedPaths = ["/dashboard", "/support", "/user/edit", "/admin", "/rs23"]

const redirectNoise = [
  "Failed to fetch RSC payload",
  "Failed to load resource: the server responded with a status of 404 (Not Found)",
]

test.describe("Logged-out users are redirected to login", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ allowedConsoleErrors: redirectNoise })

  for (const path of protectedPaths) {
    test(`redirects ${path} to /auth/login`, async ({ page }) => {
      await page.goto(path)

      await page.waitForURL(/\/auth\/login/)
      await expect(page).toHaveURL(/\/auth\/login/)
      await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeVisible({
        timeout: 30_000,
      })
    })
  }
})
