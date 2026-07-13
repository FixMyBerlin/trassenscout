import { expect, test } from "@playwright/test"
import { attachRequestFailureCollector } from "../_utils/serverErrors"

const protectedRoutes = [
  { path: "/dashboard", name: "dashboard" },
  { path: "/admin", name: "admin" },
]

test.describe("auth guard smoke", () => {
  for (const route of protectedRoutes) {
    test(`redirects unauthenticated users from ${route.name}`, async ({ page }) => {
      const requestFailures = attachRequestFailureCollector(page)

      await page.goto(route.path)

      await expect(page).toHaveURL(/\/auth\/login/)
      expect(requestFailures).toEqual([])
    })
  }
})
