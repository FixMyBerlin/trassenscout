import { expect, test } from "@playwright/test"
import { attachRequestFailureCollector } from "../_utils/serverErrors"

const publicRoutes = [
  { path: "/", heading: /Trassenscout findet Wege/ },
  { path: "/datenschutz", heading: /Datenschutzerklärung/ },
  { path: "/kontakt", heading: /Kontakt/ },
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
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible()
      expect(consoleErrors).toEqual([])
      expect(requestFailures).toEqual([])
    })
  }
})
