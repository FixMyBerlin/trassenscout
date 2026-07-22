import { expect, test } from "@playwright/test"
import { attachRequestFailureCollector } from "../_utils/serverErrors"

type PublicRoute = { path: string; heading: RegExp } | { path: string; breadcrumb: RegExp }

const publicRoutes: PublicRoute[] = [
  { path: "/", heading: /Trassenscout findet Wege/ },
  { path: "/datenschutz", breadcrumb: /Datenschutzerklärung/ },
  { path: "/kontakt", breadcrumb: /Kontakt/ },
  { path: "/auth/login", heading: /In Account einloggen/ },
]

test.describe("public route smoke", () => {
  for (const route of publicRoutes) {
    test(`renders ${route.path}`, async ({ page }) => {
      const consoleErrors: string[] = []
      const requestFailures = attachRequestFailureCollector(page)

      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text())
      })

      await page.goto(route.path)

      await expect(page).toHaveURL(new RegExp(`${route.path === "/" ? "/" : route.path}$`))
      if ("breadcrumb" in route) {
        await expect(
          page.getByRole("navigation", { name: "Breadcrumb" }).getByText(route.breadcrumb),
        ).toBeVisible()
      } else {
        await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible()
      }
      expect(consoleErrors).toEqual([])
      expect(requestFailures).toEqual([])
    })
  }
})
