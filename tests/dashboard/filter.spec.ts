import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

/**
 * The project filter belongs to the dashboard, not to one tab. A `<Link>` drops the search
 * unless the route retains it, which is exactly how this broke once: switching tabs silently
 * showed every project again.
 */
test.describe("Dashboard project filter", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("survives a tab switch", async ({ page }) => {
    await page.goto(`/dashboard/activity?projectSlug=${seedProjects.richProject}`)
    await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 30_000 })

    await page.getByRole("link", { name: "Projekte", exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`projectSlug=${seedProjects.richProject}`))
  })

  test("clears from the header and stays cleared", async ({ page }) => {
    await page.goto(`/dashboard?projectSlug=${seedProjects.richProject}`)
    await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 30_000 })

    await page.getByRole("button", { name: "Filter zurücksetzen" }).click()

    await expect(page).not.toHaveURL(/projectSlug/)
  })
})
