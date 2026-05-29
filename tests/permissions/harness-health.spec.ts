import { authFile, seedRoles } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const knownNoise = [
  "webglcontextcreationerror",
  "Failed to initialize WebGL",
  "Failed to fetch RSC payload",
]

test.describe("Harness health", () => {
  test.describe("logged-out baseline", () => {
    test.use({
      allowedConsoleErrors: [
        "Failed to fetch RSC payload",
        "Failed to load resource: the server responded with a status of 404 (Not Found)",
        "Element type is invalid: expected a string (for built-in components) or a class/function",
      ],
    })

    test("redirects /dashboard to login", async ({ page }) => {
      await page.goto("/dashboard")

      await page.waitForURL(/\/auth\/login/)
      await expect(page).toHaveURL(/\/auth\/login/)
      await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeVisible({
        timeout: 30_000,
      })
    })
  })

  for (const role of seedRoles) {
    test.describe(`${role} storage state`, () => {
      test.use({ storageState: authFile(role) })
      test.use({ allowedConsoleErrors: knownNoise })

      test("can load /dashboard with authenticated session", async ({ page }) => {
        await page.goto("/dashboard")

        await expect(page).toHaveURL(/\/dashboard$/)
        await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({
          timeout: 30_000,
        })
        await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeHidden()
      })
    })
  }

  test.describe("admin storage state", () => {
    test.use({ storageState: authFile("admin") })
    test.use({ allowedConsoleErrors: knownNoise })

    test("can open /admin", async ({ page }) => {
      await page.goto("/admin")

      await expect(page).toHaveURL(/\/admin$/)
      await expect(page.getByRole("heading", { name: "Trassenscout ADMIN" })).toBeVisible({
        timeout: 30_000,
      })
    })
  })
})
