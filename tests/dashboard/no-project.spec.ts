import { authFile } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const pageNoise = [
  "webglcontextcreationerror",
  "Failed to initialize WebGL",
  "Failed to fetch RSC payload",
]

test.describe("Dashboard no-project variant", () => {
  test.use({ storageState: authFile("noProject") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows the no-project onboarding state", async ({ page }) => {
    await page.goto("/dashboard")

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByRole("heading", { name: "Noch keiner Trasse zugeordnet", exact: true }),
    ).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      page.getByText("Ein Admin wurde unterrichtet. Sobald Sie einer Trasse zugeordnet wurden,")
    ).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole("heading", { name: "Meine Projekte", exact: true })).toHaveCount(0)
  })
})
