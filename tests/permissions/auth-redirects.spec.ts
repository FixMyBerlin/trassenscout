import { expect, test } from "@/tests/_fixtures/test"

const protectedPages = ["/dashboard", "/support", "/user/edit", "/admin", "/rs23"]

test.describe("Logged-out users are redirected to login", () => {
  for (const path of protectedPages) {
    test(`redirects ${path}`, async ({ page }) => {
      await page.goto(path)

      await page.waitForURL(/\/auth\/login/)
      await expect(page).toHaveURL(/\/auth\/login/)
      await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeVisible()
    })
  }
})
