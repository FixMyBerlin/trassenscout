import { expect, test } from "@/tests/_fixtures/test"

const protectedPages = ["/dashboard", "/support", "/user/edit", "/admin", "/rs23"]

test.describe("Logged-out users are redirected to login", () => {
  test.describe.configure({ mode: "serial" })
  test.use({
    allowedConsoleErrors: [
      "Failed to fetch RSC payload",
      "Failed to load resource: the server responded with a status of 404 (Not Found)",
    ],
  })

  for (const path of protectedPages) {
    test(`redirects ${path}`, async ({ page }) => {
      await page.goto(path)

      await page.waitForURL(/\/auth\/login/)
      await expect(page).toHaveURL(/\/auth\/login/)
      await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeVisible()
    })
  }
})
